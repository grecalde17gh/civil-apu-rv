import ExcelJS from 'exceljs'

export type ExcelCellValue = string | number | boolean | Date | null | undefined

export type ExcelColumn = {
  header: string
  key: string
  width?: number
  numFmt?: string
}

export type ExcelRow = Record<string, ExcelCellValue>

export function createWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'civil-apu-rv'
  workbook.created = new Date()
  return workbook
}

export function sanitizeWorksheetName(name: string): string {
  return name.replace(/[*?:/\\[\]]/g, ' ').trim().slice(0, 31) || 'Hoja'
}

export function safeExcelFileName(name: string): string {
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

export function addTableSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  columns: ExcelColumn[],
  rows: ExcelRow[],
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet(sanitizeWorksheetName(sheetName))
  worksheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width ?? Math.max(column.header.length + 2, 12),
    style: column.numFmt ? { numFmt: column.numFmt } : undefined,
  }))

  worksheet.addRows(rows)
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  }

  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  headerRow.alignment = { vertical: 'middle' }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle' }
    }
  })

  columns.forEach((column, index) => {
    let width = column.width ?? column.header.length + 2
    rows.forEach((row) => {
      const value = row[column.key]
      width = Math.max(width, String(value ?? '').length + 2)
    })
    worksheet.getColumn(index + 1).width = Math.min(Math.max(width, 10), 48)
  })

  return worksheet
}

export async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}
