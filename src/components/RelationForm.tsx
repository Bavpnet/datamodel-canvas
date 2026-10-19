import { useState } from 'react'
import type { DataTable, RelationType } from '../types'
import { RELATION_TYPES } from '../data/datamodel'
import { NativeSelect } from './ui/NativeSelect'
import './RelationForm.css'

export type RelationDraft = {
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  type: RelationType
}

type RelationFormProps = {
  tables: DataTable[]
  onSubmit: (draft: RelationDraft) => string | null
  onCancel: () => void
}

export function RelationForm({ tables, onSubmit, onCancel }: RelationFormProps) {
  const [sourceTableId, setSourceTableId] = useState('')
  const [targetTableId, setTargetTableId] = useState('')
  const [sourceColumnId, setSourceColumnId] = useState('')
  const [targetColumnId, setTargetColumnId] = useState('')
  const [type, setType] = useState<RelationType>('N:1')
  const [error, setError] = useState<string | null>(null)
  const sourceTable = tables.find((table) => table.id === sourceTableId)
  const targetTable = tables.find((table) => table.id === targetTableId)
  const complete = !!sourceTable && !!targetTable && !!sourceColumnId && !!targetColumnId

  return <form className="relation-form" aria-label="Новая связь" onSubmit={(event) => {
    event.preventDefault()
    if (!complete) return
    setError(onSubmit({ sourceTableId, sourceColumnId, targetTableId, targetColumnId, type }))
  }}>
    <div className="relation-form__body">
      <div className="relation-form__table-row">
        <label className="relation-form__field" htmlFor="relation-table-1">Таблица 1
          <NativeSelect id="relation-table-1" required data-placeholder={!sourceTableId} value={sourceTableId} onChange={(event) => {
            const value = event.target.value
            setSourceTableId(value); setSourceColumnId(''); setError(null)
            if (value === targetTableId) { setTargetTableId(''); setTargetColumnId('') }
          }}>
            <option value="" disabled>Выберите таблицу</option>
            {tables.map((table) => <option key={table.id} value={table.id}>{table.name}</option>)}
          </NativeSelect>
        </label>
        <label className="relation-form__field" htmlFor="relation-table-2">Таблица 2
          <NativeSelect id="relation-table-2" required data-placeholder={!targetTableId} value={targetTableId} onChange={(event) => { setTargetTableId(event.target.value); setTargetColumnId(''); setError(null) }}>
            <option value="" disabled>Выберите таблицу</option>
            {tables.filter((table) => table.id !== sourceTableId).map((table) => <option key={table.id} value={table.id}>{table.name}</option>)}
          </NativeSelect>
        </label>
      </div>
      <fieldset className="relation-form__criteria">
        <legend>Критерий связи</legend>
        <div className="relation-form__column-row">
          <NativeSelect aria-label="Столбец таблицы 1" required disabled={!sourceTable} data-placeholder={!sourceColumnId} value={sourceColumnId} onChange={(event) => { setSourceColumnId(event.target.value); setError(null) }}>
            <option value="" disabled>Выберите столбец</option>
            {sourceTable?.columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
          </NativeSelect>
          <span className="relation-form__equals" aria-hidden="true">=</span>
          <NativeSelect aria-label="Столбец таблицы 2" required disabled={!targetTable} data-placeholder={!targetColumnId} value={targetColumnId} onChange={(event) => { setTargetColumnId(event.target.value); setError(null) }}>
            <option value="" disabled>Выберите столбец</option>
            {targetTable?.columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
          </NativeSelect>
        </div>
      </fieldset>
      <label className="relation-form__field relation-form__type" htmlFor="relation-type">Тип связи
        <NativeSelect id="relation-type" value={type} onChange={(event) => setType(event.target.value as RelationType)}>{RELATION_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</NativeSelect>
      </label>
      {error && <p className="relation-form__error" role="alert">{error}</p>}
    </div>
    <footer className="relation-form__footer">
      <button type="button" className="relation-form__button relation-form__button--outline" onClick={onCancel}>Отмена</button>
      <button type="submit" className="relation-form__button relation-form__button--primary" disabled={!complete}>Добавить</button>
    </footer>
  </form>
}
