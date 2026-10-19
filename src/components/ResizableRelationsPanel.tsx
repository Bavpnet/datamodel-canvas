import { useRef, type KeyboardEvent, type ReactNode } from 'react'

type Props = { width: number; onWidthChange: (width: number) => void; children: ReactNode }

export function ResizableRelationsPanel({ width, onWidthChange, children }: Props) {
  const drag = useRef<{ x: number; width: number } | null>(null)
  const clamp = (value: number) => Math.max(400, Math.min(650, value))
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === 'ArrowLeft' ? width + 10 : event.key === 'ArrowRight' ? width - 10 : event.key === 'Home' ? 400 : event.key === 'End' ? 650 : null
    if (next === null) return
    event.preventDefault(); onWidthChange(clamp(next))
  }
  return <div className="relations-panel-shell">
    <div className="relations-panel-resizer" role="separator" aria-label="Ширина панели Связи" aria-orientation="vertical" aria-valuemin={400} aria-valuemax={650} aria-valuenow={width} tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        drag.current = { x: event.clientX, width }
        event.currentTarget.setPointerCapture(event.pointerId)
        event.currentTarget.classList.add('is-resizing')
      }}
      onPointerMove={(event) => {
        if (!drag.current) return
        onWidthChange(clamp(drag.current.width + drag.current.x - event.clientX))
      }}
      onPointerUp={(event) => {
        drag.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        event.currentTarget.classList.remove('is-resizing')
      }}
      onPointerCancel={(event) => { drag.current = null; event.currentTarget.classList.remove('is-resizing') }}
      onLostPointerCapture={(event) => { drag.current = null; event.currentTarget.classList.remove('is-resizing') }}
    />
    {children}
  </div>
}
