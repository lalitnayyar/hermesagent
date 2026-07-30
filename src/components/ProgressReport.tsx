import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type RunEvent = {
  type: 'status' | 'thought' | 'tool_call' | 'tool_result' | 'output' | 'error' | 'done'
  runId?: string
  timestamp?: string
  message?: string
  data?: string
  tool?: string
  args?: Record<string, unknown>
  result?: unknown
  status?: string
  progress?: number
}

export default function ProgressReport({ runId, onClose }: { runId: string; onClose?: () => void }) {
  const [events, setEvents] = useState<RunEvent[]>([])
  const [status, setStatus] = useState<'running' | 'completed' | 'failed'>('running')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const source = new EventSource(`/api/run/${runId}/events`)
    source.onmessage = (e) => {
      const event = JSON.parse(e.data) as RunEvent
      setEvents((prev) => [...prev, event])
      if (event.type === 'done') {
        setStatus(event.status === 'completed' ? 'completed' : 'failed')
        source.close()
      }
    }
    source.onerror = () => {
      setStatus('failed')
      source.close()
    }
    return () => source.close()
  }, [runId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <span className={cn('w-2 h-2 rounded-full animate-pulse-dot', status === 'running' ? 'bg-primary' : status === 'completed' ? 'bg-secondary' : 'bg-error')} />
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Progress Report</h3>
          <span className="text-label-xs text-on-surface-variant uppercase">{status}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface material-symbols-outlined">close</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-sm pr-1">
        {events.length === 0 && (
          <div className="text-center text-on-surface-variant text-body-sm py-md">Waiting for events...</div>
        )}
        {events.map((event, idx) => (
          <div key={idx} className={cn('p-md rounded-lg border border-outline-variant/50 text-body-sm', event.type === 'error' ? 'bg-error/10 text-error' : event.type === 'done' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container')}> 
            <div className="flex items-center gap-sm mb-1">
              <span className={cn('text-label-xs font-label-xs uppercase', event.type === 'error' ? 'text-error' : event.type === 'done' ? 'text-secondary' : 'text-primary')}>{event.type}</span>
              {event.timestamp && <span className="text-[10px] text-on-surface-variant font-tech-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>}
            </div>
            {event.message && <p className="text-on-surface">{event.message}</p>}
            {event.data && <pre className="text-[11px] text-on-surface-variant whitespace-pre-wrap">{event.data}</pre>}
            {event.tool && <p className="text-[11px] text-on-surface-variant">tool: {event.tool}</p>}
            {event.progress !== undefined && (
              <div className="mt-2 w-full bg-surface-variant h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${event.progress}%` }} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
