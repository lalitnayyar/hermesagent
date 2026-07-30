import { cn } from '@/lib/utils'

export function Modal({ open, title, children, onClose, className }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className={cn('relative w-full max-w-lg bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl overflow-hidden', className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-md max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
