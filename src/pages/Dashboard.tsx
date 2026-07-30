import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function StatCard({ title, value, sub, icon, color = 'primary' }: { title: string; value: string; sub?: string; icon: string; color?: string }) {
  return (
    <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-sm">
        <span className="text-on-surface-variant font-label-xs text-label-xs uppercase tracking-widest">{title}</span>
        <span className={cn('material-symbols-outlined', color === 'secondary' ? 'text-secondary' : color === 'tertiary' ? 'text-tertiary' : 'text-primary')}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-sm">
        <span className="font-display-lg text-display-lg text-on-surface">{value}</span>
        {sub && <span className="text-secondary font-tech-mono text-[12px]">{sub}</span>}
      </div>
      <div className="mt-md w-full bg-surface-variant h-1 rounded-full overflow-hidden">
        <div className={cn('h-full', color === 'secondary' ? 'bg-secondary w-4/5' : color === 'tertiary' ? 'bg-tertiary w-1/2' : 'bg-primary w-2/3')} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { tasks, agents, approvals, healthServices } = useAppStore()
  const runningTasks = tasks.filter((t) => t.status === 'running' || t.status === 'queued' || t.status === 'finalizing').length
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length
  const totalAgents = agents.length
  const onlineServices = healthServices.filter((s) => s.status === 'online').length
  const healthPct = Math.round((onlineServices / healthServices.length) * 100)

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard title="Active Tasks" value={String(runningTasks)} sub="+3.2%" icon="analytics" color="primary" />
        <StatCard title="Pending Approvals" value={String(pendingApprovals)} sub="Critical Priority" icon="fact_check" color="tertiary" />
        <StatCard title="Total Agents" value={String(totalAgents).padStart(2, '0')} sub="All Synced" icon="smart_toy" color="secondary" />
        <StatCard title="System Health" value={`${healthPct}%`} sub={healthPct > 90 ? 'Optimal' : 'Degraded'} icon="verified_user" color={healthPct > 90 ? 'secondary' : 'error'} />
      </div>

      <section className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">data_exploration</span>
            Live Task Progress
          </h3>
          <span className="text-label-xs text-on-surface-variant bg-surface-variant px-sm py-xs rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse-dot" />
            32 RUNS/SEC
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-lg py-sm font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Task</th>
                <th className="px-lg py-sm font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Agent</th>
                <th className="px-lg py-sm font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-lg py-sm font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Progress</th>
                <th className="px-lg py-sm font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {tasks.slice(0, 4).map((task) => (
                <tr key={task.id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-lg py-md">
                    <div className="font-body-sm font-semibold">{task.title}</div>
                    <div className="text-[11px] text-on-surface-variant font-tech-mono">ID: {task.id}</div>
                  </td>
                  <td className="px-lg py-md text-body-sm">{task.agent}</td>
                  <td className="px-lg py-md">
                    <span className={cn('px-sm py-0.5 rounded border text-[11px] font-bold uppercase', task.status === 'running' ? 'text-primary border-primary/30 bg-primary/10' : task.status === 'completed' ? 'text-secondary border-secondary/30 bg-secondary/10' : 'text-tertiary border-tertiary/30 bg-tertiary/10')}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-24 bg-surface-variant h-1.5 rounded-full overflow-hidden">
                        <div className={cn('h-full', task.status === 'completed' ? 'bg-secondary' : 'bg-primary')} style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs font-tech-mono text-on-surface-variant">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <a className="text-primary hover:underline text-body-sm flex items-center gap-1" href="#">
                      Workspace <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-md">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">groups</span>
            Agent Fleet
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-md">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col relative overflow-hidden hover:border-primary/30 transition-colors">
              <div className={cn('absolute left-0 top-0 bottom-0 w-1', agent.status === 'running' ? 'bg-secondary' : agent.status === 'paused' ? 'bg-tertiary' : 'bg-primary')} />
              <div className="flex items-center gap-sm mb-md">
                <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center">
                  <span className={cn('material-symbols-outlined', agent.status === 'running' ? 'text-secondary' : agent.status === 'paused' ? 'text-tertiary' : 'text-primary')}>{agent.icon}</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm font-bold truncate">{agent.name.split(' ')[0]}</div>
                  <div className="font-tech-mono text-[10px] text-on-surface-variant">#{agent.id}</div>
                </div>
              </div>
              <div className="mt-auto space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Status</span>
                  <span className={cn('text-[10px] flex items-center gap-1', agent.status === 'running' ? 'text-secondary' : agent.status === 'paused' ? 'text-tertiary' : 'text-primary')}>
                    {agent.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-dot" />}
                    {agent.status}
                  </span>
                </div>
                <button className="w-full py-sm bg-surface-variant/30 hover:bg-surface-variant text-[11px] font-bold rounded transition-colors uppercase tracking-widest">Profile</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
