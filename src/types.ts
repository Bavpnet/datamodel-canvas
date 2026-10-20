export type ColumnKind = 'text' | 'number' | 'date' | 'calc'

export type RelationType = '1:1' | '1:N' | 'N:1' | 'N:M'

export type Column = {
  id: string
  name: string
  kind: ColumnKind
  typeLabel: string
}

export type DataTable = {
  id: string
  name: string
  columns: Column[]
}

export type RelationDef = {
  id: string
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  type: RelationType
}

export type TableNodeData = {
  table: DataTable
  collapsed?: boolean
  expandedHeight?: number
  onHeightChange?: (tableId: string, height: number, fromTop: boolean) => void
  onCollapsedChange?: (tableId: string, collapsed: boolean) => void
  connections?: { columnId: string; side: 'source' | 'target'; position: 'left' | 'right'; active: boolean }[]
  activeColumnIds?: string[]
  onSelectField?: (tableId: string, columnId: string) => void
}

export type RelationEdgeData = {
  relationType: RelationType
  sourceLabelVisible?: boolean
  targetLabelVisible?: boolean
  sourceLabelX?: number
  targetLabelX?: number
}
