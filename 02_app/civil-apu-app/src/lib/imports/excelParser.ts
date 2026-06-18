import ExcelJS from 'exceljs'
import parseDecimalString from './numberParser'

type ExcelJsBuffer = Parameters<ExcelJS.Workbook['xlsx']['load']>[0]

export type RawMaterialRow = {
  rowNumber: number
  Code?: string
  Description?: string
  Unit?: string
  UnitPrice?: number | null
  Note?: string
  IsActive?: boolean
}

export async function parseMaterialsSheetFromBuffer(buffer: ArrayBuffer): Promise<RawMaterialRow[]> {
  const workbook = new ExcelJS.Workbook()
  const buf = Buffer.from(buffer)
  await workbook.xlsx.load(buf as unknown as ExcelJsBuffer)

  // Find sheet named 'Materials' (case-insensitive)
  const sheet = workbook.worksheets.find((w) => (w.name || '').toLowerCase() === 'materials')
  if (!sheet) return []

  const rows: RawMaterialRow[] = []

  const headerRow = sheet.getRow(1)
  const headers: string[] = []
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.text || '').trim()
  })

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return // skip header
    const out: RawMaterialRow = { rowNumber }
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber - 1] || `col${colNumber}`
      const text = cell.text
      const trimmed = typeof text === 'string' ? text.trim() : text
      switch (String(key).toLowerCase()) {
        case 'code':
          out.Code = trimmed as string
          break
        case 'description':
          out.Description = trimmed as string
          break
        case 'unit':
          out.Unit = trimmed as string
          break
        case 'unitprice':
        case 'unit price':
          out.UnitPrice = parseDecimalString(trimmed)
          break
        case 'note':
          out.Note = trimmed as string
          break
        case 'isactive':
        case 'is active':
          out.IsActive = String(trimmed).toLowerCase() === '1' || String(trimmed).toLowerCase() === 'true'
          break
        default:
          // ignore unknown columns
          break
      }
    })
    rows.push(out)
  })

  return rows
}

export default parseMaterialsSheetFromBuffer
