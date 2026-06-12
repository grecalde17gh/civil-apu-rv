import type { ReactNode } from 'react'

export type PrototypeColumn<T> = {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  width?: string
  render: (row: T, index: number) => ReactNode
}

type PrototypeDataGridProps<T> = {
  columns: PrototypeColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  rowTone?: (row: T) => 'chapter' | 'normal'
}

export default function PrototypeDataGrid<T>({ columns, rows, getRowKey, rowTone }: PrototypeDataGridProps<T>) {
  return (
    <div className="overflow-auto border border-slate-400 bg-white">
      <table className="min-w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-slate-800 text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={`border-r border-slate-600 px-2 py-1.5 font-semibold uppercase ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const tone = rowTone?.(row) ?? 'normal'

            return (
              <tr key={getRowKey(row)} className={tone === 'chapter' ? 'bg-slate-200 font-semibold' : 'odd:bg-white even:bg-slate-50'}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`border-r border-t border-slate-300 px-2 py-1 align-middle ${
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function PrototypeCellInput({ value, align = 'left' }: { value: string | number; align?: 'left' | 'right' }) {
  return (
    <input
      defaultValue={value}
      className={`h-7 w-full min-w-20 border border-transparent bg-transparent px-1 text-xs outline-none focus:border-blue-500 focus:bg-blue-50 ${
        align === 'right' ? 'text-right font-mono tabular-nums' : ''
      }`}
    />
  )
}
