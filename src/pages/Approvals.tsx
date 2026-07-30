import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const filters = ['pending', 'approved', 'rejected', 'all'] as const

export default function Approvals() {
  const { approvals, approve, reject, activityFeed } = useAppStore()
  const [filter, setFilter] = useState<(typeof filters)[number]>('pending')

  const filtered = approvals.filter((a) => (filter === 'all' ? true : a.status === filter))
  const high = approvals.filter((a) => a.risk === 'HIGH').length
  const medium = approvals.filter((a) => a.risk === 'MEDIUM').length
  const total = approvals.length || 1

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Human-in-the-Loop</h2>
          <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">Validate sensitive autonomous agent operations and system state modifications.</p>
        </div>
        <div className="flex bg-surface-container border border-outline-variant p-1 rounded-lg">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-md py-1.5 text-label-xs font-label-xs rounded transition-all capitalize', filter === f ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}>
              {f} {f !== 'all' && <span className="ml-1 opacity-60">{approvals.filter((a) => a.status === f).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-3 space-y-gutter">
          <div className="bg-surface-container-low border border-outline-variant p-md rounded-xl">
            <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-widest mb-md">Risk Distribution</h3>
            <div className="space-y-sm">
              {[
                { label: 'HIGH', count: high, color: 'bg-error' },
                { label: 'MEDIUM', count: medium, color: 'bg-tertiary' },
                { label: 'LOW', count: total - high - medium, color: 'bg-primary' }
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between items-center text-body-sm font-tech-mono mb-1">
                    <span className={cn(r.color === 'bg-error' ? 'text-error' : r.color === 'bg-tertiary' ? 'text-tertiary' : 'text-primary')}>{r.label}</span>
                    <span>{String(r.count).padStart(2, '0')}</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden">
                    <div className={cn('h-full', r.color)} style={{ width: `${(r.count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant p-md rounded-xl">
            <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-widest mb-md">Decision Log</h3>
            <div className="space-y-sm max-h-64 overflow-y-auto pr-1">
              {activityFeed.slice(0, 8).map((item) => (
                <div key={item.id} className="text-[11px] text-on-surface-variant border-l-2 border-outline-variant pl-2 py-1">
                  <p className="text-on-surface">{item.message}</p>
                  <p className="mt-1 text-[10px]">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-md">
          {filtered.length === 0 && (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg text-center text-on-surface-variant">
              No approvals in this state.
            </div>
          )}
          {filtered.map((approval) => (
            <div
              key={approval.id}
              className={cn(
                'group relative bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden transition-all',
                approval.status === 'approved' && 'opacity-50',
                approval.status === 'rejected' && 'opacity-30 grayscale'
              )}
            >
              <div className={cn('absolute left-0 top-0 bottom-0 w-1', approval.risk === 'HIGH' ? 'bg-error' : approval.risk === 'MEDIUM' ? 'bg-tertiary' : 'bg-primary')} />
              <div className="p-lg flex flex-col md:flex-row gap-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-md mb-sm">
                    <div className="flex items-center gap-xs">
                      <div className={cn('w-5 h-5 rounded-sm flex items-center justify-center border', approval.risk === 'HIGH' ? 'bg-error/20 border-error/30' : approval.risk === 'MEDIUM' ? 'bg-tertiary/20 border-tertiary/30' : 'bg-primary/20 border-primary/30')}>
                        <span className={cn('material-symbols-outlined text-[14px]', approval.risk === 'HIGH' ? 'text-error' : approval.risk === 'MEDIUM' ? 'text-tertiary' : 'text-primary')}>{approval.risk === 'HIGH' ? 'priority_high' : 'warning'}</span>
                      </div>
                      <span className={cn('font-tech-mono text-label-xs', approval.risk === 'HIGH' ? 'text-error' : approval.risk === 'MEDIUM' ? 'text-tertiary' : 'text-primary')}>{approval.risk} RISK</span>
                    </div>
                    <span className="text-outline text-label-xs">•</span>
                    <span className="font-tech-mono text-label-xs text-on-surface-variant">ID: {approval.id}</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{approval.title}</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed mb-md">{approval.description}</p>
                  <div className="text-body-sm text-on-surface-variant mb-md">
                    Impact: <span className={cn(approval.risk === 'HIGH' ? 'text-error' : approval.risk === 'MEDIUM' ? 'text-tertiary' : 'text-primary')}>{approval.impact}</span>
                  </div>
                </div>
                <div className="md:w-48 flex flex-col justify-center gap-sm">
                  {approval.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approve(approval.id)}
                        className="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container font-bold py-sm rounded-lg flex items-center justify-center gap-sm transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Approve
                      </button>
                      <button
                        onClick={() => reject(approval.id)}
                        className="w-full bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface-variant border border-outline-variant font-bold py-sm rounded-lg flex items-center justify-center gap-sm transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={cn('w-full text-center py-sm rounded-lg font-bold uppercase', approval.status === 'approved' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error')}>
                      {approval.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
