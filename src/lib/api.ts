import type { Agent, Approval, Schedule, Settings, Task, Workflow } from './store'

const BASE = '/api'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export type BackendHealth = {
  status: string
  version: string
  environment: string
  database: string
  hermes: { reachable: boolean; version: string | null; error: string | null }
}

export const api = {
  health: () => fetchJson<BackendHealth>('/health'),

  // Agents
  listAgents: () => fetchJson<Agent[]>('/agents'),
  createAgent: (agent: Omit<Agent, 'id'>) => fetchJson<Agent>('/agents', { method: 'POST', body: JSON.stringify(agent) }),
  updateAgent: (id: string, patch: Partial<Agent>) => fetchJson<Agent>(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteAgent: (id: string) => fetchJson<{ success: boolean }>(`/agents/${id}`, { method: 'DELETE' }),

  // Workflows
  listWorkflows: () => fetchJson<Workflow[]>('/workflows'),
  createWorkflow: (wf: Workflow) => fetchJson<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(wf) }),
  updateWorkflow: (id: string, patch: Partial<Workflow>) => fetchJson<Workflow>(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteWorkflow: (id: string) => fetchJson<{ success: boolean }>(`/workflows/${id}`, { method: 'DELETE' }),

  // Tasks
  listTasks: () => fetchJson<Task[]>('/tasks'),
  createTask: (task: Task) => fetchJson<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id: string, patch: Partial<Task>) => fetchJson<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteTask: (id: string) => fetchJson<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  runTask: (id: string) => fetchJson<{ runId: string }>(`/tasks/${id}/run`, { method: 'POST' }),

  // Approvals
  listApprovals: () => fetchJson<Approval[]>('/approvals'),
  createApproval: (approval: Approval) => fetchJson<Approval>('/approvals', { method: 'POST', body: JSON.stringify(approval) }),
  approve: (id: string) => fetchJson<{ approval: Approval; runId?: string }>(`/approvals/${id}/approve`, { method: 'POST' }),
  reject: (id: string) => fetchJson<{ approval: Approval }>(`/approvals/${id}/reject`, { method: 'POST' }),
  deleteApproval: (id: string) => fetchJson<{ success: boolean }>(`/approvals/${id}`, { method: 'DELETE' }),

  // Schedules
  listSchedules: () => fetchJson<Schedule[]>('/schedules'),
  updateSchedule: (id: number, patch: Partial<Schedule>) => fetchJson<Schedule>(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  // Settings
  getSettings: () => fetchJson<Settings>('/settings'),
  updateSettings: (patch: Partial<Settings>) => fetchJson<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),

  // System
  getActivity: () => fetchJson<Array<{ id: number; action: string; entity_type: string; entity_id: string; message: string; actor: string; created_at: string }>>('/system/activity'),

  // Runs / progress
  run: (type: string, payload: Record<string, unknown>) => fetchJson<{ runId: string }>('/run', { method: 'POST', body: JSON.stringify({ type, payload }) }),
  streamEvents: (runId: string) => new EventSource(`/api/run/${runId}/events`),

  // Chat test
  chat: (payload: { message: string; gateway?: string; endpoint?: string }) =>
    fetchJson<{ status: number; body: string }>('/chat', { method: 'POST', body: JSON.stringify(payload) }),

  // Ollama chat
  ollama: (payload: { message: string; model?: string; host?: string }) =>
    fetchJson<{ status: number; body: string }>('/ollama', { method: 'POST', body: JSON.stringify(payload) }),

  // Connection test
  testConnection: (payload: { url: string }) =>
    fetchJson<{ reachable: boolean; status?: number; error?: string }>('/test', { method: 'POST', body: JSON.stringify(payload) }),
}
