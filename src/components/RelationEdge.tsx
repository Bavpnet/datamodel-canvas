import {
  BaseEdge,
  Position,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'
import type { RelationEdgeData } from '../types'
import './RelationEdge.css'
import { useEdgeBridge } from './useEdgeBridge'

export type RelationFlowEdge = Edge<RelationEdgeData, 'relation'>

type RelationEdgeProps = EdgeProps<RelationFlowEdge> & {
  onSelect?: (id: string) => void
}

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
  onSelect,
}: RelationEdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
    offset: sourcePosition !== targetPosition ? Math.min(20, Math.abs(targetX - sourceX) / 2) : 20,
  })

  const relationType = data?.relationType ?? '1:N'
  const bridged = useEdgeBridge({ id, path, selected: !!selected })

  return (
    <>
      {selected && <path className="relation-edge__selection-halo" d={bridged.path} fill="none" stroke="var(--canvas)" strokeWidth={5} pointerEvents="none" />}
      {bridged.bridges.map((bridge, index) => <path key={index} className="relation-edge__bridge-halo" d={bridge} fill="none" stroke="var(--canvas)" strokeWidth={5} pointerEvents="none" />)}
      <BaseEdge
        id={id}
        path={bridged.path}
        markerEnd={markerEnd}
        interactionWidth={20}
        style={{ stroke: selected ? '#476bf0' : '#606f85', strokeWidth: selected ? 2 : 1 }}
      />
      <EdgeLabelRenderer>
        {[{ visible: data?.sourceLabelVisible !== false, value: relationType.split(':')[0], x: sourceX + (sourcePosition === Position.Left ? -21 : 21), y: sourceY - 16 }, { visible: data?.targetLabelVisible !== false, value: relationType.split(':')[1], x: targetX + (targetPosition === Position.Left ? -21 : 21), y: targetY - 16 }].map((label, index) => label.visible && <button
          key={index}
          type="button"
          className={`relation-edge__label nodrag nopan ${selected ? 'is-selected' : ''}`}
          style={{ transform: `translate(-50%, -50%) translate(${label.x}px, ${label.y}px)` }}
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.(id)
          }}
          aria-label={`Выбрать связь ${id}, ${relationType}, ${label.value}`}
          aria-pressed={selected}
          title={`Тип связи ${relationType}. Нажмите, чтобы выделить`}
        ><span className="relation-edge__label-text">{label.value}</span></button>)}
      </EdgeLabelRenderer>
    </>
  )
}
