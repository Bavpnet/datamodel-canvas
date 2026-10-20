import { Handle, NodeResizeControl, ResizeControlVariant, Position, useStore, useUpdateNodeInternals, type Node, type NodeProps } from '@xyflow/react'
import { Fragment, useEffect, useState } from 'react'
import type { TableNodeData } from '../types'
import { DesignIcon } from './DesignIcon'
import { KindIcon } from './icons'
import './TableNode.css'

export type TableFlowNode = Node<TableNodeData, 'table'>
export function TableNode({ id, data, width }: NodeProps<TableFlowNode>) {
  const { table, connections = [], activeColumnIds = [], onSelectField, collapsed = false, onCollapsedChange } = data
  const update = useUpdateNodeInternals()
  const zoom = useStore((state) => state.transform[2])
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null)
  const connectionKeys = connections.map((c) => `${c.columnId}/${c.side}/${c.position}`).join(',')
  useEffect(() => { update(id) }, [collapsed, connectionKeys, width, id, update])
  const renderHandle = (connection: (typeof connections)[number]) => <Fragment key={`${connection.columnId}-${connection.side}-${connection.position}`}>
    <span aria-hidden="true" className={`table-node__connection-lead table-node__connection-lead--${connection.position} ${connection.active ? 'is-active' : ''}`} />
    <Handle
    type={connection.side}
    position={connection.position === 'right' ? Position.Right : Position.Left}
    id={`${connection.columnId}-${connection.side}-${connection.position}`}
    isConnectable={false}
    isConnectableStart={false}
    isConnectableEnd={false}
    className={`table-node__handle table-node__handle--${connection.position} ${connection.active ? 'is-active' : ''}`}
  /></Fragment>
  return <>{(['left', 'right'] as const).map((side) => <NodeResizeControl
    key={side}
    position={side}
    variant={ResizeControlVariant.Line}
    resizeDirection="horizontal"
    minWidth={150}
    maxWidth={500}
    className={`table-width-resizer nodrag ${resizingSide === side ? 'is-resizing' : ''}`}
    style={{ width: 10 / zoom }}
    onResizeStart={() => setResizingSide(side)}
    onResizeEnd={() => setResizingSide(null)}
  />)}
  <article className={`table-node ${collapsed ? 'is-collapsed' : ''}`}>
    <header className="table-node__header">
      <DesignIcon name="database" />
      <span className="table-node__name" title={table.name}>{table.name}</span>
      <button className="table-node__collapse nodrag" onClick={(event) => { event.stopPropagation(); onCollapsedChange?.(id, !collapsed) }} aria-label={`${collapsed ? 'Развернуть' : 'Свернуть'} ${table.name}`} aria-expanded={!collapsed}><DesignIcon name={collapsed ? 'down' : 'up'} /></button>
      {collapsed && <>
        {connections.map(renderHandle)}
        {(['left', 'right'] as const).filter((side) => connections.some((connection) => connection.position === side)).map((side) => <span
          key={side}
          aria-hidden="true"
          className={`table-node__collapsed-dot table-node__handle--${side} ${connections.some((connection) => connection.position === side && connection.active) ? 'is-active' : ''}`}
        />)}
      </>}
    </header>
    {!collapsed && <ul className="table-node__columns">
      {table.columns.map((column) => <li key={column.id} data-column-id={column.id} className={`table-node__column ${activeColumnIds.includes(column.id) ? 'is-active' : ''}`}>
        {connections.filter((c) => c.columnId === column.id).map(renderHandle)}
        <button className="table-node__column-button nodrag" onClick={(event) => { event.stopPropagation(); onSelectField?.(table.id, column.id) }} aria-pressed={activeColumnIds.includes(column.id)} title={`${column.name} · ${column.typeLabel}`}><KindIcon kind={column.kind} /><span>{column.name}</span></button>
      </li>)}
    </ul>}
  </article></>
}
