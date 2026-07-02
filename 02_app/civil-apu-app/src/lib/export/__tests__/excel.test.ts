import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { consolidateBudgetComponents } from '../../calculations/budgetConsolidation'
import { addTableSheet, createWorkbook, safeExcelFileName, workbookToBuffer } from '../excel'
import { buildBudgetWorkbook } from '../budgetExcel'
import { buildRubroWorkbook, buildRubrosApuWorkbook, buildRubrosSummaryWorkbook, numberToSpanishWords } from '../rubrosExcel'

describe('excel export helpers', () => {
  it('creates a simple table sheet with headers and rows', () => {
    const workbook = createWorkbook()
    const worksheet = addTableSheet(
      workbook,
      'Tabla simple',
      [
        { header: 'Codigo', key: 'code' },
        { header: 'Descripcion', key: 'description' },
      ],
      [{ code: 'MAT-001', description: 'Cemento' }],
    )

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Tabla simple'])
    expect(worksheet.getRow(1).font?.bold).toBe(true)
    expect(worksheet.getRow(2).getCell(1).value).toBe('MAT-001')
  })

  it('builds safe excel file names', () => {
    expect(safeExcelFileName('Presupuesto Test 1')).toBe('presupuesto-test-1.xlsx')
    expect(safeExcelFileName('rubro:H/001')).toBe('rubro-h-001.xlsx')
  })

  it('builds a Franklin template rubro workbook with one sheet named by code', async () => {
    const workbook = await buildRubroWorkbook({
      code: 'H-001',
      description: 'Hormigon',
      projectName: 'Proyecto Provincial',
      unit: 'm3',
      status: 'DRAFT',
      indirectPercentage: 20,
      directCost: 18,
      indirectCost: 3.6,
      unitPrice: 21.6,
      materials: [{ code: 'MAT-001', description: 'Cemento', unit: 'kg', quantity: 1, unitCost: 10, totalCost: 10 }],
      labor: [{ code: 'MO-001', description: 'Albanil', unit: 'hora', quantity: 1, performance: 1, unitCost: 5, totalCost: 5 }],
      equipment: [{ code: 'EQ-001', description: 'Concretera', unit: 'hora', quantity: 1, performance: 1, unitCost: 2, totalCost: 2 }],
      transport: [{ code: 'TR-001', description: 'Acarreo', unit: 'm3', distance: 4, quantity: 1, unitCost: 1, totalCost: 1 }],
    })

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['H-001'])
    const worksheet = workbook.getWorksheet('H-001')
    if (!worksheet) throw new Error('Expected H-001 worksheet')
    expect(worksheet?.getCell('A1').value).toBe('ANALISIS DE PRECIOS UNITARIOS')
    expect(worksheet?.getCell('A3').value).toBe('PROYECTO:')
    expect(worksheet?.getCell('B3').value).toBe('"Proyecto Provincial"')
    expect(worksheet?.getCell('B5').value).toBe('Hormigon')
    expect(worksheet?.getCell('B7').value).toBe('H-001')
    expect(worksheet?.getCell('A9').value).toBe('EQUIPOS (1)')
    expect(worksheet?.getCell('D12').value).toBe(2)
    expect(worksheet?.getCell('F12').value).toBe(2)
    expect(worksheet?.getCell('G12').value).toBeCloseTo(2 / 18)
    expect(worksheet.getCell('D12').numFmt).toBe('0.00')
    expect(worksheet.getCell('F12').numFmt).toBe('0.00')
    expect(worksheet.getCell('G12').numFmt).toBe('0.00000')
    expect(worksheet.getCell('J12').numFmt).toBe('0.00000')
    expect(worksheet.getCell('K12').numFmt).toBe('0.00000')
    const equipmentSubtotalRow = findRowByText(worksheet, 'SUBTOTAL (1)')
    const directCostRow = findRowByText(worksheet, 'TOTAL COSTO DIRECTO')
    const indirectCostRow = findRowByText(worksheet, 'COSTO INDIRECTO %')
    const offeredValueRow = findRowByText(worksheet, 'VALOR OFERTADO:')
    expect(worksheet.getCell(equipmentSubtotalRow, 6).value).toBe(2)
    expect(worksheet.getCell(equipmentSubtotalRow, 6).numFmt).toBe('0.00')
    expect(worksheet.getCell(equipmentSubtotalRow, 7).numFmt).toBe('0.00000')
    expect(worksheet.getCell(equipmentSubtotalRow, 11).numFmt).toBe('0.00000')
    expect(worksheet.getCell(directCostRow, 6).value).toBe(18)
    expect(worksheet.getCell(directCostRow, 6).numFmt).toBe('0.000')
    expect(worksheet.getCell(indirectCostRow, 6).value).toBe(3.6)
    expect(worksheet.getCell(indirectCostRow, 6).numFmt).toBe('0.000')
    expect(worksheet.getCell(offeredValueRow, 6).value).toBe(21.6)
    expect(worksheet.getCell(offeredValueRow, 6).numFmt).toBe('0.000')
    expect(worksheet.getCell(offeredValueRow, 7).numFmt).toBe('0.00000')
    expect(worksheet.getCell(offeredValueRow, 11).numFmt).toBe('0.00000')
    expect(worksheet.getCell(findRowByValue(worksheet, 'VEINTIUNO DOLARES CON 60/100'), 6).value).toBe('VEINTIUNO DOLARES CON 60/100')
    expect(workbook.getWorksheet('README_EXPORTADOR')).toBeUndefined()
    expect(workbookHasFormula(workbook)).toBe(false)
    expect(workbookHasMarker(workbook)).toBe(false)
  })

  it('duplicates the Franklin template sheet for several rubros and expands data rows', async () => {
    const workbook = await buildRubrosApuWorkbook([
      {
        code: 'R-001',
        description: 'Rubro 1',
        unit: 'm2',
        status: 'DRAFT',
        directCost: 0,
        indirectPercentage: 20,
        unitPrice: 0,
        materials: [],
        labor: [],
        equipment: [],
        transport: [],
      },
      {
        code: 'R-002',
        description: 'Rubro 2',
        unit: 'm2',
        status: 'DRAFT',
        directCost: 42,
        indirectPercentage: 20,
        unitPrice: 9999999.99,
        materials: Array.from({ length: 21 }, (_, index) => ({
          description: `Material ${index + 1}`,
          unit: 'u',
          quantity: 1,
          unitCost: 2,
          totalCost: 2,
        })),
        labor: [],
        equipment: [],
        transport: [],
      },
    ])

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['R-001', 'R-002'])
    const worksheet = workbook.getWorksheet('R-002')
    if (!worksheet) throw new Error('Expected R-002 worksheet')
    const material21Row = findRowByValue(worksheet, 'Material 21')
    expect(worksheet?.getCell(material21Row, 1).value).toBe('Material 21')
    expect(worksheet?.getCell(material21Row, 6).value).toBe(2)
    expect(worksheet?.getCell(material21Row, 4).numFmt).toBe('0.00')
    expect(worksheet?.getCell(material21Row, 5).numFmt).toBe('0.00')
    expect(worksheet?.getCell(material21Row, 6).numFmt).toBe('0.00')
    expect(worksheet?.getCell(material21Row, 7).numFmt).toBe('0.00000')
    expect(worksheet?.getCell(material21Row, 10).numFmt).toBe('0.00000')
    expect(worksheet?.getCell(material21Row, 11).numFmt).toBe('0.00000')
    expect(worksheet?.getCell(findRowByText(worksheet, 'SUBTOTAL (3)'), 6).value).toBe(42)
    expect(worksheet?.getCell(findRowByText(worksheet, 'TOTAL COSTO DIRECTO'), 6).value).toBe(42)
    expect(worksheet?.getCell(findRowByText(worksheet, 'VALOR OFERTADO:'), 6).value).toBe(9999999.99)
    expect(findRowByValue(worksheet, 'NUEVE MILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE DOLARES CON 99/100')).toBeGreaterThan(0)
    expect(workbookHasFormula(workbook)).toBe(false)
    expect(workbookHasMarker(workbook)).toBe(false)
  })

  it('exports a clean workbook that can be loaded again without formulas or repair metadata errors', async () => {
    const workbook = await buildRubroWorkbook({
      code: 'SIN-TRANSPORTE',
      description: 'Rubro sin transporte',
      unit: 'm2',
      status: 'DRAFT',
      directCost: 12,
      indirectPercentage: 20,
      unitPrice: 14.4,
      materials: [{ description: 'Material unico', unit: 'u', quantity: 2, unitCost: 6, totalCost: 12 }],
      labor: [],
      equipment: [],
      transport: [],
    })
    const buffer = await workbookToBuffer(workbook)
    const loaded = new ExcelJS.Workbook()
    await loaded.xlsx.load(buffer)

    expect(loaded.worksheets.map((sheet) => sheet.name)).toEqual(['SIN-TRANSPORTE'])
    expect(loaded.getWorksheet('SIN-TRANSPORTE')?.getCell('A55').value).toBeNull()
    expect(workbookHasFormula(loaded)).toBe(false)
    expect(workbookHasMarker(loaded)).toBe(false)
  })

  it('converts money values to Spanish words for Franklin exports', () => {
    expect(numberToSpanishWords(0)).toBe('CERO DOLARES CON 00/100')
    expect(numberToSpanishWords(1.01)).toBe('UNO DOLAR CON 01/100')
    expect(numberToSpanishWords(188.47)).toBe('CIENTO OCHENTA Y OCHO DOLARES CON 47/100')
    expect(numberToSpanishWords(9999999.99)).toBe(
      'NUEVE MILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE DOLARES CON 99/100',
    )
  })

  it('builds a rubros summary workbook', () => {
    const workbook = buildRubrosSummaryWorkbook([
      {
        code: 'H-001',
        description: 'Hormigon',
        unit: 'm3',
        directCost: 18,
        indirectPercentage: 20,
        unitPrice: 21.6,
        status: 'DRAFT',
      },
    ])

    expect(workbook.getWorksheet('Resumen Rubros')?.rowCount).toBe(2)
  })

  it('builds a budget workbook with expected consolidated sheets', () => {
    const consolidation = consolidateBudgetComponents({
      items: [
        {
          quantity: 2,
          rubro: {
            materials: [
              {
                id: 'rubro-material-1',
                materialId: 'material-1',
                quantity: 3,
                unitCostSnapshot: 4,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: true,
                  usesCategory2: false,
                },
              },
            ],
            labor: [
              {
                id: 'rubro-labor-1',
                laborItemId: 'labor-1',
                workerQuantity: 1,
                hourlyCostSnapshot: 5,
                laborItem: { code: 'MO-001', roleName: 'Albanil' },
              },
            ],
            equipment: [
              {
                id: 'rubro-equipment-1',
                equipmentItemId: 'equipment-1',
                equipmentQuantity: 1,
                rateSnapshot: 2,
                equipmentItem: { code: 'EQ-001', description: 'Concretera' },
              },
            ],
            transport: [{ id: 'rubro-transport-1', code: 'TR-001', description: 'Acarreo', unit: 'm3', quantity: 1, unitCost: 1 }],
          },
        },
      ],
    })

    const workbook = buildBudgetWorkbook(
      {
        projectName: 'Proyecto Test',
        budgetName: 'Presupuesto Test',
        budgetCode: 'P-001',
        indirectPercentage: 20,
        subtotal: 100,
        ivaAmount: 0,
        total: 100,
        items: [
          {
            itemNumber: '1',
            rubroCodeSnapshot: 'H-001',
            descriptionSnapshot: 'Hormigon',
            unitSnapshot: 'm3',
            quantity: 2,
            directCostSnapshot: 40,
            indirectCostSnapshot: 10,
            unitPriceSnapshot: 50,
            subtotalSnapshot: 100,
            totalPrice: 100,
          },
        ],
      },
      consolidation,
    )

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Resumen Presupuesto',
      'Rubros del Presupuesto',
      'Materiales Consolidados',
      'Mano de Obra Consolidada',
      'Equipos Consolidados',
      'Transporte Consolidado',
    ])
  })
})

function workbookHasFormula(workbook: ExcelJS.Workbook): boolean {
  return workbook.worksheets.some((worksheet) => {
    let found = false
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.formula) found = true
      })
    })
    return found
  })
}

function workbookHasMarker(workbook: ExcelJS.Workbook): boolean {
  return workbook.worksheets.some((worksheet) => {
    let found = false
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && /<<[^>]+>>/.test(cell.value)) found = true
      })
    })
    return found
  })
}

function findRowByText(worksheet: ExcelJS.Worksheet, text: string): number {
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
      const value = row.getCell(columnNumber).value
      if (typeof value === 'string' && value.includes(text)) return rowNumber
    }
  }
  throw new Error(`Could not find row containing ${text}`)
}

function findRowByValue(worksheet: ExcelJS.Worksheet, expected: string): number {
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
      if (row.getCell(columnNumber).value === expected) return rowNumber
    }
  }
  throw new Error(`Could not find row with ${expected}`)
}
