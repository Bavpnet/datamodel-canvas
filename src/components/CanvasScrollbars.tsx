import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useReactFlow, useStore, useViewport } from '@xyflow/react'
import type { TableFlowNode } from './TableNode'
import { tableBounds } from './canvasLayout'
import './CanvasScrollbars.css'

type Axis = 'horizontal' | 'vertical'
type Metrics = { min: number; max: number; position: number; size: number; length: number; thumb: number }

export function CanvasScrollbars({ nodes, canvasId }: { nodes: TableFlowNode[]; canvasId: string }) {
  const { setViewport, getViewport } = useReactFlow()
  const viewport = useViewport()
  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)
  const drag = useRef<{ axis: Axis; metrics: Metrics; start: number; position: number } | null>(null)
  const rects = nodes.map(tableBounds)
  const metrics = (axis: Axis): Metrics => {
    const horizontal = axis === 'horizontal'
    const size = horizontal ? width : height
    const position = -(horizontal ? viewport.x : viewport.y)
    const starts = rects.map((rect) => (horizontal ? rect.x : rect.y) * viewport.zoom)
    const ends = rects.map((rect) => (horizontal ? rect.x + rect.width : rect.y + rect.height) * viewport.zoom)
    // Keep room around the graph, including tables dragged into negative coordinates.
    const min = Math.min(-size / 2, ...starts.map((value) => value - 160), position)
    const end = Math.max(size * 1.5, ...ends.map((value) => value + 160), position + size)
    const length = Math.max(0, size - 28)
    const thumb = Math.min(length, Math.max(32, length * size / (end - min)))
    return { min, max: end - size, position, size, length, thumb }
  }
  const move = (axis: Axis, value: number, data: Metrics) => {
    const position = Math.max(data.min, Math.min(data.max, value))
    const current = getViewport()
    void setViewport({ ...current, [axis === 'horizontal' ? 'x' : 'y']: -position })
  }
  const pointerPosition = (event: PointerEvent<HTMLDivElement>, axis: Axis) => axis === 'horizontal' ? event.clientX : event.clientY
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, axis: Axis, data: Metrics) => {
    const backward = axis === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const forward = axis === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    const next = event.key === backward ? data.position - 40 : event.key === forward ? data.position + 40
      : event.key === 'PageUp' ? data.position - data.size * .9 : event.key === 'PageDown' ? data.position + data.size * .9
      : event.key === 'Home' ? data.min : event.key === 'End' ? data.max : null
    if (next === null) return
    event.preventDefault()
    move(axis, next, data)
  }
  if (!width || !height) return null
  return <div className="canvas-scrollbars">
    {(['horizontal', 'vertical'] as const).map((axis) => {
      const data = metrics(axis)
      const travel = data.length - data.thumb
      const range = data.max - data.min
      const offset = range > 0 ? (data.position - data.min) / range * travel : 0
      return <div key={axis} className={`canvas-scrollbar canvas-scrollbar--${axis} nodrag nopan nowheel`}
        role="scrollbar" aria-label={axis === 'horizontal' ? 'Горизонтальная прокрутка канваса' : 'Вертикальная прокрутка канваса'}
        aria-controls={canvasId} aria-orientation={axis} aria-valuemin={Math.round(data.min)} aria-valuemax={Math.round(data.max)} aria-valuenow={Math.round(data.position)} tabIndex={0}
        onKeyDown={(event) => onKeyDown(event, axis, data)}
        onPointerDown={(event) => {
          if (event.button !== 0 || travel <= 0 || range <= 0) return
          event.preventDefault(); event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
          const coordinate = pointerPosition(event, axis)
          let position = data.position
          if (!(event.target as HTMLElement).closest('.canvas-scrollbar__thumb')) {
            const bounds = event.currentTarget.getBoundingClientRect()
            position = data.min + (coordinate - (axis === 'horizontal' ? bounds.left : bounds.top) - data.thumb / 2) / travel * range
            position = Math.max(data.min, Math.min(data.max, position))
            move(axis, position, data)
          }
          drag.current = { axis, metrics: data, start: coordinate, position }
          event.currentTarget.classList.add('is-dragging')
        }}
        onPointerMove={(event) => {
          const active = drag.current
          if (!active || active.axis !== axis) return
          const saved = active.metrics
          move(axis, active.position + (pointerPosition(event, axis) - active.start) / (saved.length - saved.thumb) * (saved.max - saved.min), saved)
        }}
        onPointerUp={(event) => {
          drag.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
          event.currentTarget.classList.remove('is-dragging')
        }}
        onPointerCancel={(event) => { drag.current = null; event.currentTarget.classList.remove('is-dragging') }}
        onLostPointerCapture={(event) => { drag.current = null; event.currentTarget.classList.remove('is-dragging') }}
      ><div className="canvas-scrollbar__thumb" style={axis === 'horizontal' ? { width: data.thumb, left: offset } : { height: data.thumb, top: offset }} /></div>
    })}
  </div>
}
