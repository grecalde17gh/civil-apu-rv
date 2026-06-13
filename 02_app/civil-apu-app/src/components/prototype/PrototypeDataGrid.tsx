'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'

const DEFAULT_COLUMN_WIDTH = 160
const MIN_COLUMN_WIDTH = 72

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
  showColumnLetters?: boolean
  showRowNumbers?: boolean
}

export default function PrototypeDataGrid<T>({
  columns,
  rows,
  getRowKey,
  rowTone,
  showColumnLetters = true,
  showRowNumbers = true,
}: PrototypeDataGridProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => getInitialColumnWidths(columns))
  const [isResizing, setIsResizing] = useState(false)

  function startColumnResize(event: MouseEvent<HTMLSpanElement>, column: PrototypeColumn<T>) {
    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startWidth = columnWidths[column.key] ?? getColumnWidth(column)

    function handleMouseMove(moveEvent: globalThis.MouseEvent) {
      const nextWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + moveEvent.clientX - startX)

      setColumnWidths((current) => ({
        ...current,
        [column.key]: nextWidth,
      }))
    }

    function handleMouseUp() {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    setIsResizing(true)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className={`overflow-auto border border-[#6f7f94] bg-white shadow-[inset_1px_1px_2px_rgba(15,23,42,0.18)] ${
        isResizing ? 'cursor-col-resize select-none' : ''
      }`}
    >
      <table className="min-w-full table-fixed border-collapse font-sans text-[11px]">
        <colgroup>
          {showRowNumbers ? <col style={{ width: 40, minWidth: 40 }} /> : null}
          {columns.map((column) => (
            <col key={`${column.key}-col`} style={{ width: columnWidths[column.key] ?? getColumnWidth(column), minWidth: MIN_COLUMN_WIDTH }} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10 text-slate-950">
          {showColumnLetters ? (
            <tr className="bg-gradient-to-b from-[#f4f7fb] to-[#d4dce8]">
              {showRowNumbers ? (
                <th className="h-5 w-10 border-r border-b border-[#8d9bad] bg-[#d4dce8] px-1 text-center font-mono text-[10px] text-slate-600" />
              ) : null}
              {columns.map((column, index) => (
                <th
                  key={`${column.key}-letter`}
                  style={{ width: columnWidths[column.key] ?? getColumnWidth(column), minWidth: MIN_COLUMN_WIDTH }}
                  className="h-5 border-r border-b border-[#8d9bad] px-1 text-center font-mono text-[10px] font-semibold text-slate-600"
                >
                  {getColumnLetter(index)}
                </th>
              ))}
            </tr>
          ) : null}
          <tr>
            {showRowNumbers ? (
              <th className="w-10 border-r border-b border-[#8d9bad] bg-gradient-to-b from-[#f4f7fb] to-[#d4dce8] px-1 text-center font-mono text-[10px] text-slate-600">
                #
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: columnWidths[column.key] ?? getColumnWidth(column), minWidth: MIN_COLUMN_WIDTH }}
                className={`relative border-r border-b border-[#8d9bad] bg-gradient-to-b from-[#edf4fc] to-[#c9d8eb] px-1.5 py-0.5 font-semibold uppercase shadow-[inset_0_1px_0_white] ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                <span className="block truncate pr-2">{column.header}</span>
                <span
                  className="absolute right-[-4px] top-0 z-20 h-full w-2 cursor-col-resize border-r border-transparent hover:border-[#2f6fa8] hover:bg-[#b8d8f4]"
                  aria-label={`Redimensionar columna ${column.header}`}
                  role="separator"
                  onMouseDown={(event) => startColumnResize(event, column)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const tone = rowTone?.(row) ?? 'normal'

            return (
              <tr key={getRowKey(row)} className={tone === 'chapter' ? 'bg-[#dfe7f2] font-semibold' : 'bg-white'}>
                {showRowNumbers ? (
                  <td className="h-6 border-r border-t border-[#b9c3d1] bg-gradient-to-b from-[#f4f7fb] to-[#dde5ef] px-1 text-center font-mono text-[10px] text-slate-600">
                    {index + 1}
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`h-6 border-r border-t border-[#c7cfdc] px-1 py-0 align-middle ${
                      index === 0 && column.key === columns[0]?.key ? 'outline outline-2 outline-[#217346] outline-offset-[-2px]' : ''
                    } ${
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

function getInitialColumnWidths<T>(columns: PrototypeColumn<T>[]) {
  return Object.fromEntries(columns.map((column) => [column.key, getColumnWidth(column)]))
}

function getColumnWidth<T>(column: PrototypeColumn<T>) {
  if (!column.width) return DEFAULT_COLUMN_WIDTH

  const parsedWidth = Number.parseInt(column.width, 10)

  if (Number.isFinite(parsedWidth)) return Math.max(MIN_COLUMN_WIDTH, parsedWidth)

  return DEFAULT_COLUMN_WIDTH
}

export function PrototypeCellInput({ value, align = 'left' }: { value: string | number; align?: 'left' | 'right' }) {
  return (
    <input
      defaultValue={value}
      className={`h-5 w-full min-w-20 border border-transparent bg-transparent px-1 text-[11px] outline-none focus:border-[#217346] focus:bg-[#eaf4ec] focus:shadow-[inset_0_0_0_1px_#217346] ${
        align === 'right' ? 'text-right font-mono tabular-nums' : ''
      }`}
    />
  )
}

function getColumnLetter(index: number) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    const remainder = (value - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    value = Math.floor((value - remainder) / 26)
  }

  return label
}
