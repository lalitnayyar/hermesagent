# Software Requirements Specification

## Hermes Multi-Agent Business Workflow and Learning Studio

**Project Name:** Hermes AgentFlow Studio
**Document Version:** 2.0
**Deployment Model:** Self-hosted, integrated with the existing Hermes Agent and Hermes Workspace deployment
**Minimum Initial Agents:** 7
**Maximum Agents:** Configurable and expandable
**Local Application Database:** SQLite
**Primary Domains:** Artificial Intelligence, banking operations, telecom infrastructure, IT operations and business-process automation
**Primary Purpose:** Learning, experimentation, agent orchestration, workflow automation and demonstration of enterprise AI use cases

---

# 1. Executive Summary

Hermes AgentFlow Studio will be a visual multi-agent orchestration application connected to the user’s existing Hermes Agent and Hermes Workspace deployment.

The application will not replace Hermes Agent or Hermes Workspace.

Instead:

* Hermes Agent will provide the AI runtime, model access, tools, skills, persistent memory, sessions and task-execution capabilities.
* Hermes Workspace will continue to provide access to Hermes conversations, sessions, memory, skills, tools and jobs.
* Hermes AgentFlow Studio will provide the missing business orchestration layer, including agent definitions, visual workflows, business tasks, dependencies, approval controls, progress tracking, execution governance and reports.
* SQLite will store application-specific configuration and execution data.
* Hermes-native skills and memory will remain managed by Hermes and will be referenced by the orchestration application.

The first implementation will contain seven specialised agents. However, seven must be treated as the initial minimum configuration and not as a technical limitation.

Administrators must be able to add, clone, disable, delete or reconfigure agents without changing the application source code.

Agents must be able to:

1. Work independently.
2. Work sequentially.
3. Work in parallel.
4. Delegate work to another agent.
5. Use outputs produced by another agent.
6. use Hermes skills assigned to them.
7. Access permitted Hermes memory.
8. Create or improve skills from completed work, subject to approval.
9. Maintain isolated or shared sessions.
10. Pause before sensitive actions.
11. Resume after human approval.
12. Report detailed execution progress.
13. Retry failed work.
14. Escalate work to another agent or a human operator.
15. Participate in reusable business workflows.

---

# 2. Existing Environment

The solution must integrate with the already deployed environment containing:

* Hermes Agent container or service.
* Hermes Agent API server.
* Hermes Gateway.
* Hermes Workspace.
* Existing model-provider configuration.
* Existing API keys and environment variables.
* Existing Hermes skills.
* Existing Hermes memory.
* Existing Hermes sessions.
* Existing Hermes tools.
* Existing messaging or notification integrations where configured.
* Existing Docker networking and persistent volumes.

All Hermes URLs, ports and authentication values must be configurable. They must not be hard-coded in the application.

Example configurable settings:

```text
HERMES_API_BASE_URL
HERMES_GATEWAY_URL
HERMES_WORKSPACE_URL
HERMES_API_SERVER_KEY
HERMES_GATEWAY_AUTH_MODE
HERMES_DEFAULT_PROFILE
HERMES_REQUEST_TIMEOUT
HERMES_STREAMING_ENABLED
HERMES_VERIFY_TLS
```

Secrets must be supplied through environment variables, Docker secrets or another protected secrets mechanism. They must not be stored as plain text in SQLite.

---

# 3. Product Positioning

The target solution consists of three cooperating layers.

## 3.1 Hermes Agent Layer

Hermes Agent will remain responsible for:

* Model interaction.
* Agent reasoning.
* Tool invocation.
* Terminal and file operations where permitted.
* Web and external-service tools where configured.
* Persistent memory.
* Reusable skills.
* Sessions and conversations.
* Scheduled Hermes jobs.
* Agent learning capabilities.
* Sub-agent or delegated execution where supported.
* Streaming execution output.

## 3.2 Hermes Workspace Layer

Hermes Workspace will remain the operational interface for:

* General chat with Hermes.
* Viewing conversations.
* Viewing sessions.
* Viewing memory.
* Viewing installed skills.
* Viewing jobs.
* Viewing Hermes tools.
* Direct interaction with the Hermes runtime.
* Troubleshooting individual Hermes sessions.

## 3.3 AgentFlow Orchestration Layer

The new application will provide:

* Business-agent definitions.
* Agent-role and skill mapping.
* Visual workflow design.
* Business-task creation.
* Agent dependencies.
* Sequential and parallel execution.
* Decision routing.
* Approval control.
* Progress monitoring.
* Task-level audit history.
* Workflow versioning.
* Business reports.
* Learning-oriented execution inspection.
* Mapping between a business task and its Hermes sessions.

---

# 4. Integration Modes

The application must support two Hermes integration modes.

## 4.1 Enhanced Gateway Mode

This will be the preferred mode.

The application will communicate through the Hermes Gateway and use gateway-supported functions for:

* Sessions.
* Memory.
* Skills.
* Jobs.
* Tools.
* Agent execution.
* Streaming events.
* Session history.

The system must perform a capability check during startup and identify which endpoints are available.

## 4.2 Portable API Mode

When enhanced gateway functions are unavailable, the application must connect through the Hermes OpenAI-compatible API.

Portable mode will support:

* Chat-completion requests.
* Streaming responses.
* Hermes tool-enabled execution.
* Business-task execution.
* Local workflow tracking.

The following features may be limited in portable mode:

* Direct memory browsing.
* Direct skill management.
* Hermes job management.
* Complete session management.
* Detailed tool discovery.

The application must clearly display the active integration mode:

```text
Hermes Connection: Enhanced Gateway Mode
```

or:

```text
Hermes Connection: Portable API Mode
```

A missing enhanced endpoint must not cause the entire application to fail.

---

# 5. Hermes Connection Management

The application must provide a Hermes Connection screen.

## 5.1 Connection Configuration

The screen must contain:

* Connection name.
* Hermes API URL.
* Hermes Gateway URL.
* Hermes Workspace URL.
* Authentication method.
* API-server key reference.
* Default Hermes profile.
* TLS verification setting.
* Request timeout.
* Streaming setting.
* Health-check interval.
* Active or inactive status.

## 5.2 Connection Test

The application must test:

* Network connectivity.
* Authentication.
* API-server availability.
* Gateway availability.
* Streaming support.
* Sessions endpoint.
* Memory endpoint.
* Skills endpoint.
* Jobs endpoint.
* Tools endpoint.
* Model response.
* Hermes profile availability.

## 5.3 Health Display

The interface must display:

* Hermes Agent status.
* Gateway status.
* Workspace status.
* API mode.
* Last successful health check.
* Response time.
* Active model.
* Active profile.
* Available capabilities.
* Authentication errors.
* Connection errors.

---

# 6. Scalable Agent Architecture

The platform must initially provide seven agents, but its architecture must support additional agents without a redesign.

The following limits must be configurable:

```text
Minimum configured agents: 7
Recommended initial maximum: 25
Technical design target: No fixed application-level limit
Maximum simultaneous executions: Configurable
Maximum parallel agents per task: Configurable
```

The practical execution limit will depend on:

* Available CPU and memory.
* Hermes runtime capacity.
* Model-provider rate limits.
* API token limits.
* Tool concurrency.
* SQLite write concurrency.
* Configured worker capacity.

## 6.1 Agent Creation

Users must be able to:

* Create an agent.
* Clone an existing agent.
* Import an agent definition.
* Export an agent definition.
* Activate or deactivate an agent.
* Assign a Hermes profile.
* Assign Hermes skills.
* Assign memory scope.
* Assign tools.
* Configure an approval policy.
* Configure an execution policy.
* Configure a fallback agent.
* Configure a supervisor agent.

## 6.2 Agent Types

The application should support:

* Specialist agent.
* Supervisor agent.
* Worker agent.
* Reviewer agent.
* Approval-support agent.
* Research agent.
* Execution agent.
* Validation agent.
* Temporary task-specific agent.

---

# 7. Initial Seven Agents

## 7.1 Agent 1: Task Intake and Planning Agent

### Purpose

Receives the business request, identifies its intent, extracts requirements and creates an initial execution plan.

### Hermes Capabilities

* Natural-language task interpretation.
* Session creation.
* Relevant memory search.
* Skill recommendation.
* Workflow recommendation.
* Missing-information identification.

### Skills

* Request classification.
* Entity extraction.
* Priority detection.
* Task decomposition.
* Workflow selection.
* Agent selection.

### Independence

Can independently answer simple classification, planning and routing tasks.

---

## 7.2 Agent 2: Business and Customer Context Agent

### Purpose

Builds the context required by other agents.

### Skills

* Customer-context analysis.
* Product or service mapping.
* Telecom infrastructure mapping.
* Banking-process mapping.
* Historical-session search.
* Document summarisation.
* Related-memory retrieval.

### Memory Access

This agent may access approved:

* Business-domain memory.
* Customer-context memory.
* Environment memory.
* Previous incident summaries.
* Previous workflow lessons.

### Independence

Can perform a standalone business-context or environment-context request.

---

## 7.3 Agent 3: AI Research and Knowledge Agent

### Purpose

Performs AI-focused research, solution analysis and technical knowledge preparation.

### Skills

* AI technology comparison.
* LLM selection.
* Prompt design.
* Retrieval-Augmented Generation design.
* Agentic AI design.
* Model Context Protocol analysis.
* AI architecture evaluation.
* Knowledge-base preparation.
* Technical documentation.

### Use

This agent will make the platform suitable for AI-learning and AI-development use cases, not only banking and telecom workflows.

### Independence

Can independently perform research, comparisons and learning assignments.

---

## 7.4 Agent 4: Technical Diagnostics and Data Agent

### Purpose

Analyses logs, events, database records, alarms, metrics, configurations and technical evidence.

### Skills

* Log analysis.
* SQL generation.
* SQLite queries.
* Telecom alarm correlation.
* Application incident analysis.
* Banking-transaction analysis.
* Root-cause analysis.
* Data validation.
* Configuration comparison.

### Independence

Can independently analyse files, logs or datasets when complete input is supplied.

---

## 7.5 Agent 5: Risk, Security and Compliance Agent

### Purpose

Reviews proposed actions for security, privacy, operational risk and policy compliance.

### Skills

* Security review.
* Sensitive-data detection.
* Approval-rule evaluation.
* Change-control validation.
* Banking control validation.
* Telecom operational-risk assessment.
* Tool-risk assessment.
* Data-masking validation.

### Special Authority

This agent may:

* Require approval.
* Block an execution.
* Request more evidence.
* Reduce tool permissions.
* Route the task to a human reviewer.

---

## 7.6 Agent 6: Solution, Workflow and Execution Agent

### Purpose

Produces the implementation plan and performs approved tool-based actions.

### Skills

* Solution design.
* Workflow generation.
* Script preparation.
* API invocation.
* SQL execution.
* File generation.
* Ticket update.
* Notification generation.
* Configuration action.
* Rollback execution.

### Execution Restriction

The agent must not execute sensitive actions unless:

* The workflow permits automatic execution, or
* Required approval has been received.

---

## 7.7 Agent 7: Validation, Reporting and Learning Agent

### Purpose

Validates results, generates reports and captures reusable knowledge.

### Skills

* Result validation.
* Quality review.
* Success-criteria checking.
* Before-and-after comparison.
* Report generation.
* Lesson extraction.
* Skill-improvement recommendation.
* Memory-update recommendation.

### Learning Function

After task completion, this agent should determine:

* What was learned?
* Should a Hermes memory be created or updated?
* Should an existing Hermes skill be improved?
* Should a new Hermes skill be proposed?
* Did the workflow contain unnecessary steps?
* Should another agent be added?
* Which errors should become reusable troubleshooting knowledge?

---

# 8. Hermes Profiles and Agent Isolation

The application must support mapping an AgentFlow agent to a Hermes profile.

A Hermes profile may provide separate:

* Configuration.
* API keys.
* Memory.
* Sessions.
* Skills.
* Gateway state.
* Tool permissions.

## 8.1 Supported Deployment Patterns

### Shared Profile

All seven business agents use one Hermes profile.

Suitable for:

* Initial learning.
* Small demonstrations.
* Shared memory.
* Simple deployment.

### Profile per Agent

Each business agent uses an isolated Hermes profile.

Suitable for:

* Stronger separation.
* Specialised memory.
* Different tools.
* Different model providers.
* Different credentials.

### Profile per Domain

Agents are grouped by profile.

Example:

```text
AI Profile
Banking Profile
Telecom Profile
Security Profile
Execution Profile
```

### Hybrid Model

Some agents share a profile while high-risk agents use isolated profiles.

This should be the recommended architecture for the initial implementation.

---

# 9. Hermes Skill Integration

Hermes skills must be treated as reusable execution knowledge, not merely labels stored in SQLite.

## 9.1 Skill Sources

The application must support:

* Existing installed Hermes skills.
* Bundled Hermes skills.
* Custom local skills.
* Skills installed from approved repositories.
* Skills installed from an approved URL.
* Application-defined business skills.
* Skills generated from successful task experience.

## 9.2 Skill Synchronisation

The application must:

1. Retrieve the available skills from Hermes when enhanced mode is available.
2. Maintain a local cached skill catalogue.
3. Store the Hermes skill identifier and path reference.
4. Display whether the skill is available.
5. Detect missing or removed skills.
6. Allow skills to be mapped to agents and workflow nodes.
7. Refresh the skill catalogue manually or automatically.
8. Record the skill version used during execution.

## 9.3 Skill Categories

Suggested categories:

* AI engineering.
* Prompt engineering.
* RAG.
* Agent design.
* Software development.
* Data analysis.
* SQL.
* Banking operations.
* Telecom infrastructure.
* Incident management.
* Security.
* Compliance.
* Reporting.
* Communication.
* Automation.

## 9.4 Skill Assignment

Each agent may have:

* Required skills.
* Optional skills.
* Default skills.
* Workflow-specific skills.
* Restricted skills.
* Dynamically selected skills.

## 9.5 Skill Learning Lifecycle

The application should support:

```text
Task Experience
    ↓
Lesson Identified
    ↓
Skill Proposal Created
    ↓
Human Review
    ↓
Skill Tested
    ↓
Skill Approved
    ↓
Skill Installed or Updated in Hermes
    ↓
Skill Version Recorded
```

Automatic modification of production skills must be disabled by default.

---

# 10. Hermes Memory Integration

Hermes memory will be the primary persistent AI-memory mechanism.

SQLite must not become a duplicate, uncontrolled copy of all Hermes memory.

## 10.1 Memory Categories

The application should recognise:

* User preferences.
* Environment information.
* Project information.
* Business-domain knowledge.
* Agent-specific knowledge.
* Workflow lessons.
* Incident history.
* Approved operating procedures.
* Tool-usage lessons.
* Rejected or corrected information.

## 10.2 Memory Scope

Every agent must have a configurable memory policy:

* No persistent memory.
* Read-only shared memory.
* Read-and-propose memory.
* Read-and-write approved memory.
* Agent-specific memory.
* Domain-specific memory.
* Task-only temporary memory.

## 10.3 Memory Use During Execution

Before execution, an agent may:

1. Search relevant Hermes memory.
2. Retrieve relevant previous sessions.
3. Load assigned skills.
4. Combine retrieved context with the current workflow input.

After execution, the system may:

1. Propose a memory update.
2. Display the proposed memory.
3. Request approval.
4. Write the approved information to Hermes memory.
5. Store only the memory reference and approval record in SQLite.

## 10.4 Memory Safety

The application must prevent agents from storing:

* Passwords.
* API keys.
* Authentication cookies.
* Full payment-card information.
* Unmasked banking credentials.
* Personal information not required for the task.
* Temporary error messages with no long-term value.
* Unverified model assumptions.
* Rejected conclusions.

---

# 11. Hermes Session Management

Every business task must be associated with one or more Hermes sessions.

## 11.1 Session Strategies

### Shared Task Session

All agents work in one Hermes session.

Advantage:

* Simple context sharing.

Risk:

* Context may become large or noisy.

### Session per Agent

Every agent receives its own Hermes session.

Advantage:

* Better isolation and clearer histories.

Requirement:

* AgentFlow must pass structured outputs between sessions.

### Session per Workflow Node

Every node creates a fresh session.

Advantage:

* Strong isolation and repeatability.

Requirement:

* All required context must be explicitly passed.

### Recommended Default

Use one session per agent execution, with structured task context and selected memory supplied to the session.

## 11.2 Session Tracking

SQLite must store:

* Business task ID.
* Workflow node ID.
* Agent ID.
* Hermes profile.
* Hermes session ID.
* Parent session ID.
* Session creation time.
* Session status.
* Session URL or reference where available.
* Execution result.
* Token or usage information where available.

## 11.3 Workspace Deep Link

Where supported, the task screen should provide:

```text
Open in Hermes Workspace
```

This should open the corresponding Hermes session or the nearest available Workspace view.

---

# 12. Visual Workflow Designer

The application must provide a visual drag-and-drop workflow designer.

## 12.1 Node Types

The designer must include:

* Start.
* End.
* Hermes Agent Task.
* Hermes Skill Task.
* Memory Search.
* Memory Update Proposal.
* Session Search.
* Tool Execution.
* AI Model Task.
* Human Task.
* Approval.
* Decision.
* Parallel Split.
* Parallel Join.
* Subworkflow.
* Retry.
* Delay.
* Hermes Scheduled Job.
* Notification.
* Script.
* API.
* SQL.
* File Input.
* File Output.
* Validation.

## 12.2 Hermes Agent Task Configuration

A Hermes Agent Task node must contain:

* Business agent.
* Hermes profile.
* Hermes connection.
* Model configuration.
* System instructions.
* Task instructions.
* Required skills.
* Optional skills.
* Memory scope.
* Session strategy.
* Tool allowlist.
* Tool denylist.
* Input mapping.
* Output schema.
* Timeout.
* Maximum retries.
* Execution mode.
* Approval mode.
* Fallback agent.
* Confidence threshold.

## 12.3 Dynamic Agent Assignment

A workflow node may use:

* Fixed agent.
* Agent selected by skill.
* Agent selected by domain.
* Agent selected by availability.
* Agent selected by confidence.
* Supervisor-selected agent.
* User-selected agent.

---

# 13. Workflow Execution

The execution engine must:

1. Load the published workflow.
2. Create the business task.
3. Resolve required agents.
4. Confirm agent availability.
5. Confirm Hermes connectivity.
6. Load assigned skills.
7. Retrieve permitted memory.
8. Create or select Hermes sessions.
9. Execute independent nodes immediately.
10. Execute parallel nodes concurrently within configured limits.
11. Wait for dependencies.
12. Pass structured outputs to dependent nodes.
13. Request human approval where required.
14. Continue automatically after approval.
15. Retry failed executions.
16. invoke fallback agents.
17. record Hermes session references.
18. validate task results.
19. propose memory and skill improvements.
20. produce a final report.

---

# 14. Automatic and Approval-Controlled Execution

Every workflow action must support:

* Simulation only.
* Automatic execution.
* Approval before agent execution.
* Approval before tool execution.
* Approval after recommendation.
* Manual execution.
* Maker-checker approval.
* Multi-level approval.

## 14.1 Recommended Learning Default

The default configuration should be:

```text
Agent analysis: Automatic
Memory search: Automatic
Skill loading: Automatic
Recommendation generation: Automatic
External API read: Automatic when allowlisted
Database read: Automatic when allowlisted
Memory write: Approval required
Skill creation or update: Approval required
Database write: Approval required
Infrastructure change: Approval required
Financial action: Approval required
Shell command with change impact: Approval required
```

---

# 15. Learning and Progress Screen

The execution screen must show how the multi-agent task is progressing.

## 15.1 Task Overview

Display:

* Task title.
* Business domain.
* Workflow.
* Workflow version.
* Execution mode.
* Overall status.
* Completion percentage.
* Start time.
* Elapsed time.
* Task owner.
* Current agent.
* Current node.
* Pending approval.

## 15.2 Visual Execution Graph

Node statuses:

* Not started.
* Ready.
* Waiting for dependency.
* Retrieving memory.
* Loading skills.
* Creating Hermes session.
* Queued.
* Running.
* Using tool.
* Waiting for approval.
* Completed.
* Failed.
* Retrying.
* Escalated.
* Skipped.
* Cancelled.

## 15.3 Agent Details

For every execution, display:

* Agent name.
* Hermes profile.
* Hermes session reference.
* Skills loaded.
* Memory references used.
* Tools invoked.
* Input.
* Output.
* Execution summary.
* Confidence score.
* Duration.
* Retry count.
* Approval state.
* Next dependent agent.
* “Open in Hermes Workspace” action.

The screen must show an execution summary and evidence, not hidden internal chain-of-thought.

## 15.4 Learning View

The learning view should explain:

* Why this agent was selected.
* Which skill was selected.
* Which memory helped.
* What dependency was satisfied.
* Why approval was required.
* Why the workflow selected a particular path.
* What output was passed to the next agent.
* What was learned after completion.
* Which memory or skill improvement was proposed.

---

# 16. SQLite Responsibilities

SQLite will store application orchestration information.

It will store:

* Application users and roles.
* Hermes connection definitions without plain-text secrets.
* Business-agent definitions.
* Hermes profile mappings.
* Cached skill metadata.
* Memory references.
* Workflow definitions.
* Workflow versions.
* Workflow nodes and connections.
* Business tasks.
* Node executions.
* Hermes session references.
* Agent-to-agent messages.
* Approval requests.
* Audit records.
* Execution logs.
* Reports.
* Skill-improvement proposals.
* Memory-update proposals.

SQLite will not be the authoritative store for:

* Full Hermes memory.
* Hermes session files.
* Hermes skill files.
* Hermes profile configuration.
* Model-provider secrets.
* Hermes tool credentials.

---

# 17. Additional Database Tables

In addition to the previously defined tables, the following tables are required.

## hermes_connections

```text
id
name
api_base_url
gateway_url
workspace_url
authentication_type
secret_reference
default_profile
integration_mode
streaming_enabled
verify_tls
timeout_seconds
health_status
capabilities_json
last_checked_at
created_at
updated_at
```

## hermes_profiles

```text
id
connection_id
profile_name
description
profile_type
is_default
is_active
capabilities_json
last_synced_at
created_at
updated_at
```

## agent_profiles

```text
id
agent_id
hermes_profile_id
is_primary
configuration_json
created_at
```

## hermes_skills_cache

```text
id
connection_id
profile_id
skill_key
skill_name
description
category
version
source
skill_path
metadata_json
availability_status
last_synced_at
```

## agent_hermes_skills

```text
id
agent_id
hermes_skill_id
assignment_type
priority
is_required
configuration_json
created_at
```

## memory_references

```text
id
connection_id
profile_id
memory_reference
memory_category
scope
summary
sensitivity_level
created_at
last_used_at
```

## memory_update_proposals

```text
id
task_id
node_execution_id
agent_id
profile_id
proposal_type
proposed_content
reason
status
reviewed_by
review_comment
created_at
reviewed_at
applied_at
```

## skill_update_proposals

```text
id
task_id
node_execution_id
agent_id
skill_id
proposal_type
proposed_definition
reason
test_result_json
status
reviewed_by
review_comment
created_at
reviewed_at
applied_at
```

## hermes_sessions

```text
id
task_id
node_execution_id
connection_id
profile_id
agent_id
hermes_session_id
parent_session_id
session_strategy
workspace_reference
status
started_at
completed_at
metadata_json
```

---

# 18. Updated Business Use Cases

The application must contain at least ten templates.

## Use Case 1: AI Solution Architecture Assistant

Agents research a business requirement, recommend an AI architecture, review security, generate a design and prepare an implementation plan.

## Use Case 2: RAG Application Design

Agents analyse document sources, recommend chunking and retrieval methods, design the vector-store approach, review privacy and generate a prototype plan.

## Use Case 3: AI Model and Provider Comparison

Agents collect requirements, compare available models, estimate suitability, review security and produce a recommendation.

## Use Case 4: Prompt and Agent Workflow Optimisation

Agents analyse an existing prompt or workflow, identify weaknesses, test alternatives, review outputs and propose an improved Hermes skill.

## Use Case 5: Banking Customer Complaint Triage

Agents classify the complaint, retrieve context, analyse the issue, review policy, prepare a resolution and create a simulated case.

## Use Case 6: Suspicious Banking Transaction Investigation

Agents evaluate transaction history, risk patterns and compliance requirements before recommending an approved action.

## Use Case 7: Telecom Alarm Correlation

Agents analyse alarms, infrastructure dependencies and logs, produce a root cause and prepare a controlled recovery plan.

## Use Case 8: Telecom Service Degradation

Agents map the affected service, analyse technical evidence, create a troubleshooting plan and validate the result.

## Use Case 9: Application Incident Root-Cause Analysis

Agents correlate logs, changes, errors and previous Hermes memories to create an incident timeline, root cause and prevention plan.

## Use Case 10: Reusable Knowledge and Skill Creation

Agents complete a task, identify reusable knowledge, propose a new Hermes skill, test it and submit it for human approval.

---

# 19. Hermes Workspace Integration Screen

The application must provide a Hermes Workspace section containing:

* Open Hermes Workspace.
* View related Hermes session.
* View agent memory.
* View installed skills.
* View available tools.
* View scheduled jobs.
* Synchronise skills.
* Synchronise profiles.
* Synchronise capabilities.
* Test a Hermes session.
* Display enhanced or portable mode.

The application should avoid rebuilding all Hermes Workspace functionality. It should link to or embed approved Workspace views where technically and securely practical.

---

# 20. API Requirements

The orchestration backend should expose APIs such as:

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
```

---

# 20.1 Mobile Application Integration

The application must provide a mobile-optimised companion experience for monitoring and controlling AgentFlow operations on smartphones and tablets.

## 20.1.1 Mobile Dashboard

The mobile dashboard must provide:

* At-a-glance status of active tasks and workflows.
* Pending approvals requiring immediate attention.
* Quick-filter views: my tasks, escalated, failed, completed today.
* Connection health indicators for Hermes Agent, Gateway, and Workspace.
* Tap-to-drill-down cards for tasks, agents, and workflows.
* Push or in-app notifications for approvals, failures, and completions.

## 20.1.2 Mobile Execution Control

The mobile app must support:

* Browsing active and historical tasks with status, progress percentage, and current agent/node.
* Starting, pausing, resuming, or cancelling tasks, subject to role permissions.
* Viewing a simplified execution graph or timeline.
* Approving or rejecting pending approval requests.
* Reading agent output summaries and structured results.
* Opening the related Hermes Workspace session when available.

## 20.1.3 Mobile Automation

The mobile automation features must include:

* Triggering pre-approved workflows with one-tap quick actions.
* Selecting workflow templates and providing required inputs through mobile forms.
* Viewing and cloning recent automation runs.
* Enabling or disabling scheduled automations, subject to permissions.
* Receiving confirmation and result summaries after automation completion.

## 20.1.4 Mobile Monitoring

The mobile monitoring view must provide:

* Real-time health status for AgentFlow services: backend, worker, frontend, and database.
* Hermes Agent, Gateway, and Workspace reachability indicators.
* Recent alerts and error notifications with severity.
* A read-only activity feed with task, agent, and session references.
* Optional push notifications for critical failures or long-running task completion.

## 20.1.5 Mobile-Specific Requirements

* The mobile interface may be delivered as a Progressive Web App (PWA), responsive web view, or companion native/hybrid app.
* It must reuse the existing AgentFlow backend APIs and authentication.
* It must support secure token storage, session timeout, and biometric or PIN authentication where the device supports it.
* It must use mobile-optimised API payloads and support offline caching of read-only dashboards.
* Deep links must open specific tasks, workflows, or approvals directly.
* Sensitive actions such as approvals and task cancellation must require explicit confirmation.

## 20.1.6 Mobile API Endpoints

The backend must expose mobile-oriented endpoints such as:

```text
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

# 21. Recommended Technical Architecture

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

# 22. Docker Deployment

The new application should be added to the existing Docker environment.

Suggested services:

```text
hermes-agent
hermes-workspace
agentflow-backend
agentflow-worker
agentflow-frontend
```

SQLite should use a persistent mounted volume.

Example conceptual storage:

```text
/opt/data/agentflow/agentflow.db
/opt/data/agentflow/uploads
/opt/data/agentflow/reports
/opt/data/agentflow/logs
```

The application must communicate with Hermes through the internal Docker network. Public exposure of the Hermes API or dashboard should not be required.

---

# 23. Updated MVP

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
16. “Open in Hermes Workspace” functionality where supported.
17. SQLite persistence.
18. Execution reports.
19. One AI workflow.
20. One banking workflow.
21. One telecom workflow.
22. Docker Compose integration.

---

# 24. Updated Acceptance Criteria

The solution will be accepted when:

1. It connects successfully to the deployed Hermes Agent.
2. It identifies whether enhanced gateway features are available.
3. It provides access or navigation to Hermes Workspace.
4. It displays available Hermes profiles.
5. It discovers or synchronises installed Hermes skills.
6. It maps Hermes skills to business agents.
7. It creates at least seven initial agents.
8. It permits additional agents to be added without code changes.
9. It supports shared, domain-specific and isolated Hermes profiles.
10. It allows an agent to search permitted Hermes memory.
11. It records which memory references were used.
12. It creates memory-update proposals.
13. It creates skill-improvement proposals.
14. It requires approval before changing Hermes memory or skills.
15. It visually creates workflows through drag-and-drop.
16. It executes independent agents without unnecessary waiting.
17. It executes dependent agents in the correct order.
18. It supports parallel agent execution.
19. It creates and tracks Hermes sessions.
20. It passes structured outputs between agents.
21. It pauses sensitive activities for approval.
22. It resumes automatically after approval.
23. It displays real-time task progress.
24. It displays the agent, skill, memory reference, tool and session used for every activity.
25. It preserves task state after application restart.
26. It stores orchestration information in SQLite.
27. It generates a complete final report.
28. It runs within the existing Docker deployment.
29. It includes AI, banking and telecom workflow templates.
30. It provides a safe simulation mode for learning.
31. It provides a mobile-optimised experience for dashboard, execution, automation, and monitoring.

---

# 25. Final Product Principle

Hermes AgentFlow Studio must not create another disconnected AI system beside Hermes.

It must use Hermes as its intelligence and execution foundation.

Hermes will provide:

* Intelligence.
* Skills.
* Memory.
* Sessions.
* Tools.
* Learning.
* Model access.

AgentFlow Studio will provide:

* Business structure.
* Agent organisation.
* Workflow control.
* Dependencies.
* Approvals.
* Visibility.
* Governance.
* Reporting.

The initial seven agents form the first working team, not the final boundary. The architecture must allow the system to grow naturally as new business domains, AI capabilities, Hermes profiles, tools and specialised agents are introduced.
