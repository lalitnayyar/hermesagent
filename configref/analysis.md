# Hermes AgentFlow Studio — Final Product Requirement

> **Document Type:** Consolidated final product requirement  
> **Synthesized from:** `configref/requirement.md`, `configref/dockererquirement.md`, `configref/docker.yaml`, `configref/.env`  
> **Product Name:** Hermes AgentFlow Studio  
> **Document Version:** 2.0-FINAL  

---

## 1. Product Identity

| Attribute | Value |
|-----------|-------|
| **Project Name** | Hermes AgentFlow Studio |
| **Deployment Model** | Self-hosted, Docker-only, integrated with the existing Hermes Agent and Hermes Workspace containers |
| **Local Application Database** | SQLite with WAL and persistent Docker volume |
| **Minimum Initial Agents** | 7 (not a technical limit) |
| **Primary Domains** | Artificial Intelligence, banking operations, telecom infrastructure, IT operations, business-process automation |
| **Primary Purpose** | Learning, experimentation, agent orchestration, workflow automation, and demonstration of enterprise AI use cases |

### 1.1 Core Value Proposition

Hermes AgentFlow Studio is a visual multi-agent orchestration layer that sits **beside**, not in place of, the existing Hermes Agent and Hermes Workspace deployment.

- **Hermes Agent** remains the AI runtime: models, tools, skills, memory, sessions.
- **Hermes Workspace** remains the operational interface for direct Hermes interaction.
- **AgentFlow Studio** adds business structure: agent definitions, visual workflows, business tasks, dependencies, approval controls, progress tracking, governance, and reporting.

---

## 2. Existing Environment and Assumptions

The following context is derived from `configref/docker.yaml` and `configref/.env`.

### 2.1 Existing Hermes Deployment

| Component | Image / Setting |
|-----------|-----------------|
| **Hermes Agent** | `nousresearch/hermes-agent:latest` |
| **Hermes Workspace** | `ghcr.io/outsourc-e/hermes-workspace:latest` |
| **Hermes Agent command** | `gateway run` |
| **Hermes API server** | `0.0.0.0:8642` |
| **Hermes Dashboard** | `127.0.0.1:9119` (internal) |
| **Public dashboard proxy** | `0.0.0.0:9120` (via Traefik) |
| **Hermes Workspace port** | `3001` (because the agent uses `3000`) |
| **Workspace network mode** | `service:hermes-agent` (shares network namespace with agent) |
| **Internal exposed ports** | `8642`, `9119`, `9120`, `3000`, `3001` |
| **Persistent volumes** | `hermes-agent-data`, `hermes-workspace-files` |
| **Reverse proxy** | Traefik, with `COMPOSE_PROJECT_NAME` and `TRAEFIK_HOST` labels |

### 2.2 Assumptions for AgentFlow

- AgentFlow must **join the same Docker network** that Hermes Agent uses.
- AgentFlow must **not duplicate** the Hermes Agent or Hermes Workspace containers.
- All Hermes URLs, ports, and authentication values are **configurable** and **not hard-coded**.
- Secrets are supplied via environment variables, Docker secrets, or a protected secret manager — never as plain text in SQLite or images.
- Hermes Agent provides an OpenAI-compatible API at `/v1/chat/completions` and a gateway on port `9119`.
- The default workspace URL is `http://hermes-workspace:3001`.

---

## 3. Product Positioning: Three Layers

### 3.1 Hermes Agent Layer

- Model interaction, reasoning, tool invocation, terminal/file operations, web tools.
- Persistent memory, reusable skills, sessions, conversations, scheduled jobs.
- Streaming execution output, sub-agent/delegated execution, learning.

### 3.2 Hermes Workspace Layer

- General chat with Hermes.
- Viewing conversations, sessions, memory, skills, jobs, and tools.
- Direct interaction with the Hermes runtime.
- Troubleshooting of individual Hermes sessions.

### 3.3 AgentFlow Orchestration Layer (new)

- Business-agent definitions and role-to-skill mapping.
- Visual workflow design with drag-and-drop.
- Business-task creation, dependencies, decision routing.
- Sequential and parallel execution, approval control, progress monitoring.
- Task-level audit history, workflow versioning, business reports, and learning inspection.
- Mapping between a business task and its underlying Hermes sessions.

---

## 4. Integration Modes

### 4.1 Enhanced Gateway Mode (preferred)

- Communicates through Hermes Gateway for sessions, memory, skills, jobs, tools, agent execution, streaming, and session history.
- Startup performs a capability check to identify available endpoints.
- A missing endpoint must **not** cause the entire application to fail.

### 4.2 Portable API Mode (fallback)

- Connects through the Hermes OpenAI-compatible API.
- Supports chat completion, streaming, tool-enabled execution, business-task execution, and local workflow tracking.
- Limited features: direct memory browsing, skill management, job management, complete session management, detailed tool discovery.

### 4.3 Mode Display

The UI must clearly show either:

```text
Hermes Connection: Enhanced Gateway Mode
```

or:

```text
Hermes Connection: Portable API Mode
```

---

## 5. Functional Requirements

### 5.1 Hermes Connection Management

The application must provide a **Hermes Connection** screen that includes:

- Connection name, Hermes API URL, Gateway URL, Workspace URL.
- Authentication method, API-server key reference, default Hermes profile.
- TLS verification, request timeout, streaming setting, health-check interval, active/inactive status.
- A **Test Connection** action that checks:
  - Network connectivity, authentication, API-server and gateway availability.
  - Streaming, sessions, memory, skills, jobs, tools, model response, and profile availability.
- A **Health Display** showing:
  - Hermes Agent, Gateway, and Workspace status.
  - Active integration mode, last health check, response time, active model, active profile.
  - Available capabilities, authentication/connection errors.

### 5.2 Agent Architecture

- Minimum initial agents: **7**.
- No fixed application-level limit; configurable target up to **25+** agents.
- Administrators can add, clone, disable, delete, or reconfigure agents without code changes.
- Agent types: specialist, supervisor, worker, reviewer, approval-support, research, execution, validation, and temporary task-specific agents.

### 5.3 The Seven Initial Agents

| # | Agent | Purpose | Key Skills |
|---|-------|---------|------------|
| 1 | **Task Intake and Planning** | Interpret requests, extract requirements, create execution plans. | Classification, entity extraction, priority detection, task decomposition, workflow/agent selection. |
| 2 | **Business and Customer Context** | Build context for other agents. | Customer context, product/service mapping, telecom and banking process mapping, memory retrieval, document summarisation. |
| 3 | **AI Research and Knowledge** | AI-focused research and solution analysis. | LLM selection, prompt design, RAG design, agentic AI design, MCP analysis, architecture evaluation. |
| 4 | **Technical Diagnostics and Data** | Analyse logs, events, records, alarms, metrics, configurations. | Log/SQL/SQLite analysis, alarm correlation, incident analysis, root-cause analysis, data validation. |
| 5 | **Risk, Security and Compliance** | Review proposed actions for risk, privacy, compliance. | Security review, sensitive-data detection, approval-rule evaluation, change-control validation, tool-risk assessment. |
| 6 | **Solution, Workflow and Execution** | Produce implementation plans and perform approved tool actions. | Solution design, workflow generation, script/API/SQL execution, ticket/notification/file generation, rollback. |
| 7 | **Validation, Reporting and Learning** | Validate results, generate reports, capture reusable knowledge. | Result validation, quality review, report generation, lesson extraction, skill-improvement recommendation. |

### 5.4 Agent Capabilities

Every agent must be able to:

1. Work independently.
2. Work sequentially or in parallel.
3. Delegate work to another agent.
4. Use outputs produced by another agent.
5. Use assigned Hermes skills.
6. Access permitted Hermes memory.
7. Create or improve skills from completed work, subject to approval.
8. Maintain isolated or shared sessions.
9. Pause before sensitive actions and resume after human approval.
10. Report detailed execution progress.
11. Retry failed work.
12. Escalate work to another agent or a human operator.
13. Participate in reusable business workflows.

### 5.5 Hermes Profiles and Isolation

- Map each AgentFlow agent to a Hermes profile.
- A profile may provide separate configuration, API keys, memory, sessions, skills, gateway state, and tool permissions.
- Supported patterns: shared profile, profile per agent, profile per domain, and hybrid.
- **Recommended:** hybrid model — shared profiles for most agents, isolated profiles for high-risk agents.

### 5.6 Hermes Skill Integration

Skills must be treated as reusable execution knowledge, not labels.

- Sources: installed Hermes skills, bundled skills, local skills, approved repository/URL skills, application-defined business skills, and skills generated from experience.
- Maintain a local cached skill catalogue with Hermes skill identifier, path, version, and availability status.
- Detect missing or removed skills.
- Map skills to agents and workflow nodes.
- Record skill version used during execution.
- Each agent may have required, optional, default, workflow-specific, restricted, and dynamically selected skills.
- Automatic modification of production skills is **disabled by default**.

### 5.7 Hermes Memory Integration

- Hermes memory is the primary persistent AI-memory mechanism.
- SQLite must **not** duplicate all Hermes memory.
- Memory categories: user preferences, environment, project, business-domain, agent-specific, workflow lessons, incident history, approved procedures, tool-usage lessons, rejected/corrected information.
- Configurable memory policies per agent: none, read-only shared, read-and-propose, read-and-write approved, agent-specific, domain-specific, temporary.
- Before execution: search relevant memory, retrieve previous sessions, load assigned skills, combine with workflow input.
- After execution: propose memory updates, display, request approval, write approved information to Hermes memory, and store only the reference and approval record in SQLite.
- Memory safety: prevent storage of passwords, API keys, cookies, payment data, unmasked banking credentials, unnecessary PII, temporary errors, unverified assumptions, and rejected conclusions.

### 5.8 Hermes Session Management

- Every business task must be associated with one or more Hermes sessions.
- Session strategies: shared task session, session per agent, session per workflow node.
- **Recommended default:** one session per agent execution, with structured task context and selected memory supplied.
- SQLite must store: task ID, node execution ID, agent ID, profile, Hermes session ID, parent session ID, session strategy, workspace reference, status, timestamps, metadata, and execution result.
- Provide **Open in Hermes Workspace** deep links where supported.

### 5.9 Visual Workflow Designer

The designer must include the following node types:

- **Flow:** Start, End, Decision, Parallel Split, Parallel Join, Subworkflow, Retry, Delay.
- **Agent / AI:** Hermes Agent Task, Hermes Skill Task, AI Model Task.
- **Hermes:** Memory Search, Memory Update Proposal, Session Search, Tool Execution, Hermes Scheduled Job.
- **Action:** Human Task, Approval, Notification, Script, API, SQL, File Input, File Output, Validation.

A **Hermes Agent Task** node must allow configuration of:

- Business agent, Hermes profile, connection, model config.
- System and task instructions.
- Required/optional skills, memory scope, session strategy.
- Tool allowlist/denylist, input mapping, output schema.
- Timeout, maximum retries, execution mode, approval mode, fallback agent, confidence threshold.

### 5.10 Workflow Execution

The execution engine must:

1. Load the published workflow.
2. Create the business task and resolve required agents.
3. Confirm agent availability and Hermes connectivity.
4. Load assigned skills and retrieve permitted memory.
5. Create or select Hermes sessions.
6. Execute independent nodes immediately and parallel nodes within configured limits.
7. Wait for dependencies and pass structured outputs.
8. Request human approval where required and continue after approval.
9. Retry failed executions and invoke fallback agents.
10. Record Hermes session references, validate results, propose memory/skill improvements, and produce a final report.

### 5.11 Execution Modes

Every workflow action must support:

- Simulation only.
- Automatic execution.
- Approval before agent execution.
- Approval before tool execution.
- Approval after recommendation.
- Manual execution.
- Maker-checker approval.
- Multi-level approval.

**Recommended learning default:**

| Action | Default |
|--------|---------|
| Agent analysis | Automatic |
| Memory search | Automatic |
| Skill loading | Automatic |
| Recommendation generation | Automatic |
| External API read (allowlisted) | Automatic |
| Database read (allowlisted) | Automatic |
| Memory write | Approval required |
| Skill creation/update | Approval required |
| Database write | Approval required |
| Infrastructure change | Approval required |
| Financial action | Approval required |
| Shell command with change impact | Approval required |

### 5.12 Learning and Progress Screen

The execution screen must display:

- Task title, domain, workflow, version, mode, overall status, completion percentage.
- Start/elapsed time, task owner, current agent, current node, pending approvals.
- A visual execution graph with node statuses:
  - Not started, ready, waiting for dependency, retrieving memory, loading skills, creating session, queued, running, using tool, waiting for approval, completed, failed, retrying, escalated, skipped, cancelled.
- Per-agent details: name, profile, session reference, skills, memory references, tools, input, output, summary, confidence, duration, retry count, approval state, next dependent agent, and **Open in Hermes Workspace**.
- A learning view explaining why an agent, skill, or memory was selected, why approval was required, and what was learned.

### 5.13 Reporting and Workspace Integration

- The UI must provide a Hermes Workspace section: open Workspace, view related sessions, memory, skills, tools, jobs, and synchronise skills/profiles/capabilities.
- Generate execution reports with evidence, not hidden chain-of-thought.
- Support workspace deep links and embedded views where secure.

### 5.14 Mobile Application Integration

The mobile experience must provide secure, real-time access to AgentFlow for dashboard, execution, automation, and monitoring on smartphones and tablets. It may be delivered as a Progressive Web App (PWA), responsive web view, or companion native/hybrid app, and must reuse the existing AgentFlow backend APIs.

**Mobile Dashboard:**
- At-a-glance status of active tasks, workflows, and pending approvals.
- Quick filters: my tasks, escalated, failed, completed today.
- Connection health indicators for Hermes Agent, Gateway, and Workspace.
- Tap-to-drill-down cards and push/in-app notifications for approvals, failures, and completions.

**Mobile Execution Control:**
- Browse active and historical tasks with status, progress, current agent/node, and approval state.
- Start, pause, resume, or cancel tasks subject to role permissions.
- View a simplified execution graph/timeline and per-agent output summaries.
- Approve or reject pending requests with explicit confirmation.
- Open the related Hermes Workspace session when available.

**Mobile Automation:**
- Trigger pre-approved workflows with one-tap quick actions.
- Select workflow templates and supply required inputs through mobile forms.
- View and clone recent automation runs.
- Enable or disable scheduled automations subject to permissions.
- Receive confirmation and result summaries after completion.

**Mobile Monitoring:**
- Real-time health status for AgentFlow services (backend, worker, frontend, database).
- Hermes Agent, Gateway, and Workspace reachability indicators.
- Recent alerts and error notifications with severity.
- Read-only activity feed keyed by task, agent, and session references.
- Optional push notifications for critical failures or long-running task completion.

**Mobile-Specific Requirements:**
- Secure token storage, session timeout, and biometric/PIN authentication where supported.
- Mobile-optimised API payloads and offline caching of read-only dashboards.
- Deep links into specific tasks, workflows, or approvals.
- Explicit confirmation for sensitive actions such as approvals and task cancellation.

---

## 6. Data and Persistence

### 6.1 SQLite Responsibilities

SQLite is the application orchestration database. It stores:

- Application users and roles.
- Hermes connection definitions (without plain-text secrets).
- Business-agent definitions, profile mappings, and cached skill metadata.
- Memory references and update proposals.
- Workflow definitions, versions, nodes, and connections.
- Business tasks, node executions, Hermes session references.
- Agent-to-agent messages, approval requests, audit records, execution logs, reports, and skill-improvement proposals.

SQLite must **not** be the authoritative store for:

- Full Hermes memory, session files, skill files, profile configuration.
- Model-provider secrets or Hermes tool credentials.

### 6.2 Database Settings

```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA busy_timeout=5000;
PRAGMA synchronous=NORMAL;
```

The architecture must allow migration to PostgreSQL when SQLite concurrency limits are exceeded.

### 6.3 Key Database Tables

- `hermes_connections`
- `hermes_profiles`
- `agent_profiles`
- `hermes_skills_cache`
- `agent_hermes_skills`
- `memory_references`
- `memory_update_proposals`
- `skill_update_proposals`
- `hermes_sessions`

---

## 7. API Surface

The orchestration backend exposes the following API groups:

```text
GET    /api/hermes/connections
POST   /api/hermes/connections
POST   /api/hermes/connections/{id}/test
GET    /api/hermes/connections/{id}/capabilities

GET    /api/hermes/profiles
POST   /api/hermes/profiles/sync

GET    /api/hermes/skills
POST   /api/hermes/skills/sync
POST   /api/hermes/skills/{id}/test

GET    /api/hermes/memory/references
POST   /api/hermes/memory/search
POST   /api/hermes/memory/proposals
POST   /api/hermes/memory/proposals/{id}/approve

GET    /api/agents
POST   /api/agents
PUT    /api/agents/{id}
POST   /api/agents/{id}/test

GET    /api/workflows
POST   /api/workflows
POST   /api/workflows/{id}/validate
POST   /api/workflows/{id}/publish

POST   /api/tasks
POST   /api/tasks/{id}/start
POST   /api/tasks/{id}/pause
POST   /api/tasks/{id}/resume
POST   /api/tasks/{id}/cancel
GET    /api/tasks/{id}/progress
GET    /api/tasks/{id}/sessions
GET    /api/tasks/{id}/timeline

POST   /api/approvals/{id}/approve
POST   /api/approvals/{id}/reject

GET    /api/skill-proposals
POST   /api/skill-proposals/{id}/approve

# Mobile
GET    /api/mobile/dashboard
GET    /api/mobile/tasks
GET    /api/mobile/tasks/{id}
POST   /api/mobile/tasks/{id}/start
POST   /api/mobile/tasks/{id}/pause
POST   /api/mobile/tasks/{id}/resume
POST   /api/mobile/tasks/{id}/cancel
GET    /api/mobile/tasks/{id}/timeline
GET    /api/mobile/approvals
POST   /api/mobile/approvals/{id}/approve
POST   /api/mobile/approvals/{id}/reject
GET    /api/mobile/workflows
POST   /api/mobile/workflows/{id}/trigger
GET    /api/mobile/health
GET    /api/mobile/notifications
POST   /api/mobile/notifications/register
POST   /api/mobile/notifications/deregister
```

---

## 8. Deployment and Operations

### 8.1 Docker-First Deployment

- The application must be deployable with `docker compose up -d`.
- No manual installation of Node.js, Python, or application libraries on the host.
- Supports Linux, Ubuntu, Hostinger VPS, Windows (Docker Desktop / WSL), local development, and private cloud VMs.

### 8.2 Required Docker Services

```text
hermes-agent
hermes-workspace
agentflow-frontend
agentflow-backend
agentflow-worker
```

Optional future services:

```text
agentflow-scheduler
redis
postgresql
reverse-proxy
monitoring
```

### 8.3 Service Responsibilities

| Service | Responsibility | Recommended Tech |
|---------|----------------|------------------|
| `hermes-agent` | Existing AI runtime, sessions, memory, skills, tools, jobs, gateway. | `nousresearch/hermes-agent:latest` |
| `hermes-workspace` | Existing chat, session/memory/skill/job/tool views. | `ghcr.io/outsourc-e/hermes-workspace:latest` |
| `agentflow-frontend` | Dashboard, agent/skill/workflow management, execution/progress/approval screens, reports, connection settings, and mobile-optimised/PWA views. | React + TypeScript + React Flow + Nginx |
| `agentflow-backend` | REST APIs, auth, agent/workflow/approval management, SQLite, Hermes integration, session tracking, audit logging. | Python FastAPI or Node.js NestJS |
| `agentflow-worker` | Workflow execution, agent invocation, parallel handling, retries, session creation, approval waiting, event publishing. | Same stack as backend |

### 8.4 Docker Network and Communication

- All containers communicate through a private Docker bridge network.
- Use Docker service names for internal communication:
  - `http://hermes-agent:8642`
  - `http://hermes-agent:9119`
  - `http://hermes-workspace:3001`
  - `http://agentflow-backend:8080`
- The AgentFlow services must join the **existing Hermes network** as an external network to avoid duplicating Hermes.
- Identify the current network with:

```bash
docker inspect hermes-agent
docker network ls
```

### 8.5 Persistent Storage

Recommended host layout:

```text
/opt/data/hermes
/opt/data/hermes-workspace
/opt/data/agentflow
  /database
  /uploads
  /reports
  /logs
  /backups
```

SQLite database path, configurable:

```text
AGENTFLOW_DATABASE_URL=sqlite:////app/data/database/agentflow.db
```

The backend and worker must share the same volume for SQLite.

### 8.6 Health Checks

Every service must include a health check:

- **Backend:** `GET /health` returns application, database, Hermes API, gateway, workspace, worker, and version status.
- **Worker:** reports process status, last heartbeat, active executions, queue status, and Hermes connectivity.
- **Frontend:** basic HTTP health endpoint or successful root response.
- **Hermes:** AgentFlow must check Hermes availability without restarting Hermes.

### 8.7 Startup Order and Resilience

Recommended startup sequence:

```text
Hermes Agent → Hermes Workspace → AgentFlow Backend → AgentFlow Worker → AgentFlow Frontend
```

- Use `depends_on` with health conditions where possible.
- Each service must retry connections until dependencies are healthy.
- All services use `restart: unless-stopped`.

### 8.8 Restart and Recovery

After restart or recreation:

- SQLite database, in-progress tasks, pending approvals, and Hermes session references must survive.
- Running nodes must be checked; orphaned executions marked appropriately.
- Safe activities may be retried.
- Sensitive activities must **not** be automatically repeated when status is uncertain.

### 8.9 Backup and Upgrade

- Back up SQLite, uploads, reports, workflow exports, config, and Hermes references.
- Safe SQLite backup command:

```bash
sqlite3 /app/data/database/agentflow.db \
".backup '/app/data/backups/agentflow-backup.db'"
```

- Backup filenames should include date/time, e.g., `agentflow-2026-07-29-1415.db`.
- Upgrade flow: back up database and config, confirm Hermes settings, run migrations, pull/build images, start containers, run health checks, confirm history remains.
- Document rollback procedures.

### 8.10 Logging and Security

- Containers write logs to `stdout`/`stderr`.
- Structured logs must include timestamp, task/workflow/node/agent/session IDs, level, event type, and error details.
- Secrets and API keys must **never** appear in logs.
- Avoid privileged containers, Docker socket mounts, and running as root.
- Use read-only filesystems where practical.
- Mount only required directories; keep secrets outside images; expose only necessary ports.
- Validate uploaded files; restrict shell and infrastructure tools.
- Record all sensitive executions and require approval for dangerous operations.

### 8.11 Reverse Proxy and HTTPS

Support deployment behind Traefik, Nginx, Caddy, or another HTTPS reverse proxy.

Suggested routes:

```text
https://agentflow.example.com
https://agentflow.example.com/api
https://hermes-workspace.example.com
```

Only the frontend or reverse proxy should be publicly exposed.

### 8.12 Deployment Package

The project must provide:

```text
docker-compose.yml
docker-compose.override.yml
.env.example
README.md
DEPLOYMENT.md
UPGRADE.md
BACKUP_RESTORE.md
TROUBLESHOOTING.md
frontend/Dockerfile
backend/Dockerfile
worker/Dockerfile
```

Plus database migration scripts and initial sample data.

---

## 9. Configuration Reference

### 9.1 Application Settings

| Variable | Example | Purpose |
|----------|---------|---------|
| `AGENTFLOW_ENV` | `production` | Runtime environment |
| `AGENTFLOW_FRONTEND_PORT` | `3080` | Frontend port on host |
| `AGENTFLOW_BACKEND_PORT` | `8080` | Backend port on host |
| `AGENTFLOW_DATABASE_URL` | `sqlite:////app/data/database/agentflow.db` | SQLite connection |
| `AGENTFLOW_LOG_LEVEL` | `INFO` | Logging verbosity |
| `AGENTFLOW_SECRET_KEY` | `<secret>` | Application signing/encryption secret |
| `AGENTFLOW_ADMIN_USERNAME` | `admin` | Initial admin username |
| `AGENTFLOW_ADMIN_PASSWORD` | `<secret>` | Initial admin password |
| `AGENTFLOW_SIMULATION_MODE` | `true` | Default simulation setting |
| `AGENTFLOW_MAX_PARALLEL_AGENTS` | `7` | Max parallel agents |
| `AGENTFLOW_MAX_CONFIGURED_AGENTS` | `25` | Soft max configured agents |
| `AGENTFLOW_WORKER_CONCURRENCY` | `4` | Worker concurrency |

### 9.2 Hermes Connection Settings

| Variable | Example | Purpose |
|----------|---------|---------|
| `HERMES_API_BASE_URL` | `http://hermes-agent:8642` | Hermes OpenAI-compatible API |
| `HERMES_GATEWAY_URL` | `http://hermes-agent:9119` | Hermes Gateway |
| `HERMES_WORKSPACE_URL` | `http://hermes-workspace:3001` | Hermes Workspace |
| `HERMES_API_SERVER_KEY` | `<secret>` | API server key reference |
| `HERMES_DEFAULT_PROFILE` | `default` | Default Hermes profile |
| `HERMES_REQUEST_TIMEOUT` | `300` | Request timeout in seconds |
| `HERMES_STREAMING_ENABLED` | `true` | Enable streaming |
| `HERMES_VERIFY_TLS` | `false` | Verify TLS |

### 9.3 Existing Hermes Environment (from `docker.yaml`)

These are not AgentFlow settings but the values AgentFlow must be compatible with:

| Variable / Setting | Value |
|--------------------|-------|
| Agent image | `nousresearch/hermes-agent:latest` |
| Workspace image | `ghcr.io/outsourc-e/hermes-workspace:latest` |
| Agent command | `gateway run` |
| API server | `0.0.0.0:8642` |
| Dashboard (internal) | `127.0.0.1:9119` |
| Dashboard proxy (public) | `9120` |
| Workspace port | `3001` |
| Volumes | `hermes-agent-data`, `hermes-workspace-files` |
| Reverse proxy labels | Traefik with `COMPOSE_PROJECT_NAME` and `TRAEFIK_HOST` |

---

## 10. Minimum Viable Product (MVP)

The first working release must include:

1. Connection to the existing Hermes Agent.
2. Detection of enhanced or portable API mode.
3. Link to the existing Hermes Workspace.
4. Seven preconfigured agents.
5. Ability to add further agents.
6. Hermes profile mapping.
7. Hermes skill discovery and agent-skill mapping.
8. Controlled Hermes memory search.
9. Memory-update proposals.
10. Visual drag-and-drop workflows.
11. Sequential and parallel execution.
12. Agent-to-agent structured output passing.
13. Human approval.
14. Live task progress.
15. Hermes session tracking.
16. **Open in Hermes Workspace** functionality.
17. SQLite persistence.
18. Execution reports.
19. One AI workflow.
20. One banking workflow.
21. One telecom workflow.
22. Docker Compose integration.

In addition, the Docker MVP must include:

- Production-ready Dockerfiles for frontend, backend, and worker.
- Docker Compose deployment.
- Persistent SQLite storage.
- Integration with the existing Hermes Docker network.
- Hermes Agent connectivity and Workspace navigation.
- Container health checks.
- Restart and recovery handling.
- Environment-variable configuration.
- Backup and restore instructions.
- Deployment and troubleshooting documentation.

Desired installation experience:

```bash
git clone <repository>
cd hermes-agentflow
cp .env.example .env
# edit .env with your secrets and URLs
docker compose up -d
```

After startup, the user should be able to open AgentFlow Studio, test the Hermes connection, synchronise profiles and skills, configure at least seven agents, create a visual workflow, and run a task.

---

## 11. Business Use-Case Templates

The application must contain at least ten workflow templates:

1. **AI Solution Architecture Assistant** — research, recommend, review, and plan an AI architecture.
2. **RAG Application Design** — analyse sources, recommend chunking/retrieval, design vector store, review privacy.
3. **AI Model and Provider Comparison** — compare models and produce a recommendation.
4. **Prompt and Agent Workflow Optimisation** — analyse, test, and improve a Hermes skill.
5. **Banking Customer Complaint Triage** — classify, retrieve context, review policy, prepare resolution.
6. **Suspicious Banking Transaction Investigation** — evaluate history, risk patterns, compliance, and recommend action.
7. **Telecom Alarm Correlation** — analyse alarms, dependencies, logs, produce root cause and recovery plan.
8. **Telecom Service Degradation** — map service, analyse evidence, create troubleshooting plan, validate result.
9. **Application Incident Root-Cause Analysis** — correlate logs/changes/errors and create timeline, root cause, prevention plan.
10. **Reusable Knowledge and Skill Creation** — complete a task, identify reusable knowledge, propose and test a new Hermes skill.

---

## 12. Acceptance Criteria

The final product is accepted when:

1. It connects successfully to the deployed Hermes Agent.
2. It identifies whether enhanced gateway features are available.
3. It provides access or navigation to Hermes Workspace.
4. It displays available Hermes profiles.
5. It discovers or synchronises installed Hermes skills.
6. It maps skills to business agents.
7. It creates at least seven initial agents.
8. It permits additional agents to be added without code changes.
9. It supports shared, domain-specific, and isolated Hermes profiles.
10. It allows an agent to search permitted Hermes memory.
11. It records which memory references were used.
12. It creates memory-update and skill-improvement proposals.
13. It requires approval before changing Hermes memory or skills.
14. It visually creates workflows through drag-and-drop.
15. It executes independent agents without unnecessary waiting.
16. It executes dependent agents in the correct order.
17. It supports parallel agent execution.
18. It creates and tracks Hermes sessions.
19. It passes structured outputs between agents.
20. It pauses sensitive activities for approval and resumes automatically after approval.
21. It displays real-time task progress and per-agent details.
22. It preserves task state after application restart.
23. It stores orchestration information in SQLite.
24. It generates a complete final report.
25. It runs within the existing Docker deployment.
26. It includes AI, banking, and telecom workflow templates.
27. It provides a safe simulation mode for learning.
28. It starts fully via `docker compose up -d` with no host-level dependency installation.
29. SQLite, uploads, reports, and logs survive container recreation.
30. Health checks are present for backend, worker, and frontend.
31. Secrets are not embedded in Docker images.
32. Backup, upgrade, rollback, and troubleshooting procedures are documented.
33. It provides a mobile-optimised experience for dashboard, execution, automation, and monitoring.

---

## 13. Recommended Technical Architecture

```text
Browser
   │
   ├── Hermes AgentFlow Studio
   │       ├── Agent Management
   │       ├── Skill Mapping
   │       ├── Workflow Designer
   │       ├── Task Execution
   │       ├── Approval Management
   │       └── Learning Dashboard
   │
   ├── Hermes Workspace
   │       ├── Chat
   │       ├── Sessions
   │       ├── Memory
   │       ├── Skills
   │       ├── Jobs
   │       └── Tools
   │
   ▼
AgentFlow Backend
   ├── Workflow Engine
   ├── Agent Router
   ├── Approval Engine
   ├── Hermes Adapter
   ├── Session Manager
   ├── Skill Synchroniser
   ├── Memory Governance Service
   ├── Progress Event Service
   └── Reporting Service
   │
   ├──────────────► SQLite
   │
   ▼
Hermes Gateway / API Server
   │
   ▼
Hermes Agent Profiles
   ├── Memory
   ├── Skills
   ├── Sessions
   ├── Tools
   ├── Jobs
   └── Models
```

---

## 14. Final Product Principle

Hermes AgentFlow Studio must **not** create another disconnected AI system beside Hermes.

- **Hermes provides:** intelligence, skills, memory, sessions, tools, learning, and model access.
- **AgentFlow Studio provides:** business structure, agent organisation, workflow control, dependencies, approvals, visibility, governance, and reporting.

The initial seven agents form the first working team, not the final boundary. The architecture must allow the system to grow naturally as new business domains, AI capabilities, Hermes profiles, tools, and specialised agents are introduced.

---

## 15. References

- `configref/requirement.md` — full software requirements specification.
- `configref/dockererquirement.md` — mandatory Docker deployment requirements.
- `configref/docker.yaml` — existing Hermes Agent and Workspace compose definition.
- `configref/.env` — environment configuration (do not commit secrets).
