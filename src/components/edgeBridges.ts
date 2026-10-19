export type Point = { x: number; y: number }
type Command = { type: 'M' | 'L' | 'Q'; values: number[]; from: Point; to: Point }
export type EdgeGeometry = { id: string; path: string; selected: boolean }
export type BridgePath = { path: string; bridges: string[] }

/** Smooth-step paths use only absolute M/L/Q; rounded corners stay unchanged. */
function parsePath(path: string): Command[] {
  const tokens = path.match(/[MLQ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) ?? []
  const commands: Command[] = []
  let point: Point = { x: 0, y: 0 }
  for (let i = 0; i < tokens.length;) {
    const type = tokens[i++] as Command['type']
    const count = type === 'Q' ? 4 : 2
    const values = tokens.slice(i, i + count).map(Number)
    if (!['M', 'L', 'Q'].includes(type) || values.length !== count || values.some((n) => !Number.isFinite(n))) return []
    i += count
    const to = { x: values[count - 2], y: values[count - 1] }
    commands.push({ type, values, from: point, to })
    point = to
  }
  return commands
}

function axis(command: Command): 'h' | 'v' | null {
  if (command.type !== 'L') return null
  if (Math.abs(command.to.y - command.from.y) < .001 && Math.abs(command.to.x - command.from.x) > .001) return 'h'
  if (Math.abs(command.to.x - command.from.x) < .001 && Math.abs(command.to.y - command.from.y) > .001) return 'v'
  return null
}

/** A later (or selected) edge crosses above earlier edges. Shared endpoints aren't crossings. */
export function buildEdgeBridges(edges: EdgeGeometry[], radius = 7): Map<string, BridgePath> {
  const commands = edges.map((edge) => parsePath(edge.path))
  const crossings = edges.map(() => new Map<number, number[]>())
  for (let a = 0; a < edges.length; a++) for (let b = a + 1; b < edges.length; b++) {
    const upper = edges[a].selected && !edges[b].selected ? a : b
    const lower = upper === a ? b : a
    commands[upper].forEach((segment, index) => {
      const direction = axis(segment)
      if (!direction) return
      for (const other of commands[lower]) {
        const otherDirection = axis(other)
        if (!otherDirection || direction === otherDirection) continue
        const horizontal = direction === 'h' ? segment : other
        const vertical = direction === 'v' ? segment : other
        const x = vertical.from.x, y = horizontal.from.y
        // Exclude joins, corner bends and segments too short for a clean arc.
        const interior = (value: number, p: number, q: number, margin: number) => value > Math.min(p, q) + margin && value < Math.max(p, q) - margin
        if (!interior(x, horizontal.from.x, horizontal.to.x, direction === 'h' ? radius + 2 : .5) ||
            !interior(y, vertical.from.y, vertical.to.y, direction === 'v' ? radius + 2 : .5)) continue
        const distance = direction === 'h' ? Math.abs(x - segment.from.x) : Math.abs(y - segment.from.y)
        const list = crossings[upper].get(index) ?? []
        list.push(distance)
        crossings[upper].set(index, list)
      }
    })
  }
  return new Map(edges.map((edge, edgeIndex) => {
    const bridges: string[] = []
    const path = commands[edgeIndex].map((command, index) => {
      const distances = crossings[edgeIndex].get(index)
      const direction = axis(command)
      if (!distances?.length || !direction) return `${command.type}${command.values.join(' ')}`
      const intervals: { start: number; end: number }[] = []
      for (const distance of distances.sort((a, b) => a - b)) {
        const interval = { start: distance - radius, end: distance + radius }
        const last = intervals[intervals.length - 1]
        if (last && interval.start <= last.end + 3) last.end = Math.max(last.end, interval.end)
        else intervals.push(interval)
      }
      const sign = direction === 'h' ? Math.sign(command.to.x - command.from.x) : Math.sign(command.to.y - command.from.y)
      const point = (distance: number) => direction === 'h'
        ? { x: command.from.x + sign * distance, y: command.from.y }
        : { x: command.from.x, y: command.from.y + sign * distance }
      let result = ''
      for (const interval of intervals) {
        const start = point(interval.start), end = point(interval.end)
        const halfWidth = (interval.end - interval.start) / 2
        const rx = direction === 'h' ? halfWidth : radius
        const ry = direction === 'h' ? radius : halfWidth
        // Horizontal bridges rise upwards; vertical bridges bow to the right.
        const arc = `M${start.x} ${start.y}A${rx} ${ry} 0 0 ${sign > 0 ? 1 : 0} ${end.x} ${end.y}`
        bridges.push(arc)
        result += `L${start.x} ${start.y}${arc.slice(arc.indexOf('A'))}`
      }
      return `${result}L${command.to.x} ${command.to.y}`
    }).join(' ')
    return [edge.id, { path: path || edge.path, bridges }]
  }))
}
