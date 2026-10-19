import { useViewport } from '@xyflow/react'
import type { AlignmentGuide } from './snapAlignment'

export function AlignmentGuides({ guides }: { guides: AlignmentGuide[] }) {
  const { x, y, zoom } = useViewport()
  return <svg className="alignment-guides" aria-hidden="true">
    {guides.map((guide) => guide.axis === 'x'
      ? <line key="vertical" x1={x + guide.value * zoom} x2={x + guide.value * zoom} y1={y + guide.start * zoom} y2={y + guide.end * zoom} />
      : <line key="horizontal" y1={y + guide.value * zoom} y2={y + guide.value * zoom} x1={x + guide.start * zoom} x2={x + guide.end * zoom} />)}
  </svg>
}
