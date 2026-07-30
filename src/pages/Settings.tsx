import { useAppStore, type Settings as AppSettings } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Settings() {
  const { settings, updateSettings, toast } = useAppStore()

  const updateField = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    updateSettings({ [field]: value })
  }

  const governanceKeys = [
    { key: 'requireApproval', label: 'Require human approval for risky actions' },
    { key: 'logReasoning', label: 'Log all agent reasoning steps' },
    { key: 'autoSaveDrafts', label: 'Auto-save workflow drafts' }
  ] as const

  const reset = () => {
    updateSettings({
      gateway: 'https://hermes-gateway.local',
      mode: 'enhanced',
      maxRetries: 3,
      timeout: 30,
      parallelAgents: 5,
      governance: { requireApproval: true, logReasoning: true, autoSaveDrafts: false }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-lg">
      <div>
        <h2 className="font-display-lg text-display-lg text-on-surface">Settings</h2>
        <p className="text-on-surface-variant max-w-2xl mt-2 font-body-md">Configure the Hermes AgentFlow Studio workspace and gateway connections.</p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg space-y-lg">
        <section className="space-y-md">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">hub</span>
            Hermes Gateway
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Gateway URL</label>
              <input
                value={settings.gateway}
                onChange={(e) => updateField('gateway', e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                type="text"
              />
            </div>
            <div className="space-y-sm">
              <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Connection Mode</label>
              <select
                value={settings.mode}
                onChange={(e) => updateField('mode', e.target.value as AppSettings['mode'])}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="gateway">Gateway Only</option>
                <option value="enhanced">Enhanced Gateway</option>
                <option value="offline">Offline / Local</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-outline-variant/30" />

        <section className="space-y-md">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary">memory</span>
            Defaults & Limits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { key: 'maxRetries' as const, label: 'Max Retries' },
              { key: 'timeout' as const, label: 'Timeout (s)' },
              { key: 'parallelAgents' as const, label: 'Parallel Agents' }
            ].map((field) => (
              <div key={field.key} className="space-y-sm">
                <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">{field.label}</label>
                <input
                  value={settings[field.key]}
                  onChange={(e) => updateField(field.key, Number(e.target.value))}
                  type="number"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        <hr className="border-outline-variant/30" />

        <section className="space-y-md">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary">policy</span>
            Governance
          </h3>
          <div className="space-y-sm">
            {governanceKeys.map((toggle) => (
              <label key={toggle.key} className="flex items-center justify-between bg-surface-container p-md rounded-lg border border-outline-variant/50 cursor-pointer">
                <span className="text-body-sm text-on-surface">{toggle.label}</span>
                <input
                  checked={settings.governance[toggle.key]}
                  onChange={(e) => updateField('governance', { ...settings.governance, [toggle.key]: e.target.checked })}
                  type="checkbox"
                  className="w-5 h-5 accent-primary"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/30">
          <button onClick={reset} className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">Reset</button>
          <button onClick={() => toast('Settings saved', 'success')} className={cn('px-lg py-sm rounded-lg font-semibold flex items-center gap-sm transition-all active:scale-95', 'bg-primary-container text-on-primary-container hover:bg-primary')}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
