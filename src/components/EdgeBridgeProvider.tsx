import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { buildEdgeBridges, type EdgeGeometry } from './edgeBridges'

import { BridgeContext } from './useEdgeBridge'

export function EdgeBridgeProvider({ order, children }: { order: string[]; children: ReactNode }) {
  const [geometries, setGeometries] = useState(new Map<string, EdgeGeometry>())
  const register = useCallback((geometry: EdgeGeometry) => {
    setGeometries((current) => {
      const previous = current.get(geometry.id)
      if (previous?.path === geometry.path && previous.selected === geometry.selected) return current
      return new Map(current).set(geometry.id, geometry)
    })
    return () => setGeometries((current) => {
      if (!current.has(geometry.id)) return current
      const next = new Map(current); next.delete(geometry.id); return next
    })
  }, [])
  const paths = useMemo(() => buildEdgeBridges(order.flatMap((id) => {
    const geometry = geometries.get(id)
    return geometry ? [geometry] : []
  })), [order, geometries])
  const value = useMemo(() => ({ register, paths }), [register, paths])
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
}

