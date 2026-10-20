import type { RelationFlowEdge } from './RelationEdge'
import type { TableFlowNode } from './TableNode'

/** Each visible port has at most one unambiguous cardinality label. */
export function connectionLabels(edges: RelationFlowEdge[], nodes: TableFlowNode[]) {
  const collapsed = new Set(nodes.filter((node) => node.data.collapsed).map((node) => node.id))
  const result = edges.map((edge) => ({ ...edge, data: { ...edge.data!, sourceLabelVisible: true, targetLabelVisible: true } }))
  const groups = new Map<string, { index: number; side: 'source' | 'target'; value: string }[]>()
  result.forEach((edge, index) => {
    for (const side of ['source', 'target'] as const) {
      const handle = side === 'source' ? edge.sourceHandle : edge.targetHandle
      const position = handle?.endsWith('-left') ? 'left' : 'right'
      const columnId = handle?.replace(/-(source|target)-(left|right)$/, '')
      const key = JSON.stringify([edge[side], position, collapsed.has(edge[side]) ? null : columnId])
      const items = groups.get(key) ?? []
      items.push({ index, side, value: edge.data.relationType.split(':')[side === 'source' ? 0 : 1] })
      groups.set(key, items)
      edge.data[side === 'source' ? 'sourceLabelVisible' : 'targetLabelVisible'] = false
    }
  })
  for (const items of groups.values()) {
    const selected = items.filter((item) => result[item.index].selected)
    const candidates = selected.length ? selected : items
    if (new Set(candidates.map((item) => item.value)).size !== 1) continue
    const chosen = candidates[candidates.length - 1]
    result[chosen.index].data[chosen.side === 'source' ? 'sourceLabelVisible' : 'targetLabelVisible'] = true
  }
  return result
}
