#!/usr/bin/env bash
set -euo pipefail

# Hermes AgentFlow Studio management script
# Usage: ./manage.sh [deploy|update|start|stop|restart|status|logs|shell|backup|restore|prune]

REPO_URL="${REPO_URL:-}"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATA_DIR="${PROJECT_DIR}/data/agentflow"
HERMES_COMPOSE_FILE="${PROJECT_DIR}/docker-compose.hermes.yml"
HERMES_NETWORK="${HERMES_NETWORK:-hermes-network}"

check_prereqs() {
  for cmd in docker git curl; do
    if ! command -v "$cmd" &>/dev/null; then
      echo "ERROR: $cmd is not installed."
      exit 1
    fi
  done
}

ensure_hermes_network() {
  if ! docker network ls --format '{{.Name}}' | grep -qx "${HERMES_NETWORK}"; then
    echo "Creating Docker network: ${HERMES_NETWORK}"
    docker network create "${HERMES_NETWORK}"
  fi
}

write_hermes_compose() {
  echo "Writing ${HERMES_COMPOSE_FILE}..."
  cat > "${HERMES_COMPOSE_FILE}" <<'EOF'
services:
  hermes-agent:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-agent
    restart: unless-stopped
    command: ["gateway", "run"]
    env_file:
      - ../../configref/.env
    environment:
      API_SERVER_ENABLED: "true"
      API_SERVER_HOST: "0.0.0.0"
      API_SERVER_PORT: "8642"
      HERMES_UID: "10010"
      HERMES_DASHBOARD: "1"
      HERMES_DASHBOARD_HOST: "0.0.0.0"
      HERMES_DASHBOARD_PORT: "9119"
    ports:
      - "8642:8642"
      - "9119:9119"
    volumes:
      - hermes-agent-data:/opt/data
    networks:
      - hermes-network
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost:8642/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 60s

volumes:
  hermes-agent-data:

networks:
  hermes-network:
    external: true
EOF
}

ensure_repo_url() {
  if [ -z "$REPO_URL" ]; then
    read -rp "Enter the GitHub repository URL: " REPO_URL
    if [ -z "$REPO_URL" ]; then
      echo "ERROR: GitHub URL is required."
      exit 1
    fi
  fi
}

clone_or_pull() {
  ensure_repo_url
  if [ -d "${PROJECT_DIR}/.git" ]; then
    echo "Pulling latest changes from ${REPO_URL}..."
    git -C "$PROJECT_DIR" pull
  else
    echo "Cloning ${REPO_URL} into ${PROJECT_DIR}..."
    git clone "$REPO_URL" "$PROJECT_DIR"
  fi
}

deploy() {
  check_prereqs
  ensure_repo_url
  clone_or_pull
  ensure_hermes_network
  cd "$PROJECT_DIR"
  echo "Building Docker images and starting services..."
  docker compose -f "$COMPOSE_FILE" up -d --build
  echo "Deployment complete. Run './manage.sh status' to verify."
}

update() {
  check_prereqs
  ensure_hermes_network
  cd "$PROJECT_DIR"
  echo "Pulling latest changes..."
  git pull
  echo "Rebuilding and restarting services..."
  docker compose -f "$COMPOSE_FILE" down
  docker compose -f "$COMPOSE_FILE" up -d --build
  echo "Update complete."
}

start() {
  check_prereqs
  ensure_hermes_network
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" up -d
  echo "Started. Frontend: http://localhost:${AGENTFLOW_FRONTEND_PORT:-3080}"
}

stop() {
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down
  echo "Stopped."
}

restart() {
  stop
  start
}

start_hermes() {
  check_prereqs
  ensure_hermes_network
  write_hermes_compose
  cd "$PROJECT_DIR"
  docker compose --project-name hermes -f "$HERMES_COMPOSE_FILE" up -d
  echo "Hermes Agent/Gateway started."
  echo "API:       http://127.0.0.1:8642"
  echo "Dashboard: http://127.0.0.1:9119"
}

stop_hermes() {
  cd "$PROJECT_DIR"
  docker compose --project-name hermes -f "$HERMES_COMPOSE_FILE" down
  echo "Hermes Agent/Gateway stopped."
}

status() {
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" ps
  echo
  echo "Health checks:"
  curl -fsS http://localhost:${AGENTFLOW_FRONTEND_PORT:-3080}/ 2>/dev/null && echo "Frontend OK" || echo "Frontend not reachable"
  curl -fsS http://localhost:${AGENTFLOW_BACKEND_PORT:-8080}/api/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Backend not reachable"
}

logs() {
  cd "$PROJECT_DIR"
  service="${1:-}"
  if [ -n "$service" ]; then
    docker compose -f "$COMPOSE_FILE" logs -f "$service"
  else
    docker compose -f "$COMPOSE_FILE" logs -f
  fi
}

shell() {
  cd "$PROJECT_DIR"
  service="${1:-agentflow-backend}"
  docker compose -f "$COMPOSE_FILE" exec "$service" sh
}

backup() {
  mkdir -p "$BACKUP_DIR"
  stamp=$(date +%Y%m%d-%H%M%S)
  archive="${BACKUP_DIR}/agentflow-${stamp}.tar.gz"
  echo "Backing up ${DATA_DIR} to ${archive}..."
  tar -czf "$archive" -C "$PROJECT_DIR" data/agentflow
  echo "Backup complete: ${archive}"
}

restore() {
  echo "Available backups:"
  ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null || { echo "No backups found."; exit 1; }
  read -rp "Enter backup filename to restore: " file
  if [ ! -f "$BACKUP_DIR/$file" ]; then
    echo "ERROR: backup not found."
    exit 1
  fi
  stop
  echo "Restoring ${file}..."
  rm -rf "${DATA_DIR}.bak"
  mv "$DATA_DIR" "${DATA_DIR}.bak" || true
  mkdir -p "$DATA_DIR"
  tar -xzf "$BACKUP_DIR/$file" -C "$PROJECT_DIR"
  start
  echo "Restore complete."
}

prune() {
  echo "Stopping services and cleaning Docker images/volumes..."
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down -v
  docker system prune -af
  echo "Pruned."
}

menu() {
  echo "Hermes AgentFlow Studio Manager"
  echo "Project: ${PROJECT_DIR}"
  echo "Compose: ${COMPOSE_FILE}"
  echo
  echo "1) deploy       - Clone/pull repo and start"
  echo "2) update       - Pull latest and rebuild"
  echo "3) start        - Start services"
  echo "4) stop         - Stop services"
  echo "5) restart      - Restart services"
  echo "6) status       - Show status and health"
  echo "7) logs         - Follow logs"
  echo "8) shell        - Open container shell"
  echo "9) backup       - Backup SQLite data"
  echo "10) restore     - Restore SQLite data"
  echo "11) prune       - Clean Docker resources"
  echo "12) start-hermes - Start Hermes agent/gateway"
  echo "13) stop-hermes  - Stop Hermes agent/gateway"
  echo
  read -rp "Choose an action [1-13]: " choice
  case "$choice" in
    1) deploy ;;
    2) update ;;
    3) start ;;
    4) stop ;;
    5) restart ;;
    6) status ;;
    7) read -rp "Service name (optional): " svc; logs "$svc" ;;
    8) read -rp "Service name [agentflow-backend]: " svc; shell "${svc:-agentflow-backend}" ;;
    9) backup ;;
    10) restore ;;
    11) prune ;;
    12) start_hermes ;;
    13) stop_hermes ;;
    *) echo "Invalid choice."; exit 1 ;;
  esac
}

main() {
  command="${1:-}"
  shift || true
  case "$command" in
    deploy|update|start|stop|restart|status|backup|restore|prune)
      "$command" "$@"
      ;;
    start-hermes)
      start_hermes "$@"
      ;;
    stop-hermes)
      stop_hermes "$@"
      ;;
    logs|shell)
      "$command" "$@"
      ;;
    ""|-h|--help|help)
      menu
      ;;
    *)
      echo "Unknown command: $command"
      echo "Usage: $0 [deploy|update|start|stop|restart|status|logs|shell|backup|restore|prune|start-hermes|stop-hermes]"
      exit 1
      ;;
  esac
}

main "$@"
