import { useMemo, useState } from 'react'
import type { DataTable } from '../types'
import { DesignIcon } from './DesignIcon'
import { TABLE_DND_TYPE } from '../dnd'
import './DataPanel.css'

type DataPanelProps = {
  dataModel: DataTable[]
  placedTableIds: Set<string>
  activeFieldKeys: Set<string>
  onSelectField: (tableId: string, columnId: string) => void
}

export function DataPanel({ dataModel, placedTableIds, activeFieldKeys, onSelectField }: DataPanelProps) {
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(dataModel.map((table) => table.id)),
  )

  const tables = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dataModel
    return dataModel.filter(
      (table) =>
        table.name.toLowerCase().includes(q) ||
        table.columns.some((column) => column.name.toLowerCase().includes(q)),
    )
  }, [query, dataModel])

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside className="data-panel">
      <h2 className="data-panel__title">Данные</h2>
      <label className="data-panel__search">
        <DesignIcon name="search" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск"
        />
      </label>
      <p className="data-panel__hint">Перетащите таблицу на холст</p>
      {tables.length === 0 && <p className="data-panel__empty">Таблицы не найдены</p>}
      <ul className="data-panel__list">
        {tables.map((table) => {
          const open = !!query.trim() || openIds.has(table.id)
          const placed = placedTableIds.has(table.id)
          return (
            <li key={table.id}>
              <div
                className={`data-panel__table ${placed ? 'is-placed' : ''}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(TABLE_DND_TYPE, table.id)
                  event.dataTransfer.effectAllowed = 'move'
                }}
              >
                <button
                  type="button"
                  className="data-panel__table-toggle"
                  onClick={() => toggle(table.id)}
                  aria-expanded={open}
                >
                  <DesignIcon name="table" />
                  <span>{table.name}</span>
                  <DesignIcon name="down" className={`data-panel__chevron ${open ? 'is-open' : ''}`} />
                </button>

              </div>
              {open && (
                <ul className="data-panel__columns">
                  {table.columns.map((column) => (
                    <li key={column.id}>
                    <button type="button" className={`data-panel__column ${activeFieldKeys.has(`${table.id}/${column.id}`) ? 'is-active' : ''}`} onClick={() => onSelectField(table.id, column.id)} aria-pressed={activeFieldKeys.has(`${table.id}/${column.id}`)}>
                      <DesignIcon name={`panel-${({ text: 'type', number: 'hash', date: 'calendar', calc: 'calculator' } as const)[column.kind]}`} className="data-panel__kind" />
                      <span>{column.name}</span>
                    </button></li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
