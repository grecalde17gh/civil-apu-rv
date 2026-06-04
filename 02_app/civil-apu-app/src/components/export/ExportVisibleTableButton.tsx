'use client'

type ExportVisibleTableButtonProps = {
  tableId: string
  fileName: string
  label?: string
}

function safeFileName(name: string) {
  const safeName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `${safeName || 'exportacion'}.xlsx`
}

export default function ExportVisibleTableButton({
  tableId,
  fileName,
  label = 'Exportar tabla',
}: ExportVisibleTableButtonProps) {
  async function exportTable() {
    const table = document.getElementById(tableId)
    if (!(table instanceof HTMLTableElement)) return

    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Tabla')
    const headers = Array.from(table.tHead?.rows[0]?.cells ?? [])
      .map((cell) => cell.textContent?.trim() ?? '')
      .filter((header) => header !== 'Acciones')
    const actionColumnIndex = headers.length

    worksheet.addRow(headers)
    Array.from(table.tBodies[0]?.rows ?? []).forEach((row) => {
      const values = Array.from(row.cells)
        .slice(0, actionColumnIndex)
        .map((cell) => cell.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      if (values.length > 0) worksheet.addRow(values)
    })

    worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    }
    worksheet.getRow(1).font = { bold: true }
    headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = Math.min(Math.max(header.length + 4, 12), 48)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = safeFileName(fileName)
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={exportTable}
      className="h-8 rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
    >
      {label}
    </button>
  )
}
