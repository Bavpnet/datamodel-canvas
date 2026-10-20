import type { Viewport } from '@xyflow/react'

type Bounds = { x: number; y: number; width: number; height: number }

export function tablesInViewport(tables: Bounds[], viewport: Viewport, size: { width: number; height: number }, margin = 24) {
  return tables.length > 0 && tables.every((table) =>
    table.x * viewport.zoom + viewport.x >= margin &&
    table.y * viewport.zoom + viewport.y >= margin &&
    (table.x + table.width) * viewport.zoom + viewport.x <= size.width - margin &&
    (table.y + table.height) * viewport.zoom + viewport.y <= size.height - margin,
  )
}
