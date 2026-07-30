# Hermes AgentFlow Studio

A modern, responsive web application for the **Hermes AgentFlow Studio** multi-agent orchestration platform.

It mirrors the dark technical design language, color palette, and layout of the original HTML mockups in `stitch_hermes_agentflow_studio` while adding real routing, state management, and interactive workflow/task/approval flows.

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** with custom design tokens from `DESIGN.md`
- **React Router** for client-side navigation
- **Zustand** for global state
- **@xyflow/react** for the workflow designer canvas
- **Recharts** for monitoring charts
- **vite-plugin-pwa** for PWA support

## Getting Started

```bash
# From this folder
cd stitch_hermes_agentflow_studio/agentflow-studio-app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open http://localhost:3080 (or the port shown in the terminal).

## Build

```bash
npm run build
```

The static build is emitted to `dist/`. You can preview it with `npm run preview`.

## Functionality

State is persisted to `localStorage` and all actions provide toast feedback. A live activity feed records every meaningful change.

- **Dashboard** (`/`) - live fleet stats, recent running tasks, and agent fleet cards
  ![Dashboard](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/dashboard.png)
- **Agents** (`/agents`) - create, edit, delete, and run/pause agents
  ![Agents](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/agents.png)
- **Workflows** (`/workflows`) - create, save, publish, and delete visual workflows; drag-and-drop React Flow canvas with custom nodes and edges
  ![Workflows](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/workflows.png)
- **Tasks** (`/tasks`) - create tasks; run/pause/resume/retry/delete; status and domain filters; progress auto-simulates to completion
  ![Tasks](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/tasks.png)
- **Approvals** (`/approvals`) - approve/reject requests, risk distribution, and decision log
  ![Approvals](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/approvals.png)
- **Automation** (`/automation`) - trigger workflows that create tasks, toggle scheduled runs
  ![Automation](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/automation.png)
- **Monitor** (`/monitor`) - live throughput chart, toggle service health, and activity feed
  ![Monitor](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/monitor.png)
- **Mobile** (`/mobile`) - functional mobile companion for approvals, active tasks, and quick actions
  ![Mobile companion](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/mobile-companion.png)
- **Settings** (`/settings`) - persisted gateway, limits, and governance toggles
  ![Settings](stitch_hermes_agentflow_studio/agentflow-studio-app/assets/screenshots/settings.png)

## Mobile / PWA

The app is fully responsive. On narrow viewports the desktop sidebar collapses to a mobile header + bottom navigation. The `vite-plugin-pwa` manifest enables "Add to Home Screen" behavior on supported devices.

## Mock Data

All screens are driven by mock data in `src/lib/data.ts` and `src/lib/store.ts` so the UI is immediately usable without a backend.
