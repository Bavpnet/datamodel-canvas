import type { TableFlowNode } from './TableNode'
import { tableBounds } from './canvasLayout'

export type AlignmentGuide = { axis: 'x' | 'y'; value: number; start: number; end: number }

/** Compare edges and centers with a constant six-screen-pixel snapping distance. */
export function alignTable(moving: TableFlowNode, others: TableFlowNode[], zoom: number) {
  const bounds = tableBounds(moving)
  const threshold = 6 / zoom
  type Match = { delta: number; value: number; other: ReturnType<typeof tableBounds> }
  let xMatch: Match | undefined, yMatch: Match | undefined
  for (const other of others) {
    if (other.id === moving.id || other.dragging) continue
    const rect = tableBounds(other)
    for (const a of [0, .5, 1]) for (const b of [0, .5, 1]) {
      const x = rect.x + rect.width * b
      const dx = x - (bounds.x + bounds.width * a)
      if (Math.abs(dx) <= threshold && (!xMatch || Math.abs(dx) < Math.abs(xMatch.delta))) xMatch = { delta: dx, value: x, other: rect }
      const y = rect.y + rect.height * b
      const dy = y - (bounds.y + bounds.height * a)
      if (Math.abs(dy) <= threshold && (!yMatch || Math.abs(dy) < Math.abs(yMatch.delta))) yMatch = { delta: dy, value: y, other: rect }
    }
  }
  const position = { x: bounds.x + (xMatch?.delta ?? 0), y: bounds.y + (yMatch?.delta ?? 0) }
  const guides: AlignmentGuide[] = []
  const margin = 20 / zoom
  if (xMatch) guides.push({ axis: 'x', value: xMatch.value, start: Math.min(position.y, xMatch.other.y) - margin, end: Math.max(position.y + bounds.height, xMatch.other.y + xMatch.other.height) + margin })
  if (yMatch) guides.push({ axis: 'y', value: yMatch.value, start: Math.min(position.x, yMatch.other.x) - margin, end: Math.max(position.x + bounds.width, yMatch.other.x + yMatch.other.width) + margin })
  return { position, guides }
}
