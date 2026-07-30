Hermes AgentFlow Studio
=======================

A modern, responsive web application for the Hermes AgentFlow Studio multi-agent
orchestration platform. It provides a React frontend, FastAPI backend, SQLite
data store, and Docker orchestration for both AgentFlow and the Hermes
agent/gateway.


Tech Stack
----------
- Vite + React 18 + TypeScript
- Tailwind CSS (custom design tokens)
- React Router
- Zustand (global state + persistence)
- @xyflow/react (workflow designer)
- Recharts (monitoring charts)
- vite-plugin-pwa
- FastAPI + SQLAlchemy (backend)
- Docker Compose (orchestration)


Updated Features
----------------
1. Workflow designer improvements
   - Add new workflow blocks from the top toolbar or by dragging from the
     Block Widget (Start, Agent, Action, Decision, Tool, Output, End).
   - Select a block to edit its label, icon (Material Symbols name), color
     (primary / secondary / tertiary), and shape (rounded / diamond) in real time.
   - Tool blocks have a Tool name and a Code / command field.
   - Output blocks display the result of a workflow test run.
   - Run a workflow to trace the flow and see test output.
   - Delete selected blocks (removes attached edges automatically).
   - Save drag/edge changes with the Save button.
   - Create, publish, and delete workflows from the sidebar.
   - Conditional (diamond) blocks for branching flows.

2. Chat Test with Ollama
   - Added an Ollama-powered chat test page (`/chat-test`).
   - Backend endpoint: `POST /api/ollama`.
   - Configurable Ollama host and model; uses the host from Settings by default.

3. Hermes agent / gateway integration
   - `manage.sh start-hermes` starts the Hermes Agent/Gateway container.
   - `manage.sh stop-hermes` stops it.
   - The AgentFlow backend health check reports Hermes reachability and version.
   - Backend `HermesClient` talks to the Hermes API on port 8642.

4. Docker fixes
   - Fixed backend and worker Dockerfiles to use `COPY backend /app/backend` and
     the correct `backend.app.main:app` / `backend.worker` module paths.
   - `manage.sh` now ensures the `hermes-network` exists before starting.
   - Hermes is launched in its own Docker project (`--project-name hermes`) so it
     does not appear as an orphan in the AgentFlow project.


Hermes Access
-------------
Start Hermes:
    ./manage.sh start-hermes

This creates `docker-compose.hermes.yml` (gitignored) and starts:
- Hermes Agent API on `0.0.0.0:8642`
- Hermes dashboard on `http://hermes-agent:9119` (inside Docker)

From the host you can reach the API at:
    http://127.0.0.1:8642

From AgentFlow containers (backend, worker) the service is at:
    http://hermes-agent:8642
    http://hermes-agent:9119

Note: If `127.0.0.1:9119` is already in use by a local Hermes process, the
Docker Hermes dashboard is not bound to the host port. It is still accessible
from the AgentFlow backend on the Docker network.


Application Functionality
-------------------------
- Dashboard (`/`) - live fleet stats, recent running tasks, agent fleet cards.
- Agents (`/agents`) - create, edit, delete, run/pause agents.
- Workflows (`/workflows`) - visual designer with add/edit/delete blocks,
  drag-and-drop React Flow canvas, block widget, conditional diamond blocks,
  conditional approval sample, save, publish, delete workflows.
- Tasks (`/tasks`) - create, run/pause/resume/retry/delete tasks; progress
  auto-simulates to completion.
- Approvals (`/approvals`) - approve/reject requests and view the decision log.
- Automation (`/automation`) - trigger workflows that create tasks and toggle
  scheduled runs.
- Monitor (`/monitor`) - live throughput chart, service health toggle, activity
  feed.
- Mobile (`/mobile`) - mobile companion for approvals, active tasks, quick
  actions.
- Settings (`/settings`) - persisted gateway, Ollama host, limits, and
  governance toggles. Each URL has a Test button to verify reachability before
  saving.
- Chat Test (`/chat-test`) - test Ollama chat locally.


User Guide
----------
1. Copy the environment file:
       cp .env.example .env

2. Fill in any required keys in `.env` (for example `HERMES_API_SERVER_KEY` if
   your Hermes API is key-protected).

3. Start Hermes (optional; only if you want the real Hermes backend):
       ./manage.sh start-hermes

4. Start AgentFlow in one of the following ways:
   - Development (host processes, no Docker):
         # Terminal 1
         bridge/.venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8080
         # Terminal 2
         npm install
         npm run dev
   - Production-style Docker:
         ./manage.sh deploy
   - Quick Docker rebuild after code changes:
         ./manage.sh stop
         docker compose -f docker-compose.yml up -d --build

5. Open the UI:
       http://127.0.0.1:3080

6. Verify backend health (via the Nginx proxy):
       curl http://127.0.0.1:3080/api/health


Management Script (`manage.sh`)
-------------------------------
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


Notes
-----
- AgentFlow state is persisted to `localStorage` in the browser.
- The SQLite database is stored in `data/agentflow` (mounted into the backend
  container).
- `docker-compose.hermes.yml` is generated by `manage.sh` and is gitignored.
- To reach Ollama from the Docker backend, start Ollama with
  `OLLAMA_HOST=0.0.0.0:11434`.
