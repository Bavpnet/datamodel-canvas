import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useNodesInitialized,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
  type NodeChange,
} from '@xyflow/react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type CSSProperties,
} from 'react'
import { EdgeBridgeProvider } from './EdgeBridgeProvider'
import { AlignmentGuides } from './AlignmentGuides'
import { alignTable, type AlignmentGuide } from './snapAlignment'
import { connectionSides } from './connectionRouting'
import { findFreePosition, organizeTables, tableBounds } from './canvasLayout'
import { TABLE_DND_TYPE } from '../dnd'
import type { DemoCase } from '../data/demoCases'
import type { DataTable, RelationType } from '../types'
import { RelationEdge, type RelationFlowEdge } from './RelationEdge'
import { TableNode, type TableFlowNode } from './TableNode'
import '@xyflow/react/dist/style.css'
import './SchemaCanvas.css'
import { DesignIcon as Icon } from './DesignIcon'
import { ResizableRelationsPanel } from './ResizableRelationsPanel'
import { RelationForm, type RelationDraft } from './RelationForm'

function tableToNode(table: DataTable, position: { x: number; y: number }): TableFlowNode {
  return {
    id: table.id,
    type: 'table',
    width: 225,
    style: { width: 225 },
    position,
    data: { table },
  }
}

const defaultPositions: Record<string, { x: number; y: number }> = {
  execution: { x: 70, y: 304 },
  task: { x: 436, y: 67 },
  project: { x: 761, y: 67 },
  tariff: { x: 758, y: 424 },
}

function initialGraph(demoCase: DemoCase) {
  const ids = new Set(demoCase.initialTableIds)
  const edges: RelationFlowEdge[] = demoCase.relations.filter((relation) => ids.has(relation.sourceTableId) && ids.has(relation.targetTableId)).map((relation) => ({
    id: relation.id, source: relation.sourceTableId, target: relation.targetTableId,
    sourceHandle: `${relation.sourceColumnId}-source`, targetHandle: `${relation.targetColumnId}-target`, type: 'relation', data: { relationType: relation.type },
  }))
  const nodes = demoCase.tables.filter((table) => ids.has(table.id)).map((table) => tableToNode(table, defaultPositions[table.id] ?? { x: 60, y: 60 }))
  return { nodes: demoCase.id === 'complex' ? organizeTables(nodes, edges) : nodes, edges }
}

export type SchemaCanvasHandle = {
  selectField: (tableId: string, columnId: string) => void
  organize: () => void
  fit: () => void
  exportSchema: () => void
}

type SchemaCanvasProps = {
  demoCase: DemoCase
  onPlacedChange: (ids: Set<string>) => void
  onActiveFieldsChange: (keys: Set<string>) => void
  showRelations: boolean
  onCloseRelations: () => void
}

export const SchemaCanvas = forwardRef<SchemaCanvasHandle, SchemaCanvasProps>(
  function SchemaCanvas({ demoCase, onPlacedChange, onActiveFieldsChange, showRelations, onCloseRelations }, ref) {
    const [initial] = useState(() => initialGraph(demoCase))
    const dataModel = demoCase.tables
    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
    const relationsForTables = useCallback((tableIds: Set<string>): RelationFlowEdge[] => demoCase.relations
      .filter((relation) => tableIds.has(relation.sourceTableId) && tableIds.has(relation.targetTableId))
      .map((relation) => ({ id: relation.id, source: relation.sourceTableId, target: relation.targetTableId, sourceHandle: `${relation.sourceColumnId}-source`, targetHandle: `${relation.targetColumnId}-target`, type: 'relation', data: { relationType: relation.type } })), [demoCase.relations])
    const { screenToFlowPosition, fitView, setViewport, getViewport } = useReactFlow()
    const [guides, setGuides] = useState<AlignmentGuide[]>([])
    const onAlignedNodesChange = useCallback((changes: NodeChange<TableFlowNode>[]) => {
      const positions = changes.filter((change) => change.type === 'position' && change.position)
      // Keep group-drag spacing intact; individual cards receive alignment assistance.
      if (positions.length !== 1 || positions[0].type !== 'position' || !positions[0].position || typeof positions[0].dragging !== 'boolean') {
        onNodesChange(changes)
        return
      }
      const change = positions[0]
      const moving = nodes.find((node) => node.id === change.id)
      if (!moving) { onNodesChange(changes); return }
      const aligned = alignTable({ ...moving, position: change.position! }, nodes, getViewport().zoom)
      setGuides(change.dragging ? aligned.guides : [])
      onNodesChange(changes.map((item) => item === change ? { ...change, position: aligned.position } : item))
    }, [nodes, onNodesChange, getViewport])
    const canvasElement = useRef<HTMLDivElement>(null)
    const needsFit = useRef(false)
    const nodesInitialized = useNodesInitialized()
    const overviewInitialized = useRef(false)
    useEffect(() => {
      if (demoCase.id !== 'complex' || !nodesInitialized || overviewInitialized.current) return
      const frame = requestAnimationFrame(() => {
        void fitView({ padding: .15, maxZoom: 1, minZoom: .05 })
        overviewInitialized.current = true
      })
      return () => cancelAnimationFrame(frame)
    }, [demoCase.id, nodesInitialized, fitView])
    const viewportInitialized = useRef(false)
    useEffect(() => {
      if (!needsFit.current) return
      const frame = requestAnimationFrame(() => {
        void fitView({ padding: .18, duration: 300, maxZoom: 1 })
        needsFit.current = false
      })
      return () => cancelAnimationFrame(frame)
    }, [nodes, fitView])
    useEffect(() => {
      if (!canvasElement.current) return
      let frame = 0
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          const bounds = canvasElement.current?.getBoundingClientRect()
          if (bounds && bounds.width > 0 && bounds.height > 0 && !viewportInitialized.current) {
            viewportInitialized.current = true
            if (demoCase.id === 'simple') void setViewport({ x: 0, y: 0, zoom: Math.min(1, bounds.width / 1082, bounds.height / 906) })
          }
        })
      })
      observer.observe(canvasElement.current)
      return () => { observer.disconnect(); cancelAnimationFrame(frame) }
    }, [setViewport, demoCase.id])
    const [relationsWidth, setRelationsWidth] = useState(() => window.innerWidth < 1600 ? 400 : 520)
    const [editing, setEditing] = useState(false)

    const changeType = useCallback(
      (id: string, type: RelationType) => {
        setEdges((current) =>
          current.map((edge) =>
            edge.id === id ? { ...edge, data: { ...edge.data, relationType: type } } : edge,
          ),
        )
      },
      [setEdges],
    )

    const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null)

    const selectEdge = useCallback((id: string | null) => {
      setSelectedFieldKey(null)
      setEdges((current) => current.map((edge) => ({ ...edge, selected: edge.id === id })))
    }, [setEdges])

    const selectField = useCallback((tableId: string, columnId: string) => {
      setSelectedFieldKey(`${tableId}/${columnId}`)
      setEdges((current) => current.map((edge) => ({ ...edge, selected:
        (edge.source === tableId && edge.sourceHandle === `${columnId}-source`) ||
        (edge.target === tableId && edge.targetHandle === `${columnId}-target`)
      })))
    }, [setEdges])

    const connectorSides = useMemo(() => {
      const byId = new Map(nodes.map((node) => [node.id, node]))
      return new Map(edges.flatMap((edge) => {
        const source = byId.get(edge.source), target = byId.get(edge.target)
        return source && target ? [[edge.id, connectionSides(source, target)] as const] : []
      }))
    }, [nodes, edges])

    const displayEdges = useMemo(() => edges.map((edge) => {
      const sides = connectorSides.get(edge.id)
      const elevated = { ...edge, zIndex: edge.selected ? 2000 : 0 }
      return sides ? { ...elevated, sourceHandle: `${edge.sourceHandle}-${sides.source}`, targetHandle: `${edge.targetHandle}-${sides.target}` } : elevated
    }).sort((a, b) => Number(!!a.selected) - Number(!!b.selected)), [edges, connectorSides])

    const displayNodes = useMemo(() => nodes.map((node) => {
      const connections: NonNullable<TableFlowNode['data']['connections']> = []
      for (const edge of edges) {
        for (const side of ['source', 'target'] as const) {
          if (edge[side] !== node.id) continue
          const handle = side === 'source' ? edge.sourceHandle : edge.targetHandle
          if (!handle) continue
          const columnId = handle.replace(/-(source|target)$/, '')
          const position = connectorSides.get(edge.id)?.[side] ?? (side === 'source' ? 'right' : 'left')
          const existing = connections.find((c) => c.columnId === columnId && c.side === side && c.position === position)
          if (existing) existing.active ||= !!edge.selected
          else connections.push({ columnId, side, position, active: !!edge.selected })
        }
      }
      return { ...node, data: { ...node.data, connections, activeColumnIds: [...connections.filter((c) => c.active).map((c) => c.columnId), ...node.data.table.columns.filter((c) => selectedFieldKey === `${node.id}/${c.id}`).map((c) => c.id)], onSelectField: selectField } }
    }), [nodes, edges, selectField, selectedFieldKey, connectorSides])

    useEffect(() => {
      const fields = new Set<string>()
      if (selectedFieldKey) fields.add(selectedFieldKey)
      for (const edge of edges.filter((item) => item.selected)) {
        fields.add(`${edge.source}/${edge.sourceHandle?.replace(/-source$/, '')}`)
        fields.add(`${edge.target}/${edge.targetHandle?.replace(/-target$/, '')}`)
      }
      onActiveFieldsChange(fields)
    }, [edges, selectedFieldKey, onActiveFieldsChange])

    const nodeTypes = useMemo<NodeTypes>(() => ({ table: TableNode }), [])
    const edgeTypes = useMemo<EdgeTypes>(
      () => ({ relation: (props) => <RelationEdge {...props} onSelect={selectEdge} /> }),
      [selectEdge],
    )

    useEffect(() => {
      onPlacedChange(new Set(nodes.map((node) => node.id)))
    }, [nodes, onPlacedChange])

    const addTableAt = useCallback(
      (table: DataTable, position: { x: number; y: number }) => {
        setNodes((current) => {
          if (current.some((node) => node.id === table.id)) return current
          const node = tableToNode(table, position)
          node.position = findFreePosition(node, current, position)
          return [...current, node]
        })
        setEdges((currentEdges) => {
          const ids = new Set([...nodes.map((node) => node.id), table.id])
          const nextRelations = relationsForTables(ids).filter(
            (edge) => !currentEdges.some((existing) => existing.id === edge.id),
          )
          return [...currentEdges, ...nextRelations]
        })
      },
      [nodes, setEdges, setNodes, relationsForTables],
    )

    const createRelation = (draft: RelationDraft): string | null => {
      const sourceTable = dataModel.find((table) => table.id === draft.sourceTableId)
      const targetTable = dataModel.find((table) => table.id === draft.targetTableId)
      if (!sourceTable || !targetTable || sourceTable.id === targetTable.id ||
          !sourceTable.columns.some((column) => column.id === draft.sourceColumnId) ||
          !targetTable.columns.some((column) => column.id === draft.targetColumnId)) return 'Выберите таблицы и столбцы.'
      const duplicate = edges.some((edge) =>
        (edge.source === draft.sourceTableId && edge.sourceHandle === `${draft.sourceColumnId}-source` && edge.target === draft.targetTableId && edge.targetHandle === `${draft.targetColumnId}-target`) ||
        (edge.target === draft.sourceTableId && edge.targetHandle === `${draft.sourceColumnId}-target` && edge.source === draft.targetTableId && edge.sourceHandle === `${draft.targetColumnId}-source`))
      if (duplicate) return 'Связь между этими столбцами уже существует.'
      setNodes((current) => {
        const missing = [sourceTable, targetTable].filter((table) => !current.some((node) => node.id === table.id))
        const placed = [...current]
        const anchor = current.find((node) => node.id === sourceTable.id || node.id === targetTable.id)
        const origin = anchor ? { x: anchor.position.x + tableBounds(anchor).width + 100, y: anchor.position.y } : { x: 60, y: 60 }
        for (const table of missing) {
          const node = tableToNode(table, origin)
          node.position = findFreePosition(node, placed, origin)
          placed.push(node)
        }
        return placed
      })
      needsFit.current = true
      const id = `rel-${crypto.randomUUID()}`
      setSelectedFieldKey(null)
      setEdges((current) => addEdge<RelationFlowEdge>({ id, source: draft.sourceTableId, target: draft.targetTableId, sourceHandle: `${draft.sourceColumnId}-source`, targetHandle: `${draft.targetColumnId}-target`, type: 'relation', selected: true, data: { relationType: draft.type } }, current.map((edge) => ({ ...edge, selected: false }))))
      setEditing(false)
      return null
    }

    useImperativeHandle(
      ref,
      () => ({
        organize: () => {
          needsFit.current = true
          setNodes((current) => organizeTables(current, edges))
        },
        fit: () => { void fitView({ padding: .12, duration: 300 }) },
        exportSchema: () => {
          const url = URL.createObjectURL(new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' }))
          const link = document.createElement('a'); link.href = url; link.download = 'datamodel.json'; link.click(); URL.revokeObjectURL(url)
        },
        selectField,
      }),
      [nodes, edges, fitView, selectField, setNodes],
    )

    const onDragOver = useCallback((event: DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
      (event: DragEvent) => {
        event.preventDefault()
        const tableId = event.dataTransfer.getData(TABLE_DND_TYPE)
        const table = dataModel.find((item) => item.id === tableId)
        if (!table) return
        addTableAt(table, screenToFlowPosition({ x: event.clientX, y: event.clientY }))
      },
      [addTableAt, screenToFlowPosition, dataModel],
    )

    return (
      <EdgeBridgeProvider order={displayEdges.map((edge) => edge.id)}>
      <div className={`canvas-layout ${showRelations ? 'with-relations' : ''}`} style={{ '--relations-width': `${relationsWidth}px` } as CSSProperties}><div className="schema-canvas" ref={canvasElement}>
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onAlignedNodesChange}
          onNodeDragStart={() => setGuides([])}
          onNodeDragStop={() => setGuides([])}
          onEdgesChange={onEdgesChange}
          nodesConnectable={false}
          edgesReconnectable={false}
          elevateEdgesOnSelect
          onEdgeClick={(_, edge) => selectEdge(edge.id)}
          onPaneClick={() => selectEdge(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          minZoom={demoCase.id === 'complex' ? .05 : .25}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#b8c3d1" />
          <Controls showInteractive={false} />
        </ReactFlow>
        <AlignmentGuides guides={guides} />

      </div>
      {showRelations && <ResizableRelationsPanel width={relationsWidth} onWidthChange={setRelationsWidth}><aside className={`relations-panel ${editing ? 'relations-panel--editing' : ''}`} aria-label="Связи">
        <header><h2>{editing ? 'Новая связь' : 'Связи'}</h2><button className="icon-button" title={editing ? 'Отменить создание связи' : 'Закрыть связи'} onClick={() => { if (editing) setEditing(false); else onCloseRelations() }}><Icon name="close" /></button></header>
        {editing ? <RelationForm tables={dataModel} onSubmit={createRelation} onCancel={() => setEditing(false)} /> : <>
        <button className="outlined relation-add" onClick={() => setEditing(true)}><Icon name="plus" />Добавить</button>
        {edges.map((edge) => {
          const a = dataModel.find((t) => t.id === edge.source)
          const b = dataModel.find((t) => t.id === edge.target)
          const ac = a?.columns.find((c) => `${c.id}-source` === edge.sourceHandle)
          const bc = b?.columns.find((c) => `${c.id}-target` === edge.targetHandle)
          return <article className={`relation-card ${edge.selected ? 'is-selected' : ''}`} key={edge.id} onClick={() => selectEdge(edge.id)}>
            <p>{a?.name} ({ac?.name}) <Icon name="divider" /> {b?.name} ({bc?.name})</p>
            <div className="relation-card__actions"><select onClick={(event) => event.stopPropagation()} aria-label={`Тип связи ${a?.name} — ${b?.name}`} value={edge.data?.relationType} onChange={(e) => changeType(edge.id, e.target.value as RelationType)}>{(['1:1', '1:N', 'N:1', 'N:M'] as const).map((type) => <option key={type}>{type}</option>)}</select><button className="relation-remove" title="Удалить связь" onClick={(event) => { event.stopPropagation(); setEdges((items) => items.filter((item) => item.id !== edge.id)) }}><Icon name="close" /></button></div>
          </article>
        })}
        {!edges.length && <p className="relations-empty">Добавьте связь через панель «Связи».</p>}
        </>}
      </aside></ResizableRelationsPanel>}
      </div>
      </EdgeBridgeProvider>
    )
  },
)
