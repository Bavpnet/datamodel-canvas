import type { DataTable, RelationDef } from '../types'

export const dataModel: DataTable[] = [
  { id: 'execution', name: 'Выполнение задачи', columns: [
    { id: 'id', name: 'ID', kind: 'text', typeLabel: 'varchar' },
    { id: 'task_id', name: 'Задача_ID', kind: 'text', typeLabel: 'varchar' },
    { id: 'manager', name: 'Менеджер ФИО', kind: 'text', typeLabel: 'varchar' },
    { id: 'date', name: 'Дата', kind: 'date', typeLabel: 'date' },
    { id: 'hours', name: 'ЗатраченоЧасов', kind: 'number', typeLabel: 'int' },
    { id: 'tariff_id', name: 'Тариф_ID', kind: 'text', typeLabel: 'varchar' },
  ] },
  { id: 'task', name: 'Задача', columns: [
    { id: 'id', name: 'ID', kind: 'text', typeLabel: 'varchar' },
    { id: 'name', name: 'Название', kind: 'text', typeLabel: 'varchar' },
    { id: 'due', name: 'Срок выполнения', kind: 'date', typeLabel: 'date' },
    { id: 'description', name: 'Описание', kind: 'text', typeLabel: 'varchar' },
    { id: 'project_id', name: 'Проект_ID', kind: 'text', typeLabel: 'varchar' },
  ] },
  { id: 'project', name: 'Проект', columns: [
    { id: 'id', name: 'ID', kind: 'text', typeLabel: 'varchar' },
    { id: 'name', name: 'Название', kind: 'text', typeLabel: 'varchar' },
  ] },
  { id: 'tariff', name: 'Тариф', columns: [
    { id: 'id', name: 'ID', kind: 'text', typeLabel: 'varchar' },
    { id: 'name', name: 'Название', kind: 'text', typeLabel: 'varchar' },
    { id: 'price', name: 'ЦенаЗаЧас', kind: 'number', typeLabel: 'int' },
  ] },
  {
    id: 'uit-tasks',
    name: 'Выполнение задачи УИТ',
    columns: [
      { id: 'manager', name: 'Менеджер ФИО', kind: 'text', typeLabel: 'varchar' },
      { id: 'date', name: 'Дата', kind: 'date', typeLabel: 'date' },
      { id: 'hours', name: 'ЗатраченоЧасов', kind: 'number', typeLabel: 'int' },
      { id: 'price', name: 'Цена', kind: 'number', typeLabel: 'int' },
    ],
  },
  {
    id: 'trips',
    name: 'КомандировкиБлоки',
    columns: [
      { id: 'id', name: 'Номер', kind: 'number', typeLabel: 'int' },
      { id: 'employee', name: 'Сотрудник', kind: 'text', typeLabel: 'varchar' },
      { id: 'object', name: 'Объект', kind: 'text', typeLabel: 'varchar' },
      { id: 'start', name: 'Дата начала', kind: 'date', typeLabel: 'date' },
      { id: 'hours', name: 'ЗатраченоЧасов', kind: 'number', typeLabel: 'int' },
    ],
  },
  {
    id: 'sheet1',
    name: 'Лист1',
    columns: [
      { id: 'id', name: 'Номер', kind: 'number', typeLabel: 'int' },
      { id: 'title', name: 'Название', kind: 'text', typeLabel: 'varchar' },
      { id: 'status', name: 'Статус', kind: 'text', typeLabel: 'varchar' },
      { id: 'amount', name: 'Сумма', kind: 'number', typeLabel: 'int' },
    ],
  },
  {
    id: 'calendar',
    name: 'Календарь',
    columns: [
      { id: 'date', name: 'Дата', kind: 'date', typeLabel: 'date' },
      { id: 'week', name: 'Неделя', kind: 'number', typeLabel: 'int' },
      { id: 'month', name: 'Месяц', kind: 'text', typeLabel: 'varchar' },
      { id: 'year', name: 'Год', kind: 'number', typeLabel: 'int' },
    ],
  },
  {
    id: 'wip',
    name: 'НЗП',
    columns: [
      { id: 'number', name: 'Номер', kind: 'number', typeLabel: 'int' },
      { id: 'owner', name: 'Ответственное лицо', kind: 'text', typeLabel: 'varchar' },
      { id: 'median', name: 'Медиана', kind: 'calc', typeLabel: 'calc' },
      { id: 'total', name: 'Общая сумма', kind: 'calc', typeLabel: 'calc' },
    ],
  },
  {
    id: 'pnr-plan',
    name: 'План ПНР',
    columns: [
      { id: 'object', name: 'Объект', kind: 'text', typeLabel: 'varchar' },
      { id: 'remarks', name: 'Количество замечаний', kind: 'text', typeLabel: 'varchar' },
      { id: 'hours', name: 'ЗатраченоЧасов', kind: 'number', typeLabel: 'int' },
    ],
  },
]

export const predefinedRelations: RelationDef[] = [
  { id: 'execution-task', sourceTableId: 'execution', sourceColumnId: 'task_id', targetTableId: 'task', targetColumnId: 'id', type: 'N:1' },
  { id: 'task-project', sourceTableId: 'task', sourceColumnId: 'project_id', targetTableId: 'project', targetColumnId: 'id', type: 'N:1' },
  { id: 'execution-tariff', sourceTableId: 'execution', sourceColumnId: 'tariff_id', targetTableId: 'tariff', targetColumnId: 'id', type: 'N:1' },
  {
    id: 'rel-calendar-tasks',
    sourceTableId: 'calendar',
    sourceColumnId: 'date',
    targetTableId: 'uit-tasks',
    targetColumnId: 'date',
    type: '1:N',
  },
  {
    id: 'rel-wip-sheet',
    sourceTableId: 'wip',
    sourceColumnId: 'number',
    targetTableId: 'sheet1',
    targetColumnId: 'id',
    type: '1:1',
  },
  {
    id: 'rel-pnr-trips',
    sourceTableId: 'pnr-plan',
    sourceColumnId: 'object',
    targetTableId: 'trips',
    targetColumnId: 'object',
    type: '1:N',
  },
  {
    id: 'rel-wip-tasks',
    sourceTableId: 'wip',
    sourceColumnId: 'owner',
    targetTableId: 'uit-tasks',
    targetColumnId: 'manager',
    type: 'N:1',
  },
  {
    id: 'rel-trips-wip',
    sourceTableId: 'trips',
    sourceColumnId: 'employee',
    targetTableId: 'wip',
    targetColumnId: 'owner',
    type: 'N:M',
  },
]

export const RELATION_TYPES: RelationDef['type'][] = ['1:1', '1:N', 'N:1', 'N:M']
