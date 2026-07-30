Hermes AgentFlow Studio
=======================

A modern, responsive web application for the Hermes AgentFlow Studio multi-agent
orchestration platform. It provides a React/TypeScript frontend, FastAPI backend,
SQLite data store, and Docker orchestration for both AgentFlow and the Hermes
agent/gateway.

Tech Stack
----------
- Vite + React 18 + TypeScript
- Tailwind CSS with custom design tokens
- React Router
- Zustand (global state + localStorage persistence)
- @xyflow/react (workflow designer)
- Recharts (monitoring charts)
- vite-plugin-pwa
- FastAPI + SQLAlchemy (backend)
- Docker Compose

Features
--------
1. Workflow designer
   - Drag-and-drop React Flow canvas.
   - Block palette: Start, Agent, Action, Decision, Tool, Output, End.
   - Tool blocks have Tool name and Code fields.
   - Output blocks display workflow test-run results.
   - Run button traces the flow and shows test output.
   - Conditional (diamond) blocks for branching flows.
   - Create, save, publish, and delete workflows.

2. Chat Test
   - Send messages to Hermes and Ollama from the UI.
   - Configurable Hermes Gateway URL, Ollama host, and model.
   - Backend normalizes localhost/127.0.0.1 to Docker-friendly addresses.

3. Settings
   - Persisted Hermes API URL, Hermes Gateway URL, Hermes username/password,
     and Ollama host.
   - Each URL has a Test button that verifies reachability and shows response.
   - Defaults/limits and governance toggles.

4. Activity Logs
   - Dedicated `/logs` page showing the full application activity feed.
   - Filter by Info, Success, Warning, and Error.

5. Hermes agent / gateway integration
   - `manage.sh start-hermes` starts the Hermes Agent/Gateway container.
   - `manage.sh stop-hermes` stops it.
   - AgentFlow backend health check reports Hermes reachability and version.

6. Docker fixes
   - Backend and worker Dockerfiles use correct module paths.
   - `manage.sh` ensures `hermes-network` exists before starting.
   - Hermes is launched in its own Docker project to avoid orphan warnings.

Hermes & Ollama Networking
--------------------------
- AgentFlow backend runs inside Docker.
- Hermes API is exposed on the host at `http://127.0.0.1:8642` and in Docker at
  `http://hermes-agent:8642`.
- Hermes dashboard is exposed on the host at `http://127.0.0.1:9119` and in
  Docker at `http://hermes-agent:9119`.
- Ollama on the host is reachable from Docker via
  `http://host.docker.internal:11434`.
- Start Ollama so Docker can reach it:

      OLLAMA_HOST=0.0.0.0:11434 ollama serve

- Localhost/127.0.0.1 URLs entered in Chat Test/Settings are automatically
  translated to the correct Docker hostnames by the backend.

User Guide
----------
1. Copy the environment file:

       cp .env.example .env

2. Fill in `.env`, especially:
   - `HERMES_API_SERVER_KEY` if your Hermes API is key-protected.
   - `HERMES_NETWORK` pointing to the Docker network with Hermes.

3. Start Hermes:

       ./manage.sh start-hermes

4. Start Ollama on all interfaces (optional):

       OLLAMA_HOST=0.0.0.0:11434 ollama serve

5. Start AgentFlow:

       ./manage.sh start
   or with a full rebuild:

       docker compose -f docker-compose.yml up -d --build

6. Open the UI:

       http://127.0.0.1:3080

7. Verify the backend:

       curl http://127.0.0.1:3080/api/health

Management Scripts
------------------
Interactive container manager (`manage-containers.sh`):

    ./manage-containers.sh    Start/stop/rebuild and view logs for all containers

`manage.sh` commands:

    ./manage.sh deploy        Clone/pull, build and start AgentFlow
    ./manage.sh start         Start AgentFlow services
    ./manage.sh stop          Stop AgentFlow services
    ./manage.sh restart       Restart AgentFlow services
    ./manage.sh status        Show Docker status and health checks
    ./manage.sh logs [svc]    Follow logs (optional service name)
    ./manage.sh shell [svc]   Open a container shell
    ./manage.sh start-hermes  Start Hermes agent/gateway
    ./manage.sh stop-hermes   Stop Hermes agent/gateway
    ./manage.sh backup        Backup SQLite data
    ./manage.sh restore       Restore SQLite data
    ./manage.sh prune         Clean Docker images/volumes

Troubleshooting
---------------
- Hermes `api_server` cannot bind `127.0.0.1:8642`:
  Port 8642 is in use. Stop the conflicting process, or change
  `platforms.api_server.port` in Hermes `config.yaml` and restart:

      ./manage.sh stop-hermes
      ./manage.sh start-hermes

- Ollama `Connection refused` from Chat Test:
  Ollama is not running or is bound only to `127.0.0.1`.
  Start it with `OLLAMA_HOST=0.0.0.0:11434`.

- Hermes chat returns the sign-in page (200):
  `Send to Hermes` is posting to the dashboard.
  Set `HERMES_API_SERVER_KEY` in `.env` and restart the backend container.

Notes
-----
- Application state is persisted to `localStorage`; a version migration keeps
  default URLs up to date when they change.
- The SQLite database is stored in `data/agentflow` (mounted into the backend
  container).
- `docker-compose.hermes.yml` is generated by `manage.sh` and is gitignored.
