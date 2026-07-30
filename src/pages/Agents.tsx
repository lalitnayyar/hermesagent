import { useState } from 'react'
import { useAppStore, type Agent, type AgentStatus } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'

const blankAgent: Omit<Agent, 'id'> = {
  name: '',
  type: 'Specialist',
  status: 'idle',
  icon: 'smart_toy',
  color: 'primary',
  description: '',
  skills: [],
  profile: 'Shared Profile v2'
}

export default function Agents() {
  const { agents, addAgent, updateAgent, deleteAgent, setAgentStatus } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Agent | null>(null)
  const [form, setForm] = useState<Omit<Agent, 'id'>>(blankAgent)

  const openCreate = () => {
    setEditing(null)
    setForm(blankAgent)
    setModalOpen(true)
  }

  const openEdit = (agent: Agent) => {
    setEditing(agent)
    setForm({ ...agent, skills: agent.skills })
    setModalOpen(true)
  }

  const save = () => {
    if (editing) {
      updateAgent(editing.id, form)
    } else {
      addAgent(form)
    }
    setModalOpen(false)
  }

  const updateField = (field: keyof Omit<Agent, 'id'>, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Agent Configuration</h2>
          <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">
            Manage business-agent definitions, Hermes profile mappings, skill assignments, and memory governance.
          </p>
        </div>
        <button onClick={openCreate} className="bg-primary-container hover:bg-primary text-on-primary-container px-lg py-sm rounded-lg flex items-center gap-sm transition-colors font-semibold">
          <span className="material-symbols-outlined">add</span>
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-lg relative overflow-hidden hover:border-primary/30 transition-colors">
            <div className={cn('absolute left-0 top-0 bottom-0 w-1', agent.status === 'running' ? 'bg-secondary' : agent.status === 'paused' ? 'bg-tertiary' : 'bg-primary')} />
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center">
                  <span className={cn('material-symbols-outlined', agent.status === 'running' ? 'text-secondary' : agent.status === 'paused' ? 'text-tertiary' : 'text-primary')}>{agent.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold">{agent.name}</h3>
                  <p className="text-on-surface-variant font-tech-mono text-[11px]">#{agent.id} • {agent.type}</p>
                </div>
              </div>
              <span className={cn('px-sm py-0.5 rounded border text-[11px] font-bold uppercase', agent.status === 'running' ? 'text-secondary border-secondary/30 bg-secondary/10' : agent.status === 'paused' ? 'text-tertiary border-tertiary/30 bg-tertiary/10' : 'text-primary border-primary/30 bg-primary/10')}>
                {agent.status}
              </span>
            </div>
            <p className="text-on-surface-variant text-body-sm mb-md line-clamp-2">{agent.description}</p>
            <div className="space-y-sm mb-md">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Profile</span>
                <span className="text-on-surface font-semibold">{agent.profile}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Skills</span>
                <span className="text-on-surface font-semibold">{agent.skills.length}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-xs mb-md">
              {agent.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-sm py-1 bg-surface-container-high border border-outline-variant rounded text-[10px] text-on-surface-variant">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-sm pt-md border-t border-outline-variant/30">
              <button onClick={() => openEdit(agent)} className="flex-1 py-sm bg-surface-variant/30 hover:bg-surface-variant rounded text-[11px] font-bold uppercase tracking-widest transition-colors">Edit</button>
              <button onClick={() => setAgentStatus(agent.id, agent.status === 'running' ? 'idle' : 'running')} className="flex-1 py-sm bg-surface-variant/30 hover:bg-surface-variant rounded text-[11px] font-bold uppercase tracking-widest transition-colors">
                {agent.status === 'running' ? 'Stop' : 'Run'}
              </button>
              <button onClick={() => deleteAgent(agent.id)} className="px-sm py-sm bg-surface-variant/30 hover:bg-error-container hover:text-on-error-container rounded text-[11px] font-bold uppercase tracking-widest transition-colors">
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Agent' : 'Create Agent'} onClose={() => setModalOpen(false)}>
        <div className="space-y-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Name</label>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Type</label>
              <input value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Status</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value as AgentStatus)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
                <option value="idle">Idle</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Icon (Material Symbol)</label>
              <input value={form.icon} onChange={(e) => updateField('icon', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Profile</label>
              <input value={form.profile} onChange={(e) => updateField('profile', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Color Theme</label>
              <select value={form.color} onChange={(e) => updateField('color', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="tertiary">Tertiary</option>
              </select>
            </div>
          </div>
          <div className="space-y-sm">
            <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Description</label>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div className="space-y-sm">
            <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Skills (comma separated)</label>
            <input value={form.skills.join(', ')} onChange={(e) => updateField('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/30">
            <button onClick={() => setModalOpen(false)} className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">Cancel</button>
            <button onClick={save} className="px-lg py-sm rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">{editing ? 'Save Changes' : 'Create Agent'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
