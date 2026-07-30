import { useState } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAppStore } from '@/lib/store'

export default function ChatTest() {
  const { settings } = useAppStore()
  const [message, setMessage] = useState('capital of india')
  const [gateway, setGateway] = useState(settings.gateway || 'http://hermes-agent:9119')
  const [endpoint, setEndpoint] = useState('/chat')
  const [username, setUsername] = useState(settings.hermesUsername || '')
  const [password, setPassword] = useState(settings.hermesPassword || '')
  const [ollamaHost, setOllamaHost] = useState(settings.ollamaHost || 'http://host.docker.internal:11434')
  const [model, setModel] = useState('gemma4:cloud')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendHermes() {
    setLoading(true)
    setResult('')
    try {
      const data = await api.chat({
        message,
        gateway,
        endpoint,
        username,
        password
      })
      setResult(`Status: ${data.status}\n\n${data.body}`)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function sendOllama() {
    setLoading(true)
    setResult('')
    try {
      const data = await api.ollama({ message, model, host: ollamaHost })
      setResult(`Status: ${data.status}\n\n${data.body}`)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-md max-w-5xl">
      <h2 className="font-headline-md text-headline-md text-on-surface">Hermes / Ollama Chat Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Hermes Gateway URL</label>
          <input
            type="text"
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Endpoint</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Hermes Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Hermes Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface-variant">Ollama Host</label>
          <input
            type="text"
            value={ollamaHost}
            onChange={(e) => setOllamaHost(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
          <label className="text-label-sm text-on-surface-variant">Ollama Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface"
          />
        </div>
      </div>
      <div className="flex gap-md">
        <button
          onClick={sendHermes}
          disabled={loading}
          className={cn(
            'px-lg py-sm rounded-lg font-label-sm',
            loading ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary'
          )}
        >
          {loading ? 'Sending...' : 'Send to Hermes'}
        </button>
        <button
          onClick={sendOllama}
          disabled={loading}
          className={cn(
            'px-lg py-sm rounded-lg font-label-sm',
            loading ? 'bg-surface-variant text-on-surface-variant' : 'bg-secondary text-on-secondary'
          )}
        >
          {loading ? 'Asking...' : 'Ask Ollama'}
        </button>
      </div>
      {result && (
        <pre className="bg-surface-container-high border border-outline-variant rounded-lg p-md text-body-sm text-on-surface whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  )
}
