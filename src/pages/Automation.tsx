import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const quickActions = [
  { icon: 'health_and_safety', label: 'Health Check', color: 'text-secondary' },
  { icon: 'summarize', label: 'Daily Report', color: 'text-primary' },
  { icon: 'bolt', label: 'Flush Cache', color: 'text-tertiary' },
  { icon: 'terminal', label: 'Node Re-init', color: 'text-on-surface-variant' }
]

export default function Automation() {
  const { workflows, schedules, toggleSchedule, addTask, toast } = useAppStore()

  const trigger = (wf: typeof workflows[number]) => {
    addTask(`Run: ${wf.name}`, wf.domain, wf.name, 'System')
    toast(`Triggered "${wf.name}"`, 'success')
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-display-lg text-display-lg text-on-surface">Automation</h2>
        <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">Trigger pre-approved workflows and manage scheduled automation runs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => toast(`Quick action: ${action.label} started`, 'info')}
                className="bg-surface-container-high border border-outline-variant p-md rounded-xl flex flex-col items-start gap-sm hover:bg-surface-variant/50 active:scale-95 transition-all"
              >
                <span className={cn('material-symbols-outlined', action.color)}>{action.icon}</span>
                <span className="font-body-sm font-semibold text-on-surface">{action.label}</span>
              </button>
            ))}
          </div>

          <h3 className="font-headline-sm text-headline-sm mt-lg mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary">schedule</span>
            Trigger Workflow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {workflows.slice(0, 4).map((wf) => (
              <button key={wf.id} onClick={() => trigger(wf)} className="text-left p-md rounded-lg border border-outline-variant bg-surface-container hover:border-primary/40 transition-colors active:scale-95">
                <div className="font-body-sm font-semibold text-on-surface">{wf.name}</div>
                <div className="text-[11px] text-on-surface-variant">{wf.domain} • {wf.nodes.length} nodes</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary">event_repeat</span>
            Schedules
          </h3>
          <div className="space-y-sm">
            {schedules.map((s) => (
              <div key={s.id} className="p-md bg-surface-container rounded-lg border border-outline-variant">
                <div className="flex justify-between items-start mb-xs">
                  <span className="font-body-sm font-semibold text-on-surface">{s.workflow}</span>
                  <button
                    onClick={() => toggleSchedule(s.id)}
                    className={cn('w-10 h-5 rounded-full relative transition-colors', s.enabled ? 'bg-primary' : 'bg-surface-variant')}
                  >
                    <div className={cn('absolute top-1 w-3 h-3 bg-white rounded-full transition-all', s.enabled ? 'right-1' : 'left-1')} />
                  </button>
                </div>
                <div className="text-[11px] text-on-surface-variant">{s.cadence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
