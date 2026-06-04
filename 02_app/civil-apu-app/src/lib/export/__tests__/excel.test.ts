import { describe, expect, it } from 'vitest'
import { consolidateBudgetComponents } from '../../calculations/budgetConsolidation'
import { addTableSheet, createWorkbook, safeExcelFileName } from '../excel'
import { buildBudgetWorkbook } from '../budgetExcel'
import { buildRubroWorkbook, buildRubrosSummaryWorkbook } from '../rubrosExcel'

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

  it('builds a rubro individual workbook with expected sheets', () => {
    const workbook = buildRubroWorkbook({
      code: 'H-001',
      description: 'Hormigon',
      unit: 'm3',
      status: 'DRAFT',
      indirectPercentage: 20,
      totals: {
        materialsSubtotal: 10,
        laborSubtotal: 5,
        equipmentSubtotal: 2,
        transportSubtotal: 1,
        directCost: 18,
        indirectCost: 3.6,
        unitPrice: 21.6,
      },
      materials: [{ code: 'MAT-001', description: 'Cemento', unit: 'kg', quantity: 1, unitCost: 10, totalCost: 10 }],
      labor: [{ code: 'MO-001', description: 'Albanil', unit: 'hora', quantity: 1, unitCost: 5, totalCost: 5 }],
      equipment: [{ code: 'EQ-001', description: 'Concretera', unit: 'hora', quantity: 1, unitCost: 2, totalCost: 2 }],
      transport: [{ code: 'TR-001', description: 'Acarreo', unit: 'm3', quantity: 1, unitCost: 1, totalCost: 1 }],
    })

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Resumen APU',
      'Materiales',
      'Mano de obra',
      'Equipos',
      'Transporte',
    ])
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
                laborItemId: 'labor-1',
                workerQuantity: 1,
                hourlyCostSnapshot: 5,
                laborItem: { code: 'MO-001', roleName: 'Albanil' },
              },
            ],
            equipment: [
              {
                equipmentItemId: 'equipment-1',
                equipmentQuantity: 1,
                rateSnapshot: 2,
                equipmentItem: { code: 'EQ-001', description: 'Concretera' },
              },
            ],
            transport: [{ code: 'TR-001', description: 'Acarreo', unit: 'm3', quantity: 1, unitCost: 1 }],
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
