import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function Toasts() {
  const toasts = useAppStore((state) => state.toasts)
  const dismiss = useAppStore((state) => state.dismissToast)

  return (
    <div className="fixed top-4 right-4 z-[110] space-y-sm flex flex-col items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center gap-sm px-md py-sm rounded-lg shadow-xl border min-w-[260px] max-w-sm',
            t.type === 'success' && 'bg-secondary/10 border-secondary/30 text-secondary',
            t.type === 'error' && 'bg-error/10 border-error/30 text-error',
            t.type === 'warning' && 'bg-tertiary/10 border-tertiary/30 text-tertiary',
            t.type === 'info' && 'bg-primary/10 border-primary/30 text-primary'
          )}
        >
          <span className="material-symbols-outlined text-[20px]">
            {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : t.type === 'warning' ? 'warning' : 'info'}
          </span>
          <span className="flex-1 text-body-sm font-medium">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
