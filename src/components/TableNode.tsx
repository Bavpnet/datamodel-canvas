import { Handle, NodeResizeControl, ResizeControlVariant, Position, useStore, useUpdateNodeInternals, type Node, type NodeProps } from '@xyflow/react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { TableNodeData } from '../types'
import { DesignIcon } from './DesignIcon'
import { KindIcon } from './icons'
import './TableNode.css'

export type TableFlowNode = Node<TableNodeData, 'table'>
export function TableNode({ id, data, width }: NodeProps<TableFlowNode>) {
  const { table, connections = [], activeColumnIds = [], onSelectField, collapsed = false, onCollapsedChange, onHeightChange } = data
  const update = useUpdateNodeInternals()
  const zoom = useStore((state) => state.transform[2])
  const resize = useRef<{ y: number; height: number; zoom: number; fromTop: boolean } | null>(null)
  const [resizingSide, setResizingSide] = useState<string | null>(null)
  const height = data.expandedHeight ?? Math.max(100, Math.min(500, 59 + table.columns.length * 40))
  const connectionKeys = connections.map((c) => `${c.columnId}/${c.side}/${c.position}`).join(',')
  useLayoutEffect(() => { update(id) }, [collapsed, connectionKeys, width, height, id, update])
  const renderHandle = (connection: (typeof connections)[number]) => <Handle
    key={`${connection.columnId}-${connection.side}-${connection.position}`}
    type={connection.side}
    position={connection.position === 'right' ? Position.Right : Position.Left}
    id={`${connection.columnId}-${connection.side}-${connection.position}`}
    isConnectable={false} isConnectableStart={false} isConnectableEnd={false}
    className={`table-node__handle table-node__handle--${connection.position}`}
  />
  return <>
    {(['left', 'right'] as const).map((side) => <NodeResizeControl key={side} position={side} variant={ResizeControlVariant.Line} resizeDirection="horizontal" minWidth={150} maxWidth={500} className={`table-width-resizer nodrag ${resizingSide === side ? 'is-resizing' : ''}`} style={{ width: 10 / zoom }} onResizeStart={() => setResizingSide(side)} onResizeEnd={() => setResizingSide(null)} />)}
    {!collapsed && (['top', 'bottom'] as const).map((side) => <div key={side} className={`table-height-resizer table-height-resizer--${side} nodrag nopan ${resizingSide === side ? 'is-resizing' : ''}`} style={{ height: 10 / zoom }}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault(); event.stopPropagation()
        resize.current = { y: event.clientY, height, zoom, fromTop: side === 'top' }
        event.currentTarget.setPointerCapture(event.pointerId); setResizingSide(side)
      }}
      onPointerMove={(event) => {
        const start = resize.current
        if (!start) return
        onHeightChange?.(id, start.height + (event.clientY - start.y) / start.zoom * (start.fromTop ? -1 : 1), start.fromTop)
      }}
      onPointerUp={(event) => { resize.current = null; setResizingSide(null); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
      onPointerCancel={() => { resize.current = null; setResizingSide(null) }}
      onLostPointerCapture={() => { resize.current = null; setResizingSide(null) }}
    />)}
    <article className={`table-node ${collapsed ? 'is-collapsed' : ''}`} style={{ height: collapsed ? 50 : height }}>
      <header className="table-node__header">
        <DesignIcon name="database" /><span className="table-node__name" title={table.name}>{table.name}</span>
        <button className="table-node__collapse nodrag" onClick={(event) => { event.stopPropagation(); onCollapsedChange?.(id, !collapsed) }} aria-label={`${collapsed ? 'Развернуть' : 'Свернуть'} ${table.name}`} aria-expanded={!collapsed}><DesignIcon name={collapsed ? 'down' : 'up'} /></button>
      </header>
      {!collapsed && <div className="table-node__columns-viewport nodrag nowheel nopan" tabIndex={0} role="region" aria-label={`Столбцы таблицы ${table.name}`}>
        <ul className="table-node__columns">{table.columns.map((column) => <li key={column.id} data-column-id={column.id} className={`table-node__column ${activeColumnIds.includes(column.id) ? 'is-active' : ''}`}>
          <button className="table-node__column-button nodrag" onClick={(event) => { event.stopPropagation(); onSelectField?.(table.id, column.id) }} aria-pressed={activeColumnIds.includes(column.id)} title={`${column.name} · ${column.typeLabel}`}><KindIcon kind={column.kind} /><span>{column.name}</span></button>
        </li>)}</ul>
      </div>}
      {connections.map(renderHandle)}
    </article>
  </>
}
