import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Node, type Edge } from '@xyflow/react'
import { formatDistanceToNow } from 'date-fns'
import { agents as initialAgents, tasks as initialTasks, approvals as initialApprovals, healthServices as initialHealth, activityFeed as initialFeed } from './data'

export type AgentStatus = 'idle' | 'running' | 'paused'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type TaskStatus = 'queued' | 'running' | 'paused' | 'finalizing' | 'completed' | 'failed'
export type WorkflowStatus = 'draft' | 'published'

export interface Agent {
  id: string
  name: string
  type: string
  status: AgentStatus
  icon: string
  color: string
  description: string
  skills: string[]
  profile: string
}

export interface Approval {
  id: string
  title: string
  agent: string
  risk: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  impact: string
  status: ApprovalStatus
}

export interface Task {
  id: string
  title: string
  domain: string
  workflow: string
  status: TaskStatus
  progress: number
  agent: string
  startedAt: string
}

export interface Workflow {
  id: string
  name: string
  domain: string
  status: WorkflowStatus
  nodes: Node[]
  edges: Edge[]
}

export interface Schedule {
  id: number
  workflow: string
  cadence: string
  enabled: boolean
}

export interface Settings {
  gateway: string
  ollamaHost: string
  mode: 'gateway' | 'enhanced' | 'offline'
  maxRetries: number
  timeout: number
  parallelAgents: number
  governance: Record<string, boolean>
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export interface Activity {
  id: number
  time: string
  message: string
  type: string
}

export const domains = ['Banking', 'Telecom', 'AI Research', 'IT Ops']

function defaultWorkflowNodes(name: string): Node[] {
  return [
    {
      id: 'start',
      type: 'workflowNode',
      position: { x: 40, y: 160 },
      data: { label: 'Start', icon: 'play_arrow', color: 'primary' }
    },
    {
      id: 'agent',
      type: 'workflowNode',
      position: { x: 240, y: 160 },
      data: { label: name, icon: 'psychology', color: 'secondary' }
    },
    {
      id: 'end',
      type: 'workflowNode',
      position: { x: 440, y: 160 },
      data: { label: 'End', icon: 'flag', color: 'primary' }
    }
  ]
}

function defaultWorkflowEdges(): Edge[] {
  return [
    { id: 'e-start-agent', source: 'start', target: 'agent', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-agent-end', source: 'agent', target: 'end', animated: true, style: { stroke: '#b4c5ff' } }
  ]
}

function conditionalWorkflowNodes(): Node[] {
  return [
    { id: 'start', type: 'workflowNode', position: { x: 40, y: 220 }, data: { label: 'Start', icon: 'play_arrow', color: 'primary', shape: 'rounded' } },
    { id: 'check', type: 'workflowNode', position: { x: 220, y: 220 }, data: { label: 'Check Risk', icon: 'monitoring', color: 'secondary', shape: 'rounded' } },
    { id: 'decision', type: 'workflowNode', position: { x: 460, y: 220 }, data: { label: 'Risk > 50%?', icon: 'question_mark', color: 'tertiary', shape: 'diamond' } },
    { id: 'approve', type: 'workflowNode', position: { x: 720, y: 120 }, data: { label: 'Approve', icon: 'check_circle', color: 'secondary', shape: 'rounded' } },
    { id: 'reject', type: 'workflowNode', position: { x: 720, y: 320 }, data: { label: 'Reject', icon: 'cancel', color: 'tertiary', shape: 'rounded' } },
    { id: 'end', type: 'workflowNode', position: { x: 960, y: 220 }, data: { label: 'End', icon: 'flag', color: 'primary', shape: 'rounded' } }
  ]
}

function conditionalWorkflowEdges(): Edge[] {
  return [
    { id: 'e-start-check', source: 'start', target: 'check', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-check-decision', source: 'check', target: 'decision', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-decision-approve', source: 'decision', target: 'approve', label: 'No', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-decision-reject', source: 'decision', target: 'reject', label: 'Yes', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-approve-end', source: 'approve', target: 'end', animated: true, style: { stroke: '#b4c5ff' } },
    { id: 'e-reject-end', source: 'reject', target: 'end', animated: true, style: { stroke: '#b4c5ff' } }
  ]
}

function nowLabel() {
  return formatDistanceToNow(Date.now(), { addSuffix: true })
}

interface AppState {
  agents: Agent[]
  tasks: Task[]
  approvals: Approval[]
  workflows: Workflow[]
  schedules: Schedule[]
  healthServices: typeof initialHealth
  activityFeed: Activity[]
  settings: Settings
  toasts: Toast[]

  addAgent: (agent: Omit<Agent, 'id'>) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  setAgentStatus: (id: string, status: AgentStatus) => void

  addWorkflow: (name: string, domain: string) => Workflow
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  updateWorkflowNodes: (id: string, nodes: Node[]) => void
  updateWorkflowEdges: (id: string, edges: Edge[]) => void
  publishWorkflow: (id: string) => void
  deleteWorkflow: (id: string) => void
  selectedWorkflowNodeId: string | null
  setSelectedWorkflowNodeId: (id: string | null) => void

  addTask: (title: string, domain: string, workflow: string, agent: string) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  deleteTask: (id: string) => void
  advanceRunningTasks: () => void

  approve: (id: string) => void
  reject: (id: string) => void

  toggleSchedule: (id: number) => void

  updateSettings: (settings: Partial<Settings>) => void

  toast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void
  addActivity: (message: string, type?: string) => void
}

const agentColors = ['primary', 'secondary', 'tertiary']

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      agents: initialAgents.map((a, i) => ({ ...a, color: agentColors[i % agentColors.length] })) as Agent[],
      tasks: initialTasks as Task[],
      approvals: initialApprovals.map((a) => ({ ...a, status: 'pending' as ApprovalStatus, risk: a.risk as Approval['risk'] })),
      selectedWorkflowNodeId: null,
      workflows: [
        { id: 'wf-conditional-approval', name: 'Conditional Approval (sample)', domain: 'Banking', status: 'published', nodes: conditionalWorkflowNodes(), edges: conditionalWorkflowEdges() },
        { id: 'wf-ai-assistant', name: 'AI Solution Architecture Assistant', domain: 'AI', status: 'published', nodes: defaultWorkflowNodes('AI Architect'), edges: defaultWorkflowEdges() },
        { id: 'wf-rag-design', name: 'RAG Application Design', domain: 'AI', status: 'published', nodes: defaultWorkflowNodes('RAG Designer'), edges: defaultWorkflowEdges() },
        { id: 'wf-complaint', name: 'Banking Customer Complaint Triage', domain: 'Banking', status: 'published', nodes: defaultWorkflowNodes('Triage Agent'), edges: defaultWorkflowEdges() },
        { id: 'wf-transaction', name: 'Suspicious Transaction Investigation', domain: 'Banking', status: 'draft', nodes: defaultWorkflowNodes('Risk Agent'), edges: defaultWorkflowEdges() },
        { id: 'wf-alarm', name: 'Telecom Alarm Correlation', domain: 'Telecom', status: 'published', nodes: defaultWorkflowNodes('Ops Agent'), edges: defaultWorkflowEdges() },
        { id: 'wf-degradation', name: 'Service Degradation Troubleshooting', domain: 'Telecom', status: 'draft', nodes: defaultWorkflowNodes('SRE Agent'), edges: defaultWorkflowEdges() },
        { id: 'wf-rca', name: 'Incident Root-Cause Analysis', domain: 'IT Ops', status: 'published', nodes: defaultWorkflowNodes('RCA Agent'), edges: defaultWorkflowEdges() }
      ],
      schedules: [
        { id: 1, workflow: 'Daily Health Check', cadence: 'Every 6 hours', enabled: true },
        { id: 2, workflow: 'Weekly Compliance Report', cadence: 'Mondays 09:00', enabled: true },
        { id: 3, workflow: 'Alarm Correlation Sweep', cadence: 'Every 30 min', enabled: false }
      ],
      healthServices: initialHealth,
      activityFeed: initialFeed as Activity[],
      settings: {
        gateway: 'https://hermes-gateway.local',
        ollamaHost: 'http://127.0.0.1:11434',
        mode: 'enhanced',
        maxRetries: 3,
        timeout: 30,
        parallelAgents: 5,
        governance: {
          requireApproval: true,
          logReasoning: true,
          autoSaveDrafts: false
        }
      },
      toasts: [],

      addAgent: (agent) => {
        const id = `HG-${String(get().agents.length + 1).padStart(3, '0')}`
        set((state) => ({
          agents: [...state.agents, { ...agent, id } as Agent]
        }))
        get().toast(`Agent ${agent.name} created`, 'success')
        get().addActivity(`Agent ${id} created`, 'success')
      },
      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a))
        }))
        get().toast('Agent updated', 'info')
      },
      deleteAgent: (id) => {
        set((state) => ({ agents: state.agents.filter((a) => a.id !== id) }))
        get().toast('Agent deleted', 'warning')
        get().addActivity(`Agent ${id} deleted`, 'warning')
      },
      setAgentStatus: (id, status) => {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a))
        }))
        get().addActivity(`Agent ${id} is now ${status}`, 'info')
      },

      addWorkflow: (name, domain) => {
        const id = `wf-${Date.now()}`
        const wf: Workflow = {
          id,
          name,
          domain,
          status: 'draft',
          nodes: defaultWorkflowNodes(name),
          edges: defaultWorkflowEdges()
        }
        set((state) => ({ workflows: [wf, ...state.workflows] }))
        get().toast(`Workflow "${name}" created`, 'success')
        get().addActivity(`Workflow ${id} created`, 'success')
        return wf
      },
      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w))
        }))
      },
      updateWorkflowNodes: (id, nodes) => {
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, nodes } : w))
        }))
      },
      updateWorkflowEdges: (id, edges) => {
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, edges } : w))
        }))
      },
      publishWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, status: 'published' as WorkflowStatus } : w))
        }))
        get().toast('Workflow published', 'success')
        get().addActivity(`Workflow ${id} published`, 'success')
      },
      deleteWorkflow: (id) => {
        set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) }))
        get().toast('Workflow deleted', 'warning')
        get().addActivity(`Workflow ${id} deleted`, 'warning')
      },
      setSelectedWorkflowNodeId: (id) => {
        set(() => ({ selectedWorkflowNodeId: id }))
      },

      addTask: (title, domain, workflow, agent) => {
        const id = `TASK-${Math.floor(Math.random() * 1000)}-${domain.slice(0, 2).toUpperCase()}`
        const task: Task = {
          id,
          title,
          domain,
          workflow,
          status: 'queued',
          progress: 0,
          agent,
          startedAt: new Date().toISOString()
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))
        get().toast('Task created', 'success')
        get().addActivity(`Task ${id} created`, 'info')
        return task
      },
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
        }))
      },
      setTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t))
        }))
        get().addActivity(`Task ${id} status changed to ${status}`, status === 'failed' ? 'error' : 'info')
      },
      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
        get().toast('Task deleted', 'warning')
        get().addActivity(`Task ${id} deleted`, 'warning')
      },
      advanceRunningTasks: () => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.status === 'running') {
              const next = Math.min(100, t.progress + Math.floor(Math.random() * 8) + 2)
              if (next >= 100) {
                get().addActivity(`Task ${t.id} completed`, 'success')
                return { ...t, progress: 100, status: 'completed' as TaskStatus }
              }
              return { ...t, progress: next }
            }
            if (t.status === 'queued') {
              return { ...t, status: 'running' as TaskStatus }
            }
            return t
          })
        }))
      },

      approve: (id) => {
        set((state) => ({
          approvals: state.approvals.map((a) => (a.id === id ? { ...a, status: 'approved' as ApprovalStatus } : a))
        }))
        get().toast('Approval granted', 'success')
        get().addActivity(`Approval ${id} approved`, 'success')
      },
      reject: (id) => {
        set((state) => ({
          approvals: state.approvals.map((a) => (a.id === id ? { ...a, status: 'rejected' as ApprovalStatus } : a))
        }))
        get().toast('Approval rejected', 'error')
        get().addActivity(`Approval ${id} rejected`, 'error')
      },

      toggleSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        }))
        get().toast('Schedule updated', 'info')
      },

      updateSettings: (settings) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }))
        get().toast('Settings saved', 'success')
      },

      toast: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2)
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => {
          get().dismissToast(id)
        }, 3000)
      },
      dismissToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      },
      addActivity: (message, type = 'info') => {
        set((state) => ({
          activityFeed: [{ id: Date.now(), time: nowLabel(), message, type }, ...state.activityFeed].slice(0, 50)
        }))
      }
    }),
    {
      name: 'agentflow-studio',
      version: 2,
      migrate: (persisted, version) => {
        if (version !== 2) return undefined
        return persisted as AppState
      },
      partialize: (state) => ({
        settings: state.settings,
        schedules: state.schedules,
        agents: state.agents,
        workflows: state.workflows,
        approvals: state.approvals
      })
    }
  )
)
