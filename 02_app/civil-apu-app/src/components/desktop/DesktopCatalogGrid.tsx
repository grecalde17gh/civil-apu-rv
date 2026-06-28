'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, useTransition, type ClipboardEvent, type KeyboardEvent } from 'react'
import { type DesktopCatalogChange, type DesktopCatalogKind, type DesktopCatalogSaveResult } from '@/app/desktop/actions'

type Row = { id: string; values: Record<string, string> }

export type DesktopCatalogColumn = {
  key: string
  label: string
  width?: string
  align?: 'left' | 'right'
}

type Range = { start: [number, number]; end: [number, number] }

type DesktopCatalogGridProps = {
  catalog: DesktopCatalogKind
  columns: DesktopCatalogColumn[]
  initialRows: Row[]
  blankRow: Record<string, string>
  importHref?: string
  saveAction: (change: DesktopCatalogChange) => Promise<DesktopCatalogSaveResult>
}

const ROW_HEIGHT = 29
const OVERSCAN = 12

function rowFingerprint(row: Row) {
  return JSON.stringify(row.values)
}

function isWithinRange(range: Range | null, rowIndex: number, columnIndex: number) {
  if (!range) return false
  const minRow = Math.min(range.start[0], range.end[0])
  const maxRow = Math.max(range.start[0], range.end[0])
  const minColumn = Math.min(range.start[1], range.end[1])
  const maxColumn = Math.max(range.start[1], range.end[1])
  return rowIndex >= minRow && rowIndex <= maxRow && columnIndex >= minColumn && columnIndex <= maxColumn
}

export default function DesktopCatalogGrid({ catalog, columns, initialRows, blankRow, importHref, saveAction }: DesktopCatalogGridProps) {
  const [rows, setRows] = useState(initialRows)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [selection, setSelection] = useState<Range | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()
  const [initialById, setInitialById] = useState(() => new Map(initialRows.map((row) => [row.id, rowFingerprint(row)])))
  const cellRefs = useRef(new Map<string, HTMLInputElement>())

  const visibleRows = useMemo(() => {
    const normalizedFilters = Object.entries(filters).filter(([, value]) => value.trim())
    const filtered = rows.filter((row) => normalizedFilters.every(([key, value]) => row.values[key]?.toLowerCase().includes(value.toLowerCase())))
    if (!sort) return filtered
    return [...filtered].sort((a, b) => {
      const result = (a.values[sort.key] ?? '').localeCompare(b.values[sort.key] ?? '', 'es', { numeric: true })
      return sort.direction === 'asc' ? result : -result
    })
  }, [filters, rows, sort])

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(visibleRows.length, Math.ceil((scrollTop + 560) / ROW_HEIGHT) + OVERSCAN)
  const renderedRows = visibleRows.slice(startIndex, endIndex)
  const changedCount = rows.reduce((count, row) => count + (initialById.get(row.id) !== rowFingerprint(row) ? 1 : 0), 0) + deletedIds.length

  function focusCell(rowIndex: number, columnIndex: number) {
    const row = visibleRows[rowIndex]
    if (!row || !columns[columnIndex]) return
    const gridIndex = rows.findIndex((candidate) => candidate.id === row.id)
    const scrollTarget = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT * 2)
    document.getElementById('desktop-catalog-grid-scroll')?.scrollTo({ top: scrollTarget })
    window.setTimeout(() => cellRefs.current.get(`${gridIndex}:${columnIndex}`)?.focus(), 0)
  }

  function updateCell(rowIndex: number, key: string, value: string) {
    setRows((current) => current.map((row, index) => index === rowIndex ? { ...row, values: { ...row.values, [key]: value } } : row))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, visibleRowIndex: number, columnIndex: number) {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], Enter: [1, 0], Tab: [0, event.shiftKey ? -1 : 1],
    }
    const move = moves[event.key]
    if (!move) return
    const nextRow = visibleRowIndex + move[0]
    const nextColumn = columnIndex + move[1]
    if (!visibleRows[nextRow] || !columns[nextColumn]) return
    event.preventDefault()
    focusCell(nextRow, nextColumn)
  }

  function copySelection(event: ClipboardEvent<HTMLInputElement>, visibleRowIndex: number, columnIndex: number) {
    const activeRange = selection ?? { start: [visibleRowIndex, columnIndex] as [number, number], end: [visibleRowIndex, columnIndex] as [number, number] }
    const minRow = Math.min(activeRange.start[0], activeRange.end[0])
    const maxRow = Math.max(activeRange.start[0], activeRange.end[0])
    const minColumn = Math.min(activeRange.start[1], activeRange.end[1])
    const maxColumn = Math.max(activeRange.start[1], activeRange.end[1])
    const text = visibleRows.slice(minRow, maxRow + 1).map((row) => columns.slice(minColumn, maxColumn + 1).map((column) => row.values[column.key] ?? '').join('\t')).join('\n')
    event.preventDefault()
    event.clipboardData.setData('text/plain', text)
  }

  function pasteRange(event: ClipboardEvent<HTMLInputElement>, visibleRowIndex: number, columnIndex: number) {
    const values = event.clipboardData.getData('text/plain').replace(/\r/g, '').split('\n').filter(Boolean).map((line) => line.split('\t'))
    if (!values.length) return
    event.preventDefault()
    const startRow = visibleRows[visibleRowIndex]
    if (!startRow) return
    const sourceIndex = rows.findIndex((row) => row.id === startRow.id)
    setRows((current) => current.map((row, rowIndex) => {
      const pasted = values[rowIndex - sourceIndex]
      if (!pasted) return row
      return pasted.reduce((updated, value, offset) => {
        const column = columns[columnIndex + offset]
        return column ? { ...updated, values: { ...updated.values, [column.key]: value } } : updated
      }, row)
    }))
  }

  function addRow() {
    const id = `new-${crypto.randomUUID()}`
    setRows((current) => [...current, { id, values: { ...blankRow } }])
    setStatus('Fila nueva agregada. Completa los campos y usa Guardar cambios.')
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
    if (!id.startsWith('new-')) setDeletedIds((current) => [...new Set([...current, id])])
  }

  function toggleSort(key: string) {
    setSort((current) => current?.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' })
  }

  function exportExcel() {
    void (async () => {
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Catálogo')
      worksheet.addRow(columns.map((column) => column.label))
      visibleRows.forEach((row) => worksheet.addRow(columns.map((column) => row.values[column.key] ?? '')))
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]
      worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } }
      worksheet.getRow(1).font = { bold: true }
      const blob = new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${catalog}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    })()
  }

  function saveChanges() {
    const changedRows = rows.filter((row) => initialById.get(row.id) !== rowFingerprint(row))
    if (!changedRows.length && !deletedIds.length) return
    startSaving(async () => {
      const result = await saveAction({ catalog, rows: changedRows, deletedIds })
      setStatus(result.message)
      if (!result.ok) return
      setInitialById(new Map(rows.map((row) => [row.id, rowFingerprint(row)])))
      setDeletedIds([])
    })
  }

  return (
    <section className="overflow-hidden border border-slate-400 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-400 bg-slate-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={addRow} className="border border-blue-700 bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">Nueva fila</button>
          {importHref ? <Link href={importHref} className="border border-slate-400 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Importar Excel</Link> : null}
          <button type="button" onClick={exportExcel} className="border border-slate-400 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Exportar Excel</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-600">{visibleRows.length} filas · {changedCount} cambio(s)</span>
          <button type="button" disabled={!changedCount || isSaving} onClick={saveChanges} className="border border-emerald-800 bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </header>
      {status ? <p className="border-b border-slate-300 bg-blue-50 px-3 py-1.5 text-xs text-blue-900">{status}</p> : null}
      <div id="desktop-catalog-grid-scroll" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} className="max-h-[calc(100vh-250px)] min-h-[420px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-200 text-slate-700">
            <tr>
              <th className="w-10 border border-slate-400 px-2 py-1 text-center">#</th>
              {columns.map((column) => <th key={column.key} style={{ minWidth: column.width }} className="border border-slate-400 p-0"><button type="button" onClick={() => toggleSort(column.key)} className="w-full px-2 py-1 text-left font-semibold uppercase tracking-wide hover:bg-slate-300">{column.label}{sort?.key === column.key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}</button><input value={filters[column.key] ?? ''} onChange={(event) => setFilters((current) => ({ ...current, [column.key]: event.target.value }))} placeholder="Filtrar" className="h-6 w-full border-t border-slate-300 bg-white px-1.5 text-[11px] font-normal normal-case outline-none" /></th>)}
              <th className="w-16 border border-slate-400 px-2 py-1">Acción</th>
            </tr>
          </thead>
          <tbody>
            {startIndex > 0 ? <tr><td colSpan={columns.length + 2} style={{ height: startIndex * ROW_HEIGHT }} /></tr> : null}
            {renderedRows.map((row, offset) => {
              const visibleIndex = startIndex + offset
              const sourceIndex = rows.findIndex((candidate) => candidate.id === row.id)
              const changed = initialById.get(row.id) !== rowFingerprint(row)
              return <tr key={row.id} className={changed ? 'bg-amber-50' : 'odd:bg-white even:bg-slate-50'}>
                <td className="border border-slate-300 bg-slate-100 px-2 text-center font-mono text-slate-500">{visibleIndex + 1}</td>
                {columns.map((column, columnIndex) => <td key={column.key} className={`border border-slate-300 p-0 ${isWithinRange(selection, visibleIndex, columnIndex) ? 'bg-blue-100' : ''}`}><input ref={(element) => { const key = `${sourceIndex}:${columnIndex}`; if (element) cellRefs.current.set(key, element); else cellRefs.current.delete(key) }} value={row.values[column.key] ?? ''} onChange={(event) => updateCell(sourceIndex, column.key, event.target.value)} onKeyDown={(event) => handleKeyDown(event, visibleIndex, columnIndex)} onClick={(event) => setSelection(event.shiftKey && selection ? { start: selection.start, end: [visibleIndex, columnIndex] } : { start: [visibleIndex, columnIndex], end: [visibleIndex, columnIndex] })} onCopy={(event) => copySelection(event, visibleIndex, columnIndex)} onPaste={(event) => pasteRange(event, visibleIndex, columnIndex)} className={`h-7 w-full border-0 bg-transparent px-2 outline-none focus:bg-blue-100 focus:ring-2 focus:ring-inset focus:ring-blue-600 ${column.align === 'right' ? 'text-right font-mono tabular-nums' : ''}`} aria-label={`${column.label}, fila ${visibleIndex + 1}`} /></td>)}
                <td className="border border-slate-300 px-1 text-center"><button type="button" onClick={() => removeRow(row.id)} className="text-[11px] font-semibold text-red-700 hover:underline">Eliminar</button></td>
              </tr>
            })}
            {endIndex < visibleRows.length ? <tr><td colSpan={columns.length + 2} style={{ height: (visibleRows.length - endIndex) * ROW_HEIGHT }} /></tr> : null}
          </tbody>
        </table>
      </div>
      <footer className="border-t border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">Las filas eliminadas se desactivan al guardar; no se eliminan físicamente. Usa Mayús + clic y Ctrl+C para copiar una selección. El pegado tabular admite rangos de Excel.</footer>
    </section>
  )
}
