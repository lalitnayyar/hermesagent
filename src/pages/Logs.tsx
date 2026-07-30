import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const typeLabel: Record<string, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error'
}

const typeIcon: Record<string, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error'
}

const typeClass = (type: string) =>
  type === 'error' ? 'text-error' : type === 'warning' ? 'text-warning' : type === 'success' ? 'text-secondary' : 'text-primary'

const bgClass = (type: string) =>
  type === 'error' ? 'bg-error-container/40' : type === 'warning' ? 'bg-warning-container/40' : type === 'success' ? 'bg-secondary/10' : 'bg-primary/10'

export default function Logs() {
  const { activityFeed } = useAppStore()
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? activityFeed : activityFeed.filter((a) => a.type === filter)

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Activity Logs</h2>
          <p className="text-on-surface-variant mt-xs font-body-md">All recorded events and actions from the application.</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Filter</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md h-[calc(100vh-13rem)] overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            No activity logs match the selected filter.
          </div>
        ) : (
          <div className="space-y-sm">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-start gap-sm p-md rounded-lg border border-outline-variant/50',
                  bgClass(entry.type)
                )}
              >
                <span className={cn('material-symbols-outlined mt-0.5', typeClass(entry.type))}>
                  {typeIcon[entry.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-on-surface">{entry.message}</p>
                  <p className="text-[11px] text-on-surface-variant mt-xs font-tech-mono">{entry.time}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase font-label-xs', typeClass(entry.type), 'border border-current/30')}>
                  {typeLabel[entry.type]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
