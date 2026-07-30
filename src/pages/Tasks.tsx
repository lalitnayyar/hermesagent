import { useState } from 'react'
import { useAppStore, type TaskStatus, domains } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import ProgressReport from '@/components/ProgressReport'

const statusFilters = ['All', 'Active', 'Completed', 'Failed']

function taskBadgeClass(status: TaskStatus) {
  if (status === 'running' || status === 'finalizing') return 'text-primary border-primary/30 bg-primary/10'
  if (status === 'completed') return 'text-secondary border-secondary/30 bg-secondary/10'
  if (status === 'failed') return 'text-error border-error/30 bg-error/10'
  return 'text-tertiary border-tertiary/30 bg-tertiary/10'
}

export default function Tasks() {
  const { tasks, workflows, agents, addTask, setTaskStatus, deleteTask } = useAppStore()
  const [filter, setFilter] = useState('All')
  const [domainFilter, setDomainFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState(domains[0])
  const [workflow, setWorkflow] = useState(workflows[0]?.name ?? '')
  const [agent, setAgent] = useState(agents[0]?.name ?? '')
  const [activeRun, setActiveRun] = useState<string | null>(null)

  const completed = tasks.filter((t) => t.status === 'completed').length
  const failed = tasks.filter((t) => t.status === 'failed').length
  const active = tasks.filter((t) => t.status === 'running' || t.status === 'queued' || t.status === 'finalizing').length
  const successRate = tasks.length ? ((completed / tasks.length) * 100).toFixed(1) : '0.0'

  const filtered = tasks.filter((task) => {
    const statusOk =
      filter === 'All' ||
      (filter === 'Active' && (task.status === 'running' || task.status === 'queued' || task.status === 'paused' || task.status === 'finalizing')) ||
      (filter === 'Completed' && task.status === 'completed') ||
      (filter === 'Failed' && task.status === 'failed')
    const domainOk = domainFilter === 'All' || task.domain === domainFilter
    return statusOk && domainOk
  })

  const createTask = () => {
    if (!title.trim()) return
    addTask(title, domain, workflow, agent)
    setModalOpen(false)
    setTitle('')
  }

  const handleStatusAction = (taskId: string, status: TaskStatus) => {
    if (status === 'running') setTaskStatus(taskId, 'paused')
    else if (status === 'paused') setTaskStatus(taskId, 'running')
    else if (status === 'completed' || status === 'failed') setTaskStatus(taskId, 'queued')
  }

  const runOnHermes = async (task: typeof tasks[number]) => {
    try {
      await api.createTask(task)
      const { runId } = await api.runTask(task.id)
      setActiveRun(runId)
    } catch (e) {
      alert(`Hermes run failed: ${e}`)
    }
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Task Orchestration</h2>
          <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">Monitor and manage autonomous agent tasks across business domains.</p>
        </div>
        <div className="flex items-center gap-sm">
          <button className="bg-surface-container-high hover:bg-surface-variant border border-outline-variant px-md py-sm rounded-lg flex items-center gap-sm transition-colors font-semibold text-body-sm">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
          <button onClick={() => setModalOpen(true)} className="bg-primary-container hover:bg-primary text-on-primary-container px-md py-sm rounded-lg flex items-center gap-sm transition-colors font-semibold">
            <span className="material-symbols-outlined">add</span>
            Create Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Active', value: active.toString(), color: 'bg-primary' },
          { label: 'Success Rate', value: `${successRate}%`, color: 'bg-secondary' },
          { label: 'Failed', value: failed.toString(), color: 'bg-error' },
          { label: 'Avg. Processing', value: '420ms', color: 'bg-tertiary' }
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low border border-outline-variant p-md rounded-xl">
            <p className="text-label-xs text-outline uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-headline-md font-bold text-on-surface">{stat.value}</h3>
            <div className="w-full bg-outline-variant/20 h-1 mt-4 rounded-full overflow-hidden">
              <div className={cn('h-full w-3/4', stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-md flex flex-wrap items-center justify-between gap-md border-b border-outline-variant bg-surface-container-lowest/50">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant">
              {statusFilters.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn('px-md py-1.5 text-label-xs font-label-xs rounded transition-all', filter === f ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}>
                  {f}
                </button>
              ))}
            </div>
            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="bg-surface-container border border-outline-variant text-body-sm text-on-surface py-1.5 px-md rounded-lg focus:ring-1 focus:ring-primary outline-none">
              <option>All</option>
              {domains.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30 text-label-xs uppercase tracking-widest text-outline">
                <th className="py-md px-lg font-bold border-b border-outline-variant">Task ID</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant">Title</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant">Workflow</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant">Agent</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant">Status</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant">Progress</th>
                <th className="py-md px-lg font-bold border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filtered.map((task) => (
                <tr key={task.id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="py-md px-lg font-tech-mono text-tech-mono text-primary">{task.id}</td>
                  <td className="py-md px-lg">
                    <div className="font-body-sm font-semibold text-on-surface">{task.title}</div>
                    <div className="text-[11px] text-outline">{task.domain}</div>
                  </td>
                  <td className="py-md px-lg text-body-sm">{task.workflow}</td>
                  <td className="py-md px-lg text-body-sm">{task.agent}</td>
                  <td className="py-md px-lg">
                    <span className={cn('px-sm py-0.5 rounded border text-[11px] font-bold uppercase', taskBadgeClass(task.status))}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-md px-lg">
                    <div className="flex items-center gap-md">
                      <div className="w-24 bg-surface-variant h-1.5 rounded-full overflow-hidden">
                        <div className={cn('h-full', task.status === 'completed' ? 'bg-secondary' : 'bg-primary')} style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs font-tech-mono text-on-surface-variant">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="py-md px-lg">
                    <div className="flex items-center justify-end gap-sm">
                      <button
                        onClick={() => handleStatusAction(task.id, task.status)}
                        className="p-sm text-on-surface-variant hover:text-primary transition-colors"
                        title={task.status === 'running' ? 'Pause' : task.status === 'paused' ? 'Resume' : 'Retry'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {task.status === 'running' ? 'pause_circle' : task.status === 'paused' ? 'play_circle' : 'replay_circle_filled'}
                        </span>
                      </button>
                      <button onClick={() => setTaskStatus(task.id, 'failed')} className="p-sm text-on-surface-variant hover:text-error transition-colors" title="Fail">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                      </button>
                      <button onClick={() => runOnHermes(task)} className="p-sm text-on-surface-variant hover:text-secondary transition-colors" title="Run on Hermes">
                        <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-sm text-on-surface-variant hover:text-error transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activeRun && (
          <div className="p-md border-t border-outline-variant">
            <ProgressReport runId={activeRun} onClose={() => setActiveRun(null)} />
          </div>
        )}
        <div className="p-md flex items-center justify-between border-t border-outline-variant">
          <p className="text-label-xs text-outline">Showing 1-{filtered.length} of {tasks.length} tasks</p>
          <div className="flex items-center gap-xs">
            <button className="p-2 text-outline hover:text-on-surface" disabled><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary-container text-on-primary-container text-label-xs font-bold">1</button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} title="Create Task" onClose={() => setModalOpen(false)}>
        <div className="space-y-md">
          <div className="space-y-sm">
            <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
                {domains.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Workflow</label>
              <select value={workflow} onChange={(e) => setWorkflow(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
                {workflows.map((w) => (<option key={w.id} value={w.name}>{w.name}</option>))}
              </select>
            </div>
            <div className="space-y-sm md:col-span-2">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Agent</label>
              <select value={agent} onChange={(e) => setAgent(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
                {agents.map((a) => (<option key={a.id} value={a.name}>{a.name}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/30">
            <button onClick={() => setModalOpen(false)} className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">Cancel</button>
            <button onClick={createTask} disabled={!title.trim()} className="px-lg py-sm rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">Create Task</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
