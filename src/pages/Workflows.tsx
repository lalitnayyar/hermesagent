import { useState, useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, type Node, type Edge, type Connection, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore, domains } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'

const WorkflowNode = ({ data }: { data: { label: string; icon: string; color: string } }) => (
  <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 min-w-[140px] shadow-lg hover:border-primary/40 transition-colors cursor-pointer">
    <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
    <div className="flex items-center gap-2">
      <span className={cn('material-symbols-outlined', data.color === 'secondary' ? 'text-secondary' : data.color === 'tertiary' ? 'text-tertiary' : 'text-primary')}>{data.icon}</span>
      <span className="text-xs font-semibold text-on-surface">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
  </div>
)

const nodeTypes = { workflowNode: WorkflowNode }

export default function Workflows() {
  const { workflows, addWorkflow, updateWorkflowNodes, updateWorkflowEdges, publishWorkflow, deleteWorkflow, toast } = useAppStore()
  const [selectedId, setSelectedId] = useState<string>(workflows[0]?.id ?? '')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState(domains[0])
  const [nodeLabel, setNodeLabel] = useState('')

  const selected = workflows.find((w) => w.id === selectedId) ?? workflows[0]
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId])

  useEffect(() => {
    if (selected) {
      setNodes(selected.nodes)
      setEdges(selected.edges)
      setSelectedNodeId(null)
    }
  }, [selected?.id, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#b4c5ff' } }, eds)),
    [setEdges]
  )

  const handleSave = () => {
    if (!selected) return
    updateWorkflowNodes(selected.id, nodes)
    updateWorkflowEdges(selected.id, edges)
    toast('Workflow saved', 'success')
  }

  const handlePublish = () => {
    if (!selected) return
    publishWorkflow(selected.id)
  }

  const handleDelete = () => {
    if (!selected) return
    deleteWorkflow(selected.id)
    setSelectedId(workflows.find((w) => w.id !== selected.id)?.id ?? '')
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    const wf = addWorkflow(newName, newDomain)
    setSelectedId(wf.id)
    setModalOpen(false)
    setNewName('')
  }

  const addNode = () => {
    if (!nodeLabel.trim() || !selected) return
    const id = `node-${Date.now()}`
    const newNode: Node = {
      id,
      type: 'workflowNode',
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: nodeLabel, icon: 'hub', color: 'tertiary' }
    }
    const nextNodes = [...nodes, newNode]
    setNodes(nextNodes)
    updateWorkflowNodes(selected.id, nextNodes)
    setNodeLabel('')
    toast('Block added', 'success')
  }

  const updateSelectedNode = (updates: Partial<{ label: string; icon: string; color: string }>) => {
    if (!selectedNode) return
    const nextNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? { ...n, data: { ...n.data, ...updates } as typeof n.data }
        : n
    )
    setNodes(nextNodes)
    if (selected) updateWorkflowNodes(selected.id, nextNodes)
  }

  const deleteSelectedNode = () => {
    if (!selected || !selectedNode) return
    const nextNodes = nodes.filter((n) => n.id !== selectedNode.id)
    const nextEdges = edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    setNodes(nextNodes)
    setEdges(nextEdges)
    updateWorkflowNodes(selected.id, nextNodes)
    updateWorkflowEdges(selected.id, nextEdges)
    setSelectedNodeId(null)
    toast('Block deleted', 'info')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-md h-[calc(100vh-8rem)]">
      <aside className="w-full lg:w-72 shrink-0 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-widest">Workflow Library</h3>
          <span className="text-[10px] text-outline font-tech-mono">{workflows.length} workflows</span>
        </div>
        <div className="flex-1 overflow-y-auto p-md space-y-sm">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => setSelectedId(wf.id)}
              className={cn(
                'w-full text-left p-md rounded-lg border transition-all',
                selected?.id === wf.id ? 'bg-surface-container border-primary/40' : 'bg-surface-container-low border-outline-variant hover:border-primary/30'
              )}
            >
              <div className="flex justify-between items-start mb-xs">
                <span className="font-body-sm font-semibold text-on-surface">{wf.name}</span>
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] uppercase border', wf.status === 'published' ? 'text-secondary border-secondary/30 bg-secondary/10' : 'text-tertiary border-tertiary/30 bg-tertiary/10')}>
                  {wf.status}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-[11px]">
                <span>{wf.domain}</span>
                <span>{wf.nodes.length} nodes</span>
              </div>
            </button>
          ))}
        </div>
        <div className="p-md border-t border-outline-variant space-y-sm">
          <button onClick={() => setModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-on-primary px-md py-sm rounded-lg font-semibold flex items-center justify-center gap-sm transition-colors">
            <span className="material-symbols-outlined">add</span>
            New Workflow
          </button>
        </div>
      </aside>

      <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden relative flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-sm p-md border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur z-10">
          <div className="flex items-center gap-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface hidden md:block">{selected?.name ?? 'Workflow'}</h2>
            <span className={cn('px-sm py-0.5 rounded border text-[10px] uppercase', selected?.status === 'published' ? 'text-secondary border-secondary/30 bg-secondary/10' : 'text-tertiary border-tertiary/30 bg-tertiary/10')}>
              {selected?.status}
            </span>
          </div>
          <div className="flex items-center gap-xs flex-wrap">
            {selectedNode ? (
              <>
                <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-md py-1.5 gap-sm">
                  <input
                    value={(selectedNode.data as { label: string; icon: string; color: string }).label ?? ''}
                    onChange={(e) => updateSelectedNode({ label: e.target.value })}
                    placeholder="Block label"
                    className="bg-transparent outline-none text-body-sm text-on-surface placeholder:text-outline w-28"
                  />
                  <input
                    value={(selectedNode.data as { label: string; icon: string; color: string }).icon ?? ''}
                    onChange={(e) => updateSelectedNode({ icon: e.target.value })}
                    placeholder="Icon"
                    className="bg-transparent outline-none text-body-sm text-on-surface placeholder:text-outline w-20"
                  />
                  <select
                    value={(selectedNode.data as { label: string; icon: string; color: string }).color ?? 'primary'}
                    onChange={(e) => updateSelectedNode({ color: e.target.value })}
                    className="bg-surface-container-high text-body-sm text-on-surface rounded px-sm py-0.5"
                  >
                    <option value="primary">primary</option>
                    <option value="secondary">secondary</option>
                    <option value="tertiary">tertiary</option>
                  </select>
                </div>
                <button onClick={deleteSelectedNode} className="p-sm hover:bg-error-container hover:text-on-error-container rounded-full text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
                <button onClick={() => setSelectedNodeId(null)} className="px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">
                  Deselect
                </button>
              </>
            ) : (
              <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-md py-1.5">
                <input value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} placeholder="Step label" className="bg-transparent outline-none text-body-sm text-on-surface placeholder:text-outline w-28" />
                <button onClick={addNode} disabled={!nodeLabel.trim()} className="text-primary disabled:text-outline font-label-xs text-label-xs uppercase font-bold ml-sm">Add</button>
              </div>
            )}
            <button onClick={handleSave} className="flex items-center gap-sm px-md py-sm bg-surface-container hover:bg-surface-variant border border-outline-variant rounded-full text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="font-label-xs text-label-xs uppercase hidden sm:inline">Save</span>
            </button>
            <button onClick={() => toast('Workflow validated successfully', 'success')} className="flex items-center gap-sm px-md py-sm bg-surface-container hover:bg-surface-variant border border-outline-variant rounded-full text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span className="font-label-xs text-label-xs uppercase hidden sm:inline">Validate</span>
            </button>
            {selected?.status === 'draft' && (
              <button onClick={handlePublish} className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary rounded-full font-bold transition-all">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span className="font-label-xs text-label-xs uppercase">Publish</span>
              </button>
            )}
            <button onClick={handleDelete} className="p-sm hover:bg-error-container hover:text-on-error-container rounded-full text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
        <div className="relative flex-1">
          {selected ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} color="#1e293b" />
              <Controls />
              <MiniMap className="!bg-surface-container-low !border-outline-variant" nodeColor="#b4c5ff" maskColor="rgba(11,19,38,0.5)" />
            </ReactFlow>
          ) : (
            <div className="flex h-full items-center justify-center text-on-surface-variant">
              No workflow selected. Create one to start designing.
            </div>
          )}
        </div>
      </section>

      <Modal open={modalOpen} title="New Workflow" onClose={() => setModalOpen(false)}>
        <div className="space-y-md">
          <div className="space-y-sm">
            <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div className="space-y-sm">
            <label className="text-label-xs text-outline uppercase tracking-wider font-label-xs">Domain</label>
            <select value={newDomain} onChange={(e) => setNewDomain(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none">
              {domains.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/30">
            <button onClick={() => setModalOpen(false)} className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">Cancel</button>
            <button onClick={handleCreate} disabled={!newName.trim()} className="px-lg py-sm rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
