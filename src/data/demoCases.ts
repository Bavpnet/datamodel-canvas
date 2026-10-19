import type { Column, ColumnKind, DataTable, RelationDef } from '../types'
import { dataModel, predefinedRelations } from './datamodel'

export type DemoCase = {
  id: 'simple' | 'complex'
  name: string
  tables: DataTable[]
  relations: RelationDef[]
  initialTableIds: string[]
}

const column = (id: string, name: string, kind: ColumnKind = 'text'): Column => ({ id, name, kind, typeLabel: kind === 'number' ? 'decimal' : kind === 'date' ? 'date' : 'varchar' })
const id = () => column('id', 'ID')
const fk = (name: string, label: string) => column(name, label)
const number = (name: string, label: string) => column(name, label, 'number')
const date = (name: string, label: string) => column(name, label, 'date')
const table = (id: string, name: string, columns: Column[]): DataTable => ({ id, name, columns: [column('id', 'ID'), ...columns] })

const complexTables: DataTable[] = [
  table('orders', 'Заказы', [fk('customer_id', 'Клиент_ID'), fk('employee_id', 'Менеджер_ID'), fk('date_id', 'Дата_ID'), fk('address_id', 'Адрес_ID'), number('total', 'Сумма заказа'), column('status', 'Статус')]),
  table('order_items', 'Позиции заказа', [fk('order_id', 'Заказ_ID'), fk('product_id', 'Товар_ID'), number('quantity', 'Количество'), number('price', 'Цена'), number('discount', 'Скидка')]),
  table('customers', 'Клиенты', [column('name', 'ФИО'), column('email', 'Email'), date('registered', 'Дата регистрации')]),
  table('products', 'Товары', [column('name', 'Наименование'), fk('category_id', 'Категория_ID'), fk('supplier_id', 'Поставщик_ID'), number('price', 'Цена'), column('sku', 'Артикул')]),
  table('categories', 'Категории', [column('name', 'Название'), column('description', 'Описание')]),
  table('suppliers', 'Поставщики', [column('name', 'Компания'), column('contact', 'Контакт'), column('country', 'Страна')]),
  table('employees', 'Сотрудники', [column('name', 'ФИО'), fk('department_id', 'Отдел_ID'), fk('region_id', 'Регион_ID'), column('position', 'Должность')]),
  table('departments', 'Отделы', [column('name', 'Название'), number('budget', 'Бюджет')]),
  table('payments', 'Платежи', [fk('order_id', 'Заказ_ID'), fk('customer_id', 'Клиент_ID'), fk('date_id', 'Дата_ID'), number('amount', 'Сумма'), column('method', 'Способ оплаты')]),
  table('shipments', 'Доставки', [fk('order_id', 'Заказ_ID'), fk('warehouse_id', 'Склад_ID'), fk('address_id', 'Адрес_ID'), date('shipped', 'Дата отправки'), column('status', 'Статус')]),
  table('warehouses', 'Склады', [column('name', 'Название'), fk('region_id', 'Регион_ID'), number('capacity', 'Вместимость')]),
  table('inventory', 'Остатки', [fk('product_id', 'Товар_ID'), fk('warehouse_id', 'Склад_ID'), number('stock', 'Доступно'), number('reserved', 'Резерв')]),
  table('returns', 'Возвраты', [fk('order_id', 'Заказ_ID'), fk('product_id', 'Товар_ID'), fk('customer_id', 'Клиент_ID'), fk('date_id', 'Дата_ID'), number('refund', 'Сумма возврата'), column('reason', 'Причина')]),
  table('addresses', 'Адреса', [fk('customer_id', 'Клиент_ID'), fk('region_id', 'Регион_ID'), column('city', 'Город'), column('street', 'Адрес')]),
  table('regions', 'Регионы', [column('name', 'Название'), column('country', 'Страна'), column('timezone', 'Часовой пояс')]),
  { id: 'dates', name: 'Календарь продаж', columns: [id(), date('date', 'Дата'), number('month', 'Месяц'), number('year', 'Год')] },
  table('promotions', 'Акции', [column('name', 'Название'), fk('date_id', 'Дата начала_ID'), number('discount', 'Скидка, %')]),
  table('order_promotions', 'Акции в заказах', [fk('order_id', 'Заказ_ID'), fk('promotion_id', 'Акция_ID'), number('amount', 'Сумма скидки')]),
  table('tickets', 'Обращения поддержки', [fk('order_id', 'Заказ_ID'), fk('customer_id', 'Клиент_ID'), fk('employee_id', 'Сотрудник_ID'), column('subject', 'Тема'), column('status', 'Статус')]),
  table('loyalty', 'Карты лояльности', [fk('customer_id', 'Клиент_ID'), number('points', 'Баллы'), column('tier', 'Уровень')]),
]

const links: [string, string, string][] = [
  ['orders', 'customer_id', 'customers'], ['orders', 'employee_id', 'employees'], ['orders', 'date_id', 'dates'], ['orders', 'address_id', 'addresses'],
  ['order_items', 'order_id', 'orders'], ['order_items', 'product_id', 'products'],
  ['products', 'category_id', 'categories'], ['products', 'supplier_id', 'suppliers'],
  ['employees', 'department_id', 'departments'], ['employees', 'region_id', 'regions'],
  ['payments', 'order_id', 'orders'], ['payments', 'customer_id', 'customers'], ['payments', 'date_id', 'dates'],
  ['shipments', 'order_id', 'orders'], ['shipments', 'warehouse_id', 'warehouses'], ['shipments', 'address_id', 'addresses'],
  ['warehouses', 'region_id', 'regions'], ['inventory', 'product_id', 'products'], ['inventory', 'warehouse_id', 'warehouses'],
  ['returns', 'order_id', 'orders'], ['returns', 'product_id', 'products'], ['returns', 'customer_id', 'customers'], ['returns', 'date_id', 'dates'],
  ['addresses', 'customer_id', 'customers'], ['addresses', 'region_id', 'regions'],
  ['promotions', 'date_id', 'dates'], ['order_promotions', 'order_id', 'orders'], ['order_promotions', 'promotion_id', 'promotions'],
  ['tickets', 'order_id', 'orders'], ['tickets', 'customer_id', 'customers'], ['tickets', 'employee_id', 'employees'],
  ['loyalty', 'customer_id', 'customers'],
]
const complexRelations: RelationDef[] = links.map(([sourceTableId, sourceColumnId, targetTableId]) => ({
  id: `${sourceTableId}-${sourceColumnId}-${targetTableId}`, sourceTableId, sourceColumnId, targetTableId, targetColumnId: 'id', type: sourceTableId === 'loyalty' ? '1:1' : 'N:1',
}))

export const demoCases: DemoCase[] = [
  { id: 'simple', name: 'Простой пример', tables: dataModel, relations: predefinedRelations, initialTableIds: ['execution', 'task', 'project', 'tariff'] },
  { id: 'complex', name: 'Интернет-магазин', tables: complexTables, relations: complexRelations, initialTableIds: complexTables.map((table) => table.id) },
]
