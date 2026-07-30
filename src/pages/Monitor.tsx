import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useInterval } from '@/hooks/useInterval'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type ServiceHealth = { name: string; icon: string; status: 'online' | 'offline'; latency: string }

const initialThroughput = [
  { time: '00:00', tasks: 12 },
  { time: '04:00', tasks: 18 },
  { time: '08:00', tasks: 35 },
  { time: '12:00', tasks: 42 },
  { time: '16:00', tasks: 38 },
  { time: '20:00', tasks: 29 }
]

export default function Monitor() {
  const { healthServices: initialServices, activityFeed } = useAppStore()
  const [services, setServices] = useState<ServiceHealth[]>(initialServices.map((s) => ({ ...s, status: s.status as 'online' | 'offline' })))
  const [throughput, setThroughput] = useState(initialThroughput)
  const [live, setLive] = useState(true)

  useInterval(
    () => {
      setThroughput((prev) => {
        const next = [...prev.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), tasks: Math.max(5, Math.round(30 + Math.random() * 20 - (Math.random() > 0.8 ? 15 : 0))) }]
        return next
      })
    },
    live ? 2000 : null
  )

  const toggleService = (idx: number) => {
    setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, status: s.status === 'online' ? 'offline' : 'online' as const } : s)))
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">System Monitor</h2>
          <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">Real-time health, connectivity, and activity feed for the AgentFlow platform.</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className={cn('flex items-center gap-xs text-label-xs font-label-xs', live ? 'text-secondary' : 'text-outline')}>
            <span className={cn('w-2 h-2 rounded-full', live ? 'bg-secondary animate-pulse-dot' : 'bg-outline')} />
            {live ? 'LIVE' : 'PAUSED'}
          </span>
          <button onClick={() => setLive((v) => !v)} className="px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors text-body-sm font-semibold">
            {live ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {services.map((svc, idx) => (
          <button
            key={svc.name}
            onClick={() => toggleService(idx)}
            className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center justify-between text-left hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center">
                <span className={cn('material-symbols-outlined', svc.status === 'online' ? 'text-secondary' : 'text-error')}>{svc.icon}</span>
              </div>
              <div>
                <div className="font-body-sm font-semibold text-on-surface">{svc.name}</div>
                <div className="text-[11px] text-on-surface-variant font-tech-mono">{svc.latency}</div>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              {svc.status === 'online' && <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot" />}
              <span className={cn('text-[11px] font-bold uppercase', svc.status === 'online' ? 'text-secondary' : 'text-error')}>{svc.status}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">monitoring</span>
            Task Throughput & Latency
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughput}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b4c5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#b4c5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#8d90a0" tick={{ fill: '#8d90a0', fontSize: 11 }} />
                <YAxis stroke="#8d90a0" tick={{ fill: '#8d90a0', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#171f33', border: '1px solid #434655', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="tasks" stroke="#b4c5ff" fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary">stream</span>
            Activity Feed
          </h3>
          <div className="space-y-sm max-h-64 overflow-y-auto pr-1">
            {activityFeed.slice(0, 12).map((item) => (
              <div key={item.id} className="flex gap-sm items-start p-md bg-surface-container rounded-lg border border-outline-variant/50">
                <span className={cn('w-2 h-2 mt-1.5 rounded-full shrink-0', item.type === 'success' ? 'bg-secondary' : item.type === 'error' ? 'bg-error' : item.type === 'warning' ? 'bg-tertiary' : 'bg-primary')} />
                <div>
                  <p className="text-body-sm text-on-surface">{item.message}</p>
                  <p className="text-[10px] text-on-surface-variant font-tech-mono mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
