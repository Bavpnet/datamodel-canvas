import { createContext, useContext, useLayoutEffect } from 'react'
import type { BridgePath, EdgeGeometry } from './edgeBridges'

type Registry = { register: (geometry: EdgeGeometry) => () => void; paths: Map<string, BridgePath> }
export const BridgeContext = createContext<Registry | null>(null)

export function useEdgeBridge(geometry: EdgeGeometry): BridgePath {
  const registry = useContext(BridgeContext)
  const register = registry?.register
  const { id, path, selected } = geometry
  useLayoutEffect(() => register?.({ id, path, selected }), [register, id, path, selected])
  return registry?.paths.get(id) ?? { path, bridges: [] }
}
