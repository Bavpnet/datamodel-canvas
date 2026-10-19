import type { TableFlowNode } from './TableNode'
import { tableBounds } from './canvasLayout'

export type ConnectorSide = 'left' | 'right'

/** Face the other table when separated; use an outside channel when stacked. */
export function connectionSides(source: TableFlowNode, target: TableFlowNode): { source: ConnectorSide; target: ConnectorSide } {
  const a = tableBounds(source), b = tableBounds(target)
  if (a.x + a.width <= b.x) return { source: 'right', target: 'left' }
  if (b.x + b.width <= a.x) return { source: 'left', target: 'right' }
  const leftDistance = Math.abs(a.x - b.x)
  const rightDistance = Math.abs(a.x + a.width - b.x - b.width)
  const side = leftDistance < rightDistance ? 'left' : 'right'
  return { source: side, target: side }
}
