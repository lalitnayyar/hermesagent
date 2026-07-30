# Mandatory Docker Deployment Requirements

## 1. Deployment Standard

Hermes AgentFlow Studio must be deployed entirely through Docker containers.

Manual installation of application dependencies directly on the host operating system must not be required.

The complete platform must be deployable using:

```bash
docker compose up -d
```

The Docker deployment must integrate with the already deployed Hermes Agent and Hermes Workspace containers.

The solution must support deployment on:

* Linux server.
* Ubuntu server.
* Hostinger VPS.
* Windows using Docker Desktop or WSL.
* Local development computer.
* Private cloud virtual machine.

---

# 2. Required Docker Services

The Docker Compose deployment should contain the following services:

```text
hermes-agent
hermes-workspace
agentflow-frontend
agentflow-backend
agentflow-worker
```

Optional future services may include:

```text
agentflow-scheduler
redis
postgresql
reverse-proxy
monitoring
```

SQLite will be used in the initial release, so a separate database container is not required.

---

# 3. Docker Service Responsibilities

## 3.1 hermes-agent

The existing Hermes Agent container will continue to provide:

* AI model execution.
* Hermes sessions.
* Hermes memory.
* Hermes skills.
* Hermes tools.
* Hermes jobs.
* Gateway services.
* API-server access.
* Agent reasoning and tool execution.

The new application must connect to Hermes Agent through the internal Docker network.

---

## 3.2 hermes-workspace

The existing Hermes Workspace container will continue to provide:

* Hermes chat interface.
* Session viewing.
* Memory viewing.
* Skill viewing.
* Job viewing.
* Tool viewing.
* Direct Hermes interaction.
* Troubleshooting of individual sessions.

AgentFlow Studio must provide a configurable link to Hermes Workspace.

---

## 3.3 agentflow-frontend

The frontend container will provide:

* Dashboard.
* Agent management.
* Skill mapping.
* Visual workflow designer.
* Task execution screen.
* Approval screen.
* Task-progress monitoring.
* Reports.
* Hermes connection settings.

Recommended technology:

* React.
* TypeScript.
* React Flow.
* Nginx for serving the production frontend.

---

## 3.4 agentflow-backend

The backend container will provide:

* REST APIs.
* Authentication.
* Agent configuration.
* Workflow management.
* Workflow validation.
* Task creation.
* Approval management.
* SQLite access.
* Hermes integration.
* Session tracking.
* Reporting.
* Audit logging.

Recommended technology:

* Python FastAPI, or
* Node.js with NestJS.

---

## 3.5 agentflow-worker

The worker container will provide:

* Workflow execution.
* Agent invocation.
* Parallel task handling.
* Retry processing.
* Hermes session creation.
* Tool execution coordination.
* Dependency checking.
* Approval waiting and resumption.
* Execution-event publishing.

The worker must use the same shared SQLite database and application storage volume as the backend.

---

# 4. Docker Network Requirements

All containers must communicate through a private Docker bridge network.

Example:

```yaml
networks:
  hermes-agentflow-network:
    driver: bridge
```

The following communication paths must be supported:

```text
agentflow-frontend
        ↓
agentflow-backend
        ↓
agentflow-worker
        ↓
hermes-agent
```

The backend should also be able to access:

```text
hermes-workspace
```

when health checking or generating Workspace links.

The application must use Docker service names for internal communication.

Example:

```text
http://hermes-agent:8642
http://hermes-agent:9119
http://hermes-workspace:3000
http://agentflow-backend:8080
```

Internal Hermes ports should not need to be publicly exposed unless required for administration or troubleshooting.

---

# 5. Persistent Docker Volumes

All important data must survive:

* Container restart.
* Container recreation.
* Docker image upgrade.
* Host reboot.
* Application redeployment.

The deployment must use persistent Docker volumes or host-mounted directories.

Recommended storage layout:

```text
/opt/data/hermes
/opt/data/hermes-workspace
/opt/data/agentflow
```

AgentFlow storage should include:

```text
/opt/data/agentflow/database
/opt/data/agentflow/uploads
/opt/data/agentflow/reports
/opt/data/agentflow/logs
/opt/data/agentflow/backups
```

The SQLite database should be stored at:

```text
/opt/data/agentflow/database/agentflow.db
```

The path must be configurable through an environment variable.

Example:

```text
AGENTFLOW_DATABASE_URL=sqlite:////app/data/database/agentflow.db
```

---

# 6. SQLite Docker Requirements

Because SQLite is file based, the application must carefully manage concurrent writes.

The deployment must:

* Store SQLite on a persistent local filesystem.
* Avoid placing SQLite on an unreliable remote network filesystem.
* Enable SQLite Write-Ahead Logging mode.
* Configure an appropriate busy timeout.
* Use transactions.
* Keep write operations short.
* Use one shared persistent volume between the backend and worker.
* Prevent multiple unrelated application stacks from writing to the same database file.
* Perform database migrations during controlled startup.

Recommended SQLite settings:

```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA busy_timeout=5000;
PRAGMA synchronous=NORMAL;
```

The application architecture should allow migration to PostgreSQL when task volume or concurrent execution grows beyond the practical limits of SQLite.

---

# 7. Docker Environment Configuration

The application must use an `.env` file or Docker secrets for configuration.

Example environment variables:

```env
AGENTFLOW_ENV=production
AGENTFLOW_FRONTEND_PORT=3080
AGENTFLOW_BACKEND_PORT=8080

AGENTFLOW_DATABASE_URL=sqlite:////app/data/database/agentflow.db
AGENTFLOW_LOG_LEVEL=INFO

HERMES_API_BASE_URL=http://hermes-agent:8642
HERMES_GATEWAY_URL=http://hermes-agent:9119
HERMES_WORKSPACE_URL=http://hermes-workspace:3000

HERMES_API_SERVER_KEY=
HERMES_DEFAULT_PROFILE=default
HERMES_REQUEST_TIMEOUT=300
HERMES_STREAMING_ENABLED=true
HERMES_VERIFY_TLS=false

AGENTFLOW_SECRET_KEY=
AGENTFLOW_ADMIN_USERNAME=
AGENTFLOW_ADMIN_PASSWORD=

AGENTFLOW_SIMULATION_MODE=true
AGENTFLOW_MAX_PARALLEL_AGENTS=7
AGENTFLOW_MAX_CONFIGURED_AGENTS=25
```

Secrets must not be committed to Git.

The deployment package must include:

```text
.env.example
```

The `.env.example` file must contain variable names and safe example values, but must not contain actual credentials.

---

# 8. Docker Secrets

Sensitive values should preferably be supplied using Docker secrets.

Examples:

* Hermes API server key.
* Application secret key.
* Initial administrator password.
* Model-provider API keys.
* External integration credentials.
* SMTP credentials.
* Webhook secrets.

The application should support reading secrets from files.

Example:

```text
/run/secrets/hermes_api_server_key
/run/secrets/agentflow_secret_key
```

---

# 9. Docker Compose Structure

A single Docker Compose project should be provided for the complete deployment.

The Compose file should either:

1. Include Hermes Agent, Hermes Workspace and AgentFlow services in one file, or
2. Connect AgentFlow to the external Docker network already used by the existing Hermes deployment.

Example high-level structure:

```yaml
services:
  hermes-agent:
    image: nousresearch/hermes-agent:latest
    restart: unless-stopped
    networks:
      - hermes-agentflow-network

  hermes-workspace:
    image: configured-hermes-workspace-image
    restart: unless-stopped
    depends_on:
      - hermes-agent
    networks:
      - hermes-agentflow-network

  agentflow-backend:
    image: hermes-agentflow-backend:latest
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data/agentflow:/app/data
    depends_on:
      - hermes-agent
    networks:
      - hermes-agentflow-network

  agentflow-worker:
    image: hermes-agentflow-worker:latest
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data/agentflow:/app/data
    depends_on:
      - agentflow-backend
      - hermes-agent
    networks:
      - hermes-agentflow-network

  agentflow-frontend:
    image: hermes-agentflow-frontend:latest
    restart: unless-stopped
    depends_on:
      - agentflow-backend
    networks:
      - hermes-agentflow-network

networks:
  hermes-agentflow-network:
    driver: bridge
```

The final Compose file must be adjusted to match the ports, image names, volumes and network names of the existing Hermes deployment.

---

# 10. Existing Hermes Deployment Integration

The deployment must not create duplicate Hermes Agent or Hermes Workspace services when those containers are already running.

The installation must support an external Docker network.

Example:

```yaml
networks:
  hermes-network:
    external: true
```

The AgentFlow containers should join the same existing network:

```yaml
services:
  agentflow-backend:
    networks:
      - hermes-network

  agentflow-worker:
    networks:
      - hermes-network

networks:
  hermes-network:
    external: true
```

The deployment documentation must explain how to identify the current Hermes Docker network:

```bash
docker inspect hermes-agent
```

or:

```bash
docker network ls
```

The AgentFlow deployment should then use the existing network name.

---

# 11. Container Health Checks

Every service must include a health check.

## Backend Health Check

```text
GET /health
```

The backend health response should report:

* Application status.
* Database status.
* Hermes API status.
* Hermes Gateway status.
* Workspace reachability.
* Worker status.
* Application version.

## Worker Health Check

The worker must report:

* Worker process status.
* Last heartbeat.
* Active executions.
* Queue status.
* Hermes connectivity.

## Frontend Health Check

The frontend must expose a basic HTTP health endpoint or return a successful response from its root page.

## Hermes Health Check

AgentFlow must check Hermes Agent availability without restarting Hermes automatically unless explicitly configured.

---

# 12. Container Startup Order

The recommended startup sequence is:

```text
Hermes Agent
    ↓
Hermes Workspace
    ↓
AgentFlow Backend
    ↓
AgentFlow Worker
    ↓
AgentFlow Frontend
```

Docker `depends_on` may be used, but the application must not depend only on container startup order.

Each service must retry connections until its dependency becomes healthy.

---

# 13. Restart and Recovery Requirements

All services must use:

```yaml
restart: unless-stopped
```

After a host or container restart:

* The SQLite database must remain available.
* In-progress tasks must be recovered.
* Running nodes must be checked.
* Orphaned executions must be marked appropriately.
* Safe activities may be retried.
* Sensitive activities must not be automatically repeated when their execution status is uncertain.
* Pending approvals must remain pending.
* Hermes session references must remain linked to the task.
* Completed task history must remain available.

---

# 14. Docker Image Requirements

Separate production images should be created for:

* Frontend.
* Backend.
* Worker.

Images should:

* Use small base images.
* Run as a non-root user where practical.
* Use multi-stage builds.
* Include only required runtime dependencies.
* Avoid embedding secrets.
* Include application version labels.
* Support health checks.
* Use pinned major or minor dependency versions.
* Store application data outside the container filesystem.

Example image names:

```text
hermes-agentflow-frontend:1.0.0
hermes-agentflow-backend:1.0.0
hermes-agentflow-worker:1.0.0
```

---

# 15. Reverse Proxy Requirements

The solution should support deployment behind:

* Traefik.
* Nginx.
* Caddy.
* Another existing HTTPS reverse proxy.

Suggested routes:

```text
https://agentflow.example.com
https://agentflow.example.com/api
https://hermes-workspace.example.com
```

Only the frontend or reverse proxy should normally be publicly exposed.

Backend, worker, SQLite and Hermes internal services should remain on the private Docker network.

---

# 16. Backup Requirements

The deployment must include a backup process for:

* SQLite database.
* Uploaded files.
* Generated reports.
* Workflow exports.
* Application configuration.
* Hermes-related references.

A safe SQLite backup must be used rather than copying the database file during uncontrolled writes.

Recommended backup command:

```bash
sqlite3 /app/data/database/agentflow.db \
".backup '/app/data/backups/agentflow-backup.db'"
```

Backups should include a date and time in their filename.

Example:

```text
agentflow-2026-07-29-1415.db
```

Backup retention must be configurable.

---

# 17. Upgrade Requirements

Application upgrades should follow:

```bash
docker compose pull
docker compose up -d
```

or, for locally built images:

```bash
docker compose build
docker compose up -d
```

Before an upgrade, the deployment process must:

1. Back up the SQLite database.
2. Back up application configuration.
3. Confirm the Hermes connection settings.
4. Run database migrations.
5. Start the updated containers.
6. Perform health checks.
7. Confirm workflows and task history remain available.

Rollback instructions must also be documented.

---

# 18. Logging Requirements

Containers must write logs to standard output and standard error.

Logs should be viewable using:

```bash
docker compose logs -f
```

The following commands should work:

```bash
docker compose logs -f agentflow-backend
docker compose logs -f agentflow-worker
docker compose logs -f agentflow-frontend
```

Structured logs should include:

* Timestamp.
* Task ID.
* Workflow ID.
* Node ID.
* Agent ID.
* Hermes session ID.
* Log level.
* Event type.
* Error details.

Sensitive data and API keys must not appear in logs.

---

# 19. Resource Controls

Docker resource limits should be configurable.

Example:

```yaml
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 512M
```

The worker must support configurable concurrency:

```env
AGENTFLOW_WORKER_CONCURRENCY=4
AGENTFLOW_MAX_PARALLEL_AGENTS=7
```

The initial configuration should allow seven agents to participate in a workflow, while limiting simultaneous model calls according to server and provider capacity.

Adding more configured agents must not automatically mean that all agents execute simultaneously.

---

# 20. Docker Security Requirements

The deployment must:

* Avoid privileged containers.
* Avoid mounting the Docker socket unless absolutely required.
* Run containers as non-root where possible.
* Use read-only filesystems where practical.
* Mount only required directories.
* Keep secrets outside images.
* Use internal networks for backend services.
* Expose only necessary ports.
* Validate uploaded files.
* Restrict shell and infrastructure tools.
* Record all sensitive executions.
* Require approval for dangerous operations.

Hermes tool access must be governed through agent and workflow policies even when the Hermes container technically has access to a tool.

---

# 21. Deployment Package

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
```

It must also include:

```text
frontend/Dockerfile
backend/Dockerfile
worker/Dockerfile
```

Database migration scripts and initial sample data must be included.

---

# 22. Docker Deployment Acceptance Criteria

Docker deployment will be accepted when:

1. The complete AgentFlow application starts using Docker Compose.
2. No manual host-level installation of Node.js, Python or application libraries is required.
3. AgentFlow connects to the existing Hermes Agent container.
4. AgentFlow provides a link to the existing Hermes Workspace.
5. Existing Hermes containers do not need to be duplicated.
6. AgentFlow can join the existing Hermes Docker network.
7. All internal service communication uses Docker service names.
8. SQLite data survives container recreation.
9. Uploads, reports and logs survive container recreation.
10. Seven or more agents can be configured.
11. Additional agents can be added through the user interface.
12. The backend, worker and frontend containers have health checks.
13. Containers automatically restart after a host reboot.
14. Pending tasks and approvals survive restart.
15. Sensitive tasks are not unintentionally executed twice after recovery.
16. The application supports `.env` configuration.
17. Secrets are not included in Docker images.
18. The application can be deployed behind an HTTPS reverse proxy.
19. Database backup and restore procedures are documented.
20. Upgrade and rollback procedures are documented.
21. Docker logs provide task, workflow, node, agent and Hermes session references.
22. The deployment supports both local learning and VPS-hosted operation.

---

# 23. Revised Mandatory MVP Requirement

Docker-based deployment is a mandatory part of the Minimum Viable Product.

The MVP is not complete unless it includes:

* Production-ready Dockerfiles.
* Docker Compose deployment.
* Persistent SQLite storage.
* Integration with the existing Hermes Docker network.
* Hermes Agent connectivity.
* Hermes Workspace navigation.
* Container health checks.
* Restart and recovery handling.
* Environment-variable configuration.
* Backup and restore instructions.
* Deployment and troubleshooting documentation.

The desired installation experience should be:

```bash
git clone <repository>
cd hermes-agentflow
cp .env.example .env
docker compose up -d
```

After startup, the user should be able to open AgentFlow Studio, test the Hermes connection, synchronise Hermes profiles and skills, configure at least seven agents, create a visual workflow and run a task.
