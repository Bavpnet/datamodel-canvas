import { ControlButton, Controls, useReactFlow, useViewport } from '@xyflow/react'

import { CANVAS_ZOOM_LIMITS } from './zoomLimits'

export function CanvasControls() {
  const { minZoom, maxZoom } = CANVAS_ZOOM_LIMITS
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { zoom } = useViewport()
  return <Controls showZoom={false} showFitView={false} showInteractive={false}>
    <ControlButton title="Приблизить" aria-label="Приблизить" disabled={zoom >= maxZoom - 1e-6} onClick={() => { void zoomIn() }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </ControlButton>
    <ControlButton title="Отдалить" aria-label="Отдалить" disabled={zoom <= minZoom + 1e-6} onClick={() => { void zoomOut() }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
    </ControlButton>
    <ControlButton title="Вписать схему" aria-label="Вписать схему в канвас" onClick={() => { void fitView({ padding: .12, duration: 300, ...CANVAS_ZOOM_LIMITS }) }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" /></svg>
    </ControlButton>
  </Controls>
}
