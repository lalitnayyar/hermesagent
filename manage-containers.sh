#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

status() {
    echo -e "${BLUE}--- Docker container status ---${NC}"
    docker ps --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}' \
        --filter name='agentflow' --filter name='hermes' || true
    echo
}

start_agentflow() {
    echo -e "${GREEN}Starting AgentFlow...${NC}"
    docker compose -f docker-compose.yml up -d
    echo -e "${GREEN}AgentFlow started.${NC}"
}

stop_agentflow() {
    echo -e "${RED}Stopping AgentFlow...${NC}"
    docker compose -f docker-compose.yml down
    echo -e "${RED}AgentFlow stopped.${NC}"
}

rebuild_agentflow() {
    echo -e "${YELLOW}Rebuilding AgentFlow...${NC}"
    docker compose -f docker-compose.yml up -d --build
    echo -e "${GREEN}AgentFlow rebuilt and started.${NC}"
}

start_hermes() {
    echo -e "${GREEN}Starting Hermes...${NC}"
    ./manage.sh start-hermes
    echo -e "${GREEN}Hermes started.${NC}"
}

stop_hermes() {
    echo -e "${RED}Stopping Hermes...${NC}"
    ./manage.sh stop-hermes
    echo -e "${RED}Hermes stopped.${NC}"
}

rebuild_hermes() {
    echo -e "${YELLOW}Rebuilding Hermes...${NC}"
    ./manage.sh stop-hermes
    ./manage.sh start-hermes
    echo -e "${GREEN}Hermes restarted.${NC}"
}

start_all() {
    start_hermes
    start_agentflow
    echo -e "${GREEN}All services started.${NC}"
}

stop_all() {
    stop_agentflow
    stop_hermes
    echo -e "${RED}All services stopped.${NC}"
}

rebuild_all() {
    stop_all
    ./manage.sh start-hermes
    docker compose -f docker-compose.yml up -d --build
    echo -e "${GREEN}All services rebuilt and started.${NC}"
}

logs() {
    echo -e "${BLUE}--- AgentFlow logs ---${NC}"
    docker compose -f docker-compose.yml logs --tail 50
    echo
    echo -e "${BLUE}--- Hermes logs ---${NC}"
    docker logs --tail 50 hermes-agent 2>/dev/null || echo "Hermes container not running."
    echo
}

menu() {
    clear
    status
    PS3=$'\nChoose an action: '
    options=(
        "Start all services"
        "Stop all services"
        "Rebuild all services"
        "Start AgentFlow only"
        "Stop AgentFlow only"
        "Rebuild AgentFlow only"
        "Start Hermes only"
        "Stop Hermes only"
        "View logs"
        "Exit"
    )
    select opt in "${options[@]}"; do
        case $REPLY in
            1) start_all ;;
            2) stop_all ;;
            3) rebuild_all ;;
            4) start_agentflow ;;
            5) stop_agentflow ;;
            6) rebuild_agentflow ;;
            7) start_hermes ;;
            8) stop_hermes ;;
            9) logs ;;
            10) echo "Exiting."; break ;;
            *) echo -e "${RED}Invalid option.${NC}" ;;
        esac
        read -rp $'\nPress Enter to continue...'
        break
    done
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    echo "Usage: ./manage-containers.sh"
    echo "Interactive menu to start, stop, rebuild and inspect AgentFlow + Hermes containers."
    exit 0
fi

while true; do
    menu
    if [[ ! -t 0 ]]; then
        break
    fi
done
