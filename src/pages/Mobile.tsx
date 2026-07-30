import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const quickActions = [
  { icon: 'health_and_safety', label: 'Health Check', color: 'text-secondary' },
  { icon: 'summarize', label: 'Daily Report', color: 'text-primary' },
  { icon: 'bolt', label: 'Flush Cache', color: 'text-tertiary' },
  { icon: 'terminal', label: 'Node Re-init', color: 'text-on-surface-variant' }
]

export default function Mobile() {
  const { approvals, tasks, healthServices, approve, reject, setTaskStatus, toast } = useAppStore()
  const pendingApprovals = approvals.filter((a) => a.status === 'pending')
  const activeTasks = tasks.filter((t) => t.status === 'running' || t.status === 'queued' || t.status === 'paused' || t.status === 'finalizing')

  return (
    <div className="max-w-md mx-auto space-y-lg pb-24 md:pb-0">
      <header className="md:hidden flex justify-between items-center mb-md">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary font-bold">hub</span>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Hermes Studio</h1>
        </div>
        <div className="flex items-center gap-xs bg-surface-container-high px-sm py-xs rounded-full border border-outline-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot" />
          <span className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Syncing</span>
        </div>
      </header>

      <div className="hidden md:block">
        <h2 className="font-display-lg text-display-lg text-on-surface">Mobile Companion</h2>
        <p className="text-on-surface-variant mt-2 font-body-md">A preview of the PWA / mobile experience for approvals, tasks, and quick actions.</p>
      </div>

      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-tertiary">fact_check</span>
            Pending Approvals
          </h2>
          <span className="bg-tertiary-container text-on-tertiary-container px-sm py-1 rounded-full font-label-xs text-label-xs">
            {pendingApprovals.length} Urgent
          </span>
        </div>
        <div className="space-y-sm">
          {pendingApprovals.slice(0, 3).map((approval) => (
            <div key={approval.id} className="glass-panel rounded-xl overflow-hidden flex border-l-4 border-tertiary bg-surface-container-low/50 backdrop-blur-md">
              <div className="p-md flex-1 space-y-sm">
                <div className="flex items-center justify-between">
                  <span className="font-tech-mono text-tech-mono text-tertiary uppercase">{approval.agent}</span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant opacity-70">{approval.risk}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{approval.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">{approval.description}</p>
                <div className="flex gap-sm pt-md">
                  <button onClick={() => reject(approval.id)} className="flex-1 bg-surface-variant text-on-surface border border-outline-variant py-sm rounded-lg font-body-sm font-semibold active:scale-95 transition-transform">Reject</button>
                  <button onClick={() => approve(approval.id)} className="flex-1 bg-primary text-on-primary py-sm rounded-lg font-body-sm font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform">Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="font-headline-sm text-headline-sm">Active Workflows</h2>
        <div className="space-y-sm">
          {activeTasks.slice(0, 4).map((task) => (
            <button
              key={task.id}
              onClick={() => setTaskStatus(task.id, task.status === 'running' ? 'paused' : 'running')}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center gap-md text-left active:scale-95 transition-transform"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="text-surface-variant" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="3" />
                  <circle
                    className={task.status === 'paused' ? 'text-tertiary' : 'text-secondary'}
                    cx="18"
                    cy="18"
                    fill="transparent"
                    r="16"
                    stroke="currentColor"
                    strokeDasharray="100"
                    strokeDashoffset={100 - task.progress}
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <span className={cn('absolute font-label-xs text-label-xs', task.status === 'paused' ? 'text-tertiary' : 'text-secondary')}>{task.progress}%</span>
              </div>
              <div className="flex-1">
                <p className="font-body-sm font-semibold text-on-surface">{task.title}</p>
                <p className="font-label-xs text-label-xs text-on-surface-variant">{task.status} • {task.agent}</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-lg">{task.status === 'running' ? 'pause_circle' : 'play_circle'}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="font-headline-sm text-headline-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-sm">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => toast(`${action.label} started`, 'info')} className="bg-surface-container-high border border-outline-variant p-md rounded-xl flex flex-col items-start gap-sm active:scale-95 transition-transform hover:bg-surface-variant/50">
              <span className={cn('material-symbols-outlined', action.color)}>{action.icon}</span>
              <span className="font-body-sm font-semibold text-on-surface">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="font-headline-sm text-headline-sm">Service Health</h2>
        <div className="space-y-sm">
          {healthServices.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between bg-surface-container-low border border-outline-variant rounded-xl p-md">
              <div className="flex items-center gap-sm">
                <span className={cn('material-symbols-outlined', svc.status === 'online' ? 'text-secondary' : 'text-error')}>{svc.icon}</span>
                <span className="font-body-sm text-on-surface">{svc.name}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="font-tech-mono text-tech-mono text-on-surface-variant">{svc.latency}</span>
                <span className={cn('w-2 h-2 rounded-full', svc.status === 'online' ? 'bg-secondary animate-pulse-dot' : 'bg-error')} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
