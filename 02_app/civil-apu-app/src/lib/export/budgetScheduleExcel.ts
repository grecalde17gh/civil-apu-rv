import type ExcelJS from 'exceljs'
import { buildScheduleRowValues, calculateScheduleSummary } from '../calculations/budgetSchedule'
import { createWorkbook, sanitizeWorksheetName } from './excel'

export type BudgetScheduleExportRow = {
  budgetItemId: string
  itemNumber: string | null
  code: string
  description: string
  unit: string
  quantity: string
  totalAmount: number
  groupName: string
  startWeek: number | null
  endWeek: number | null
}

export type BudgetScheduleExportData = {
  projectName: string
  budgetName: string
  budgetCode?: string | null
  weekCount: number
  rows: BudgetScheduleExportRow[]
}

function formatCodeAndDescription(row: BudgetScheduleExportRow): string {
  const itemPrefix = row.itemNumber ? `${row.itemNumber}. ` : ''
  return `${itemPrefix}${row.code} - ${row.description}`
}

function applyHeaderStyle(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  row.alignment = { vertical: 'middle', horizontal: 'center' }
}

function applySummaryStyle(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FF0F172A' } }
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' },
  }
}

export function buildBudgetScheduleWorkbook(data: BudgetScheduleExportData): ExcelJS.Workbook {
  const workbook = createWorkbook()
  const worksheet = workbook.addWorksheet(sanitizeWorksheetName('Cronograma valorado'))
  const weeks = Array.from({ length: data.weekCount }, (_, index) => index + 1)
  const rowValues = data.rows.map((row) =>
    buildScheduleRowValues({
      weekCount: data.weekCount,
      totalAmount: row.totalAmount,
      startWeek: row.startWeek,
      endWeek: row.endWeek,
    }),
  )
  const summary = calculateScheduleSummary(rowValues)

  worksheet.columns = [
    { key: 'description', width: 54 },
    ...weeks.map((week) => ({ key: `week${week}`, width: 14, style: { numFmt: '#,##0.00' } })),
    { key: 'total', width: 14, style: { numFmt: '#,##0.00' } },
  ]

  const totalColumns = data.weekCount + 2
  worksheet.mergeCells(1, 1, 1, totalColumns)
  worksheet.getCell(1, 1).value = 'Cronograma valorado de trabajos'
  worksheet.getCell(1, 1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  worksheet.getCell(1, 1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' },
  }
  worksheet.getCell(1, 1).alignment = { horizontal: 'center' }

  worksheet.addRow([data.budgetCode ? `${data.projectName} / ${data.budgetCode} - ${data.budgetName}` : `${data.projectName} / ${data.budgetName}`])
  worksheet.mergeCells(2, 1, 2, totalColumns)
  worksheet.getRow(2).font = { bold: true }

  const header = worksheet.addRow(['Rubro / Descripción', ...weeks.map((week) => `Semana ${week}`), 'Total rubro'])
  applyHeaderStyle(header)

  const groupedRows = new Map<string, BudgetScheduleExportRow[]>()
  data.rows.forEach((row) => {
    const groupName = row.groupName.trim() || 'Grupo 1'
    groupedRows.set(groupName, [...(groupedRows.get(groupName) ?? []), row])
  })

  for (const [groupName, rows] of groupedRows.entries()) {
    const groupRow = worksheet.addRow([groupName.toUpperCase()])
    worksheet.mergeCells(groupRow.number, 1, groupRow.number, totalColumns)
    groupRow.font = { bold: true, color: { argb: 'FF1E3A8A' } }
    groupRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDBEAFE' },
    }

    rows.forEach((row) => {
      const values = buildScheduleRowValues({
        weekCount: data.weekCount,
        totalAmount: row.totalAmount,
        startWeek: row.startWeek,
        endWeek: row.endWeek,
      })

      worksheet.addRow([formatCodeAndDescription(row), ...values.map((value) => (value > 0 ? value : null)), row.totalAmount])
    })
  }

  const partialRow = worksheet.addRow(['INVERSIÓN PARCIAL', ...summary.weeklyPartial, summary.totalDistributed])
  const partialPercentRow = worksheet.addRow(['PORCENTAJE DE INVERSIÓN PARCIAL', ...summary.weeklyPartialPercent.map((value) => value / 100), null])
  const accumulatedRow = worksheet.addRow(['INVERSIÓN ACUMULADA', ...summary.accumulated, summary.totalDistributed])
  const accumulatedPercentRow = worksheet.addRow(['PORCENTAJE DE INVERSIÓN ACUMULADA', ...summary.accumulatedPercent.map((value) => value / 100), null])

  ;[partialRow, partialPercentRow, accumulatedRow, accumulatedPercentRow].forEach(applySummaryStyle)
  ;[partialPercentRow, accumulatedPercentRow].forEach((row) => {
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '0.00%'
      }
    })
  })

  worksheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 3 }]
  worksheet.eachRow((row) => {
    row.alignment = { vertical: 'middle' }
  })

  return workbook
}
