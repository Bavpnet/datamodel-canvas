import type { TableFlowNode } from './TableNode'
import type { RelationFlowEdge } from './RelationEdge'

export function tableBounds(node: TableFlowNode) {
  return {
    ...node.position,
    width: node.measured?.width ?? node.width ?? 225,
    height: node.measured?.height ?? (58 + node.data.table.columns.length * 40),
  }
}

/** Find the nearest available rectangle, leaving room for relation badges. */
export function findFreePosition(node: TableFlowNode, existing: TableFlowNode[], origin = node.position) {
  const gap = 64
  const size = tableBounds(node)
  const occupied = existing.map(tableBounds)
  const xs = new Set([Math.max(40, origin.x), 40])
  const ys = new Set([Math.max(40, origin.y), 40])
  for (const rect of occupied) {
    xs.add(rect.x + rect.width + gap)
    ys.add(rect.y + rect.height + gap)
  }
  const candidates = [...xs].flatMap((x) => [...ys].map((y) => ({ x, y })))
    .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))
  return candidates.find((point) => occupied.every((rect) =>
    point.x + size.width + gap <= rect.x || point.x >= rect.x + rect.width + gap ||
    point.y + size.height + gap <= rect.y || point.y >= rect.y + rect.height + gap,
  )) ?? { x: Math.max(40, ...occupied.map((rect) => rect.x + rect.width + gap)), y: 40 }
}

/** Visual star layout; choose a likely fact table using many-side relations and degree. */
export function organizeTables(nodes: TableFlowNode[], edges: RelationFlowEdge[]): TableFlowNode[] {
  if (!nodes.length) return nodes
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const adjacent = new Map(nodes.map((node) => [node.id, new Set<string>()]))
  const manySides = new Map(nodes.map((node) => [node.id, 0]))
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target) || edge.source === edge.target) continue
    adjacent.get(edge.source)!.add(edge.target)
    adjacent.get(edge.target)!.add(edge.source)
    const [sourceType, targetType] = (edge.data?.relationType ?? '1:1').split(':')
    if (sourceType !== '1') manySides.set(edge.source, manySides.get(edge.source)! + 1)
    if (targetType !== '1') manySides.set(edge.target, manySides.get(edge.target)! + 1)
  }
  const unseen = new Set(byId.keys())
  const groups: { positions: Map<string, { x: number; y: number }>; width: number; height: number }[] = []
  while (unseen.size) {
    const component: string[] = []
    const queue = [unseen.values().next().value!]
    while (queue.length) {
      const id = queue.shift()!
      if (!unseen.delete(id)) continue
      component.push(id)
      queue.push(...adjacent.get(id)!)
    }
    const root = [...component].sort((a, b) =>
      manySides.get(b)! - manySides.get(a)! || adjacent.get(b)!.size - adjacent.get(a)!.size,
    )[0]
    const rings: string[][] = [[root]]
    const visited = new Set([root])
    const parent = new Map<string, string>()
    for (let depth = 0; depth < rings.length; depth++) {
      const next: string[] = []
      for (const id of rings[depth]) {
        for (const other of adjacent.get(id)!) {
          if (visited.has(other)) continue
          visited.add(other); parent.set(other, id); next.push(other)
        }
      }
      if (next.length) rings.push(next)
    }
    const sizes = new Map(component.map((id) => [id, tableBounds(byId.get(id)!)]))
    const diagonal = (id: string) => Math.hypot(sizes.get(id)!.width, sizes.get(id)!.height)
    const positions = new Map<string, { x: number; y: number }>()
    const angles = new Map<string, number>([[root, 0]])
    const center = sizes.get(root)!
    positions.set(root, { x: -center.width / 2, y: -center.height / 2 })
    let radius = 0
    let previousDiagonal = diagonal(root)
    for (const ring of rings.slice(1)) {
      const maxDiagonal = Math.max(...ring.map(diagonal))
      const spacingRadius = ring.length > 1 ? (maxDiagonal + 100) / (2 * Math.sin(Math.PI / ring.length)) : 0
      radius = Math.max(radius + previousDiagonal / 2 + maxDiagonal / 2 + 100, spacingRadius)
      ring.sort((a, b) => (angles.get(parent.get(a)!) ?? 0) - (angles.get(parent.get(b)!) ?? 0))
      ring.forEach((id, index) => {
        const angle = ring.length === 1 ? (angles.get(parent.get(id)!) ?? 0) : (ring.length === 2 ? 0 : -Math.PI / 2) + index * 2 * Math.PI / ring.length
        const size = sizes.get(id)!
        angles.set(id, angle)
        positions.set(id, { x: Math.cos(angle) * radius - size.width / 2, y: Math.sin(angle) * radius - size.height / 2 })
      })
      previousDiagonal = maxDiagonal
    }
    const minX = Math.min(...[...positions.values()].map((point) => point.x))
    const minY = Math.min(...[...positions.values()].map((point) => point.y))
    let width = 0, height = 0
    for (const [id, point] of positions) {
      point.x -= minX; point.y -= minY
      width = Math.max(width, point.x + sizes.get(id)!.width)
      height = Math.max(height, point.y + sizes.get(id)!.height)
    }
    groups.push({ positions, width, height })
  }
  const columns = Math.ceil(Math.sqrt(groups.length))
  const columnWidths = Array.from({ length: columns }, (_, col) => Math.max(...groups.filter((_, index) => index % columns === col).map((group) => group.width)))
  const positions = new Map<string, { x: number; y: number }>()
  let y = 60
  for (let row = 0; row * columns < groups.length; row++) {
    let x = 60
    const items = groups.slice(row * columns, (row + 1) * columns)
    items.forEach((group, col) => {
      for (const [id, point] of group.positions) positions.set(id, { x: x + point.x, y: y + point.y })
      x += columnWidths[col] + 180
    })
    y += Math.max(...items.map((group) => group.height)) + 180
  }
  return nodes.map((node) => ({ ...node, position: positions.get(node.id)! }))
}
