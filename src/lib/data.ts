export const agents = [
  {
    id: 'HG-001',
    name: 'Task Intake & Planning',
    type: 'Specialist',
    status: 'idle',
    icon: 'psychology',
    color: 'primary',
    description: 'Receives business requests, extracts intent, and creates execution plans.',
    skills: ['Request Classification', 'Entity Extraction', 'Priority Detection', 'Task Decomposition'],
    profile: 'Shared Profile v2'
  },
  {
    id: 'HG-002',
    name: 'Business & Customer Context',
    type: 'Specialist',
    status: 'running',
    icon: 'database',
    color: 'secondary',
    description: 'Builds customer, product, and environment context for other agents.',
    skills: ['Customer Context Analysis', 'Banking Process Mapping', 'Historical Session Search'],
    profile: 'Shared Profile v2'
  },
  {
    id: 'HG-003',
    name: 'AI Research & Knowledge',
    type: 'Research',
    status: 'running',
    icon: 'travel_explore',
    color: 'secondary',
    description: 'Performs AI-focused research, solution analysis, and knowledge preparation.',
    skills: ['LLM Selection', 'Prompt Design', 'RAG Design', 'Agentic AI Design'],
    profile: 'AI Profile'
  },
  {
    id: 'HG-004',
    name: 'Technical Diagnostics & Data',
    type: 'Specialist',
    status: 'idle',
    icon: 'query_stats',
    color: 'primary',
    description: 'Analyses logs, events, alarms, metrics, and technical evidence.',
    skills: ['Log Analysis', 'SQL Generation', 'Root-Cause Analysis', 'Data Validation'],
    profile: 'Execution Profile'
  },
  {
    id: 'HG-005',
    name: 'Risk, Security & Compliance',
    type: 'Reviewer',
    status: 'paused',
    icon: 'security',
    color: 'tertiary',
    description: 'Reviews proposed actions for security, privacy, and policy compliance.',
    skills: ['Security Review', 'Sensitive-Data Detection', 'Approval-Rule Evaluation'],
    profile: 'Security Profile'
  },
  {
    id: 'HG-006',
    name: 'Solution, Workflow & Execution',
    type: 'Execution',
    status: 'idle',
    icon: 'architecture',
    color: 'primary',
    description: 'Produces implementation plans and performs approved tool-based actions.',
    skills: ['Solution Design', 'API Invocation', 'SQL Execution', 'Configuration Action'],
    profile: 'Execution Profile'
  },
  {
    id: 'HG-007',
    name: 'Validation, Reporting & Learning',
    type: 'Validation',
    status: 'idle',
    icon: 'verified',
    color: 'primary',
    description: 'Validates results, generates reports, and captures reusable knowledge.',
    skills: ['Result Validation', 'Report Generation', 'Lesson Extraction', 'Skill Improvement'],
    profile: 'Shared Profile v2'
  }
]

export const tasks = [
  { id: 'TASK-982-BT', title: 'Banking Complaint Triage', domain: 'Banking', workflow: 'Complaint_Triage_v3', status: 'running', progress: 75, agent: 'Task Intake', startedAt: '2026-07-30 14:02:12' },
  { id: 'TASK-441-TA', title: 'Telecom Alarm Correlation', domain: 'Telecom', workflow: 'Alarm_Correlation_v2', status: 'finalizing', progress: 92, agent: 'Context Agent', startedAt: '2026-07-30 13:45:00' },
  { id: 'TASK-110-AI', title: 'RAG Application Design', domain: 'AI Research', workflow: 'RAG_Design_v1', status: 'completed', progress: 100, agent: 'AI Research', startedAt: '2026-07-30 12:10:00' },
  { id: 'TASK-223-SE', title: 'Suspicious Transaction Investigation', domain: 'Banking', workflow: 'Transaction_Investigation_v4', status: 'paused', progress: 34, agent: 'Risk & Compliance', startedAt: '2026-07-30 11:20:00' },
  { id: 'TASK-884-IM', title: 'Incident Root-Cause Analysis', domain: 'IT Ops', workflow: 'Incident_RCA_v2', status: 'running', progress: 56, agent: 'Diagnostics', startedAt: '2026-07-30 10:55:20' }
]

export const approvals = [
  {
    id: 'APR-001',
    title: 'Infrastructure Change',
    agent: 'Ops-Sentinel-V4',
    risk: 'HIGH',
    description: 'Agent proposes scaling the production cluster us-east-1a by 400% to handle a predicted spike in batch processing.',
    impact: 'Potential budget overrun: $12,400/mo',
    status: 'pending'
  },
  {
    id: 'APR-002',
    title: 'Financial Action',
    agent: 'Quant-Arbitrage-Bot',
    risk: 'MEDIUM',
    description: 'Executed cross-chain liquidity transfer of 42.5 ETH to Layer 2 vault for yield optimization.',
    impact: 'Slippage threshold deviation (1.2%)',
    status: 'pending'
  },
  {
    id: 'APR-003',
    title: 'Memory Write',
    agent: 'Hermes-Analyst',
    risk: 'LOW',
    description: 'Update global user preference vector to include governance_mode: human_in_loop as a permanent heuristic.',
    impact: 'Persistent memory update',
    status: 'pending'
  }
]

export const workflows = [
  { id: 'wf-1', name: 'AI Solution Architecture Assistant', domain: 'AI', status: 'published', nodes: 8 },
  { id: 'wf-2', name: 'RAG Application Design', domain: 'AI', status: 'published', nodes: 12 },
  { id: 'wf-3', name: 'Banking Customer Complaint Triage', domain: 'Banking', status: 'published', nodes: 7 },
  { id: 'wf-4', name: 'Suspicious Transaction Investigation', domain: 'Banking', status: 'draft', nodes: 10 },
  { id: 'wf-5', name: 'Telecom Alarm Correlation', domain: 'Telecom', status: 'published', nodes: 9 },
  { id: 'wf-6', name: 'Service Degradation Troubleshooting', domain: 'Telecom', status: 'draft', nodes: 6 },
  { id: 'wf-7', name: 'Incident Root-Cause Analysis', domain: 'IT Ops', status: 'published', nodes: 11 }
]

export const healthServices = [
  { name: 'Hermes Agent', status: 'online', latency: '24ms', icon: 'sensors' },
  { name: 'Gateway', status: 'online', latency: '18ms', icon: 'memory' },
  { name: 'Workspace', status: 'online', latency: '31ms', icon: 'settings_input_component' },
  { name: 'AgentFlow Backend', status: 'online', latency: '12ms', icon: 'dns' },
  { name: 'AgentFlow Worker', status: 'online', latency: '15ms', icon: 'pending_actions' },
  { name: 'SQLite Database', status: 'online', latency: '2ms', icon: 'storage' }
]

export const activityFeed = [
  { id: 1, time: '2m ago', message: 'Task TASK-982-BT progressed to Risk Review node', type: 'info' },
  { id: 2, time: '5m ago', message: 'Approval APR-001 created for Infrastructure Change', type: 'warning' },
  { id: 3, time: '12m ago', message: 'Agent HG-003 completed memory search (14 references)', type: 'success' },
  { id: 4, time: '18m ago', message: 'Workflow Telecom Alarm Correlation published', type: 'success' },
  { id: 5, time: '23m ago', message: 'Hermes Gateway health check passed', type: 'info' }
]
