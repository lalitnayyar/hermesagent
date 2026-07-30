import { useState, useCallback, useEffect, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, useReactFlow, ReactFlowProvider, type Node, type Edge, type Connection, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore, domains } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'

interface WorkflowNodeData {
  label: string
  icon: string
  color: string
  shape?: string
}

type BlockTemplate = {
  label: string
  icon: string
  color: 'primary' | 'secondary' | 'tertiary'
  shape: 'rounded' | 'diamond'
}

const BLOCKS: BlockTemplate[] = [
  { label: 'Start', icon: 'play_arrow', color: 'primary', shape: 'rounded' },
  { label: 'Agent', icon: 'psychology', color: 'secondary', shape: 'rounded' },
  { label: 'Action', icon: 'bolt', color: 'secondary', shape: 'rounded' },
  { label: 'Decision', icon: 'question_mark', color: 'tertiary', shape: 'diamond' },
  { label: 'Tool', icon: 'build', color: 'tertiary', shape: 'rounded' },
  { label: 'End', icon: 'flag', color: 'primary', shape: 'rounded' }
]

const colorClass = (color?: string) =>
  color === 'secondary' ? 'text-secondary' : color === 'tertiary' ? 'text-tertiary' : 'text-primary'

const WorkflowNode = ({ id, data }: { id: string; data: Record<string, unknown> }) => {
  const d = data as unknown as WorkflowNodeData
  const setSelected = useAppStore((s) => s.setSelectedWorkflowNodeId)
  const isDiamond = d.shape === 'diamond'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(id)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex items-center justify-center shadow-lg hover:border-primary/40 transition-colors cursor-pointer',
        isDiamond ? 'w-32 h-32' : 'bg-surface-container border border-outline-variant rounded-lg px-3 py-2 min-w-[140px]'
      )}
    >
      {isDiamond ? (
        <>
          <div
            className="absolute inset-0 m-auto w-24 h-24 bg-surface-container border border-outline-variant flex items-center justify-center"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
            <span className={cn('material-symbols-outlined text-[18px]', colorClass(d.color))}>{d.icon}</span>
            <span className="text-[10px] font-semibold text-on-surface max-w-[80px] truncate">{d.label}</span>
          </div>
        </>
      ) : (
        <>
          <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
          <div className="flex items-center gap-2">
            <span className={cn('material-symbols-outlined', colorClass(d.color))}>{d.icon}</span>
            <span className="text-xs font-semibold text-on-surface">{d.label}</span>
          </div>
          <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
        </>
      )}
      {isDiamond && (
        <>
          <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
          <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
        </>
      )}
    </div>
  )
}

const nodeTypes = { workflowNode: WorkflowNode }

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (params: Connection) => void
  onPaneClick: () => void
  onDropNode: (block: BlockTemplate, position: { x: number; y: number }) => void
}

const FlowCanvas = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onPaneClick, onDropNode }: FlowCanvasProps) => {
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const raw = event.dataTransfer.getData('application/reactflow')
      if (!raw) return
      const block: BlockTemplate = JSON.parse(raw)
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      onDropNode(block, position)
    },
    [onDropNode, screenToFlowPosition]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={onPaneClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={24} color="#1e293b" />
      <Controls />
      <MiniMap className="!bg-surface-container-low !border-outline-variant" nodeColor="#b4c5ff" maskColor="rgba(11,19,38,0.5)" />
    </ReactFlow>
  )
}

export default function Workflows() {
  const {
    workflows,
    addWorkflow,
    updateWorkflowNodes,
    updateWorkflowEdges,
    publishWorkflow,
    deleteWorkflow,
    toast,
    selectedWorkflowNodeId,
    setSelectedWorkflowNodeId
  } = useAppStore()
  const [selectedId, setSelectedId] = useState<string>(workflows[0]?.id ?? '')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState(domains[0])
  const [nodeLabel, setNodeLabel] = useState('')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const selected = workflows.find((w) => w.id === selectedId) ?? workflows[0]
  const selectedNode = nodes.find((n) => n.id === selectedWorkflowNodeId)

  useEffect(() => {
    if (selected) {
      setNodes(selected.nodes)
      setEdges(selected.edges)
      setSelectedWorkflowNodeId(null)
    }
  }, [selected?.id, setNodes, setEdges, setSelectedWorkflowNodeId])

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

  const createNode = (data: WorkflowNodeData, position: { x: number; y: number }) => {
    const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    return {
      id,
      type: 'workflowNode',
      position,
      data: data as unknown as Record<string, unknown>
    } as unknown as Node
  }

  const addNode = () => {
    if (!nodeLabel.trim() || !selected) return
    const newNode = createNode({ label: nodeLabel, icon: 'hub', color: 'tertiary', shape: 'rounded' }, { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 })
    const nextNodes = [...nodes, newNode]
    setNodes(nextNodes)
    updateWorkflowNodes(selected.id, nextNodes)
    setNodeLabel('')
    toast('Block added', 'success')
  }

  const onDropNode = (block: BlockTemplate, position: { x: number; y: number }) => {
    if (!selected) return
    const newNode = createNode({ label: block.label, icon: block.icon, color: block.color, shape: block.shape }, position)
    const nextNodes = [...nodes, newNode]
    setNodes(nextNodes)
    updateWorkflowNodes(selected.id, nextNodes)
    toast(`${block.label} block added`, 'success')
  }

  const updateSelectedNode = (updates: Partial<WorkflowNodeData>) => {
    if (!selectedNode || !selected) return
    const nextNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? ({ ...n, data: { ...n.data, ...updates } as unknown as Record<string, unknown> } as Node)
        : n
    ) as Node[]
    setNodes(nextNodes)
    updateWorkflowNodes(selected.id, nextNodes)
  }

  const deleteSelectedNode = () => {
    if (!selected || !selectedNode) return
    const nextNodes = nodes.filter((n) => n.id !== selectedNode.id)
    const nextEdges = edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    setNodes(nextNodes)
    setEdges(nextEdges)
    updateWorkflowNodes(selected.id, nextNodes)
    updateWorkflowEdges(selected.id, nextEdges)
    setSelectedWorkflowNodeId(null)
    toast('Block deleted', 'info')
  }

  const onDragStart = (event: React.DragEvent, block: BlockTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block))
    event.dataTransfer.effectAllowed = 'move'
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
                    value={(selectedNode.data as unknown as WorkflowNodeData)?.label ?? ''}
                    onChange={(e) => updateSelectedNode({ label: e.target.value })}
                    placeholder="Block label"
                    className="bg-transparent outline-none text-body-sm text-on-surface placeholder:text-outline w-28"
                  />
                  <input
                    value={(selectedNode.data as unknown as WorkflowNodeData)?.icon ?? ''}
                    onChange={(e) => updateSelectedNode({ icon: e.target.value })}
                    placeholder="Icon"
                    className="bg-transparent outline-none text-body-sm text-on-surface placeholder:text-outline w-20"
                  />
                  <select
                    value={(selectedNode.data as unknown as WorkflowNodeData)?.color ?? 'primary'}
                    onChange={(e) => updateSelectedNode({ color: e.target.value })}
                    className="bg-surface-container-high text-body-sm text-on-surface rounded px-sm py-0.5"
                  >
                    <option value="primary">primary</option>
                    <option value="secondary">secondary</option>
                    <option value="tertiary">tertiary</option>
                  </select>
                  <select
                    value={(selectedNode.data as unknown as WorkflowNodeData)?.shape ?? 'rounded'}
                    onChange={(e) => updateSelectedNode({ shape: e.target.value })}
                    className="bg-surface-container-high text-body-sm text-on-surface rounded px-sm py-0.5"
                  >
                    <option value="rounded">rounded</option>
                    <option value="diamond">diamond</option>
                  </select>
                </div>
                <button onClick={deleteSelectedNode} className="p-sm hover:bg-error-container hover:text-on-error-container rounded-full text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
                <button onClick={() => setSelectedWorkflowNodeId(null)} className="px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors font-semibold">
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
        <div ref={reactFlowWrapper} className="relative flex-1">
          {selected ? (
            <ReactFlowProvider>
              <FlowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onPaneClick={() => setSelectedWorkflowNodeId(null)}
                onDropNode={onDropNode}
              />
            </ReactFlowProvider>
          ) : (
            <div className="flex h-full items-center justify-center text-on-surface-variant">
              No workflow selected. Create one to start designing.
            </div>
          )}
        </div>
      </section>

      <aside className="w-full lg:w-56 shrink-0 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col overflow-hidden">
        <div className="p-md border-b border-outline-variant">
          <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-widest">Block Widget</h3>
          <p className="text-[11px] text-on-surface-variant mt-xs">Drag a block onto the canvas</p>
        </div>
        <div className="flex-1 overflow-y-auto p-md space-y-sm">
          {BLOCKS.map((block) => (
            <div
              key={block.label}
              draggable
              onDragStart={(e) => onDragStart(e, block)}
              className="flex items-center gap-sm p-sm rounded-lg bg-surface-container border border-outline-variant hover:border-primary/40 cursor-grab active:cursor-grabbing transition-colors"
            >
              <span className={cn('material-symbols-outlined', colorClass(block.color))}>{block.icon}</span>
              <span className="text-body-sm text-on-surface font-medium">{block.label}</span>
            </div>
          ))}
        </div>
        <div className="p-md border-t border-outline-variant space-y-sm">
          <h4 className="font-label-xs text-label-xs text-outline uppercase tracking-wider">Sample</h4>
          <button
            onClick={() => setSelectedId('wf-conditional-approval')}
            className="w-full text-left p-sm rounded-lg bg-surface-container border border-outline-variant hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-tertiary">account_tree</span>
              <span className="text-body-sm text-on-surface">Conditional Approval</span>
            </div>
          </button>
        </div>
      </aside>

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
