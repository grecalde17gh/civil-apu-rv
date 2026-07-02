import ExcelJS from 'exceljs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    equipmentItem: { findMany: vi.fn() },
    laborItem: { findMany: vi.fn() },
    material: { findMany: vi.fn() },
  },
}))

vi.mock('../../db/prisma', () => ({
  prisma: mocks.prisma,
}))

vi.mock('../../db/rubros', () => ({
  updateRubroTotals: vi.fn(),
}))

import { parseRubrosApuWorkbook } from '../rubrosApuExcelParser'
import { previewRubrosImportFromExcelBuffer } from '../rubrosImport'

type WorkbookOptions = {
  blankRowsBeforeEquipment?: number
  emptyEquipment?: boolean
  laborCode?: string
  omitLabor?: boolean
  omitTransport?: boolean
  includeDecorativeRows?: boolean
}

async function workbookBuffer(startRow: number, options?: WorkbookOptions) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('RUBRO-001')

  sheet.getCell('A1').value = 'PROYECTO'
  sheet.getCell('B1').value = 'Hospital'
  sheet.getCell('A3').value = 'RUBRO'
  sheet.getCell('B3').value = 'Enlucido vertical'
  sheet.getCell('A4').value = 'CODIGO'
  sheet.getCell('B4').value = 'RALB0007'
  sheet.getCell('E3').value = 'UNIDAD'
  sheet.getCell('F3').value = 'm2'
  sheet.getCell('G3').value = 'RENDIMIENTO'
  sheet.getCell('H3').value = 1

  const equipmentRow = startRow + (options?.blankRowsBeforeEquipment ?? 0)
  addSection(sheet, equipmentRow, 'EQUIPOS', ['C\u00f3digo', 'Descripci\u00f3n', 'Cantidad', 'Tarifa', 'Rendimiento'], options?.emptyEquipment ? [] : [
    ['', 'Concretera', 1, 5.5, 0.25],
  ], { includeDecorativeRows: options?.includeDecorativeRows })
  if (!options?.omitLabor) {
    addSection(sheet, equipmentRow + 6, 'M.O.', ['C\u00f3digo', 'Estructura ocupacional', 'Cantidad', 'Tarifa', 'Rendimiento'], [
      [options?.laborCode ?? '', 'C1 - Alba\u00f1il especializado', 2, 4.5, 0.5],
    ])
  }
  addSection(sheet, equipmentRow + 12, 'MATERIALES', ['C\u00f3digo', 'Descripci\u00f3n', 'Unidad', 'Cantidad', 'P. Unitario'], [
    ['', 'Cemento Portland', 'saco', 0.25, 8],
  ], { includeDecorativeRows: options?.includeDecorativeRows })
  if (!options?.omitTransport) {
    addSection(sheet, equipmentRow + 18, 'TRANSPORTES', ['C\u00f3digo', 'Descripci\u00f3n', 'Unidad', 'Cantidad', 'Precio unitario'], [
      ['', 'Acarreo interno', 'm3-km', 1, 2],
    ])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}

function addSection(
  sheet: ExcelJS.Worksheet,
  rowNumber: number,
  title: string,
  headers: string[],
  rows: Array<Array<string | number | null>>,
  options?: { includeDecorativeRows?: boolean; omitSubtotal?: boolean; blankRowsBeforeData?: number },
) {
  sheet.getCell(rowNumber, 1).value = title
  const headerRow = sheet.getRow(rowNumber + 1)
  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header
  })
  const formulaRow = sheet.getRow(rowNumber + 2)
  headers.forEach((_, index) => {
    formulaRow.getCell(index + 1).value = formulaLabelFor(index)
  })
  let nextRow = rowNumber + 3
  if (options?.includeDecorativeRows) {
    sheet.getCell(nextRow, 1).value = '-'
    nextRow += 1
    headers.forEach((header, index) => {
      sheet.getRow(nextRow).getCell(index + 1).value = header
    })
    nextRow += 1
  }
  nextRow += options?.blankRowsBeforeData ?? 0
  rows.forEach((values, rowIndex) => {
    const row = sheet.getRow(nextRow + rowIndex)
    values.forEach((value, columnIndex) => {
      row.getCell(columnIndex + 1).value = value
    })
  })
  if (!options?.omitSubtotal) {
    const sectionNumber = title.match(/\((\d+)\)/)?.[1]
    sheet.getCell(nextRow + rows.length, 1).value = sectionNumber ? `SUBTOTAL (${sectionNumber})` : 'SUBTOTAL'
  }
}

function formulaLabelFor(index: number) {
  const labels = ['A', 'B', 'C = A x B', 'R', 'D = C x R', 'PRT=Td/Q', 'Vi%', 'PRT*Vi%']
  return labels[index] ?? ''
}

describe('rubros APU Excel parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.equipmentItem.findMany.mockResolvedValue([
      { code: 'EQ-001', description: 'Concretera' },
      { code: 'EQ-002', description: 'Herramienta menor' },
    ])
    mocks.prisma.laborItem.findMany.mockResolvedValue([])
    mocks.prisma.material.findMany.mockResolvedValue([{ code: 'MAT-001', description: 'Cemento Portland' }])
  })

  it('imports the original layout when Equipos starts on row 12', async () => {
    const parsed = await parseRubrosApuWorkbook(await workbookBuffer(12))
    const sheet = parsed.sheets[0]

    expect(sheet.code).toBe('RALB0007')
    expect(sheet.description).toBe('Enlucido vertical')
    expect(sheet.sections.Equipos).toHaveLength(1)
    expect(sheet.sections.Equipos[0]).toMatchObject({ description: 'Concretera', quantity: 1, rate: 5.5, performance: 0.25 })
  })

  it('imports the same layout when Equipos starts on row 9', async () => {
    const parsed = await parseRubrosApuWorkbook(await workbookBuffer(9))
    const sheet = parsed.sheets[0]

    expect(sheet.sections.Equipos).toHaveLength(1)
    expect(sheet.sections['Mano de obra']).toHaveLength(1)
    expect(sheet.sections.Materiales).toHaveLength(1)
    expect(sheet.sections.Transporte).toHaveLength(1)
  })

  it('imports with extra blank rows before Equipos', async () => {
    const parsed = await parseRubrosApuWorkbook(await workbookBuffer(9, { blankRowsBeforeEquipment: 3 }))

    expect(parsed.sheets[0].sections.Equipos[0].description).toBe('Concretera')
  })

  it('imports materials and warns when Equipos section is empty', async () => {
    const parsed = await parseRubrosApuWorkbook(await workbookBuffer(9, { emptyEquipment: true }))
    const sheet = parsed.sheets[0]

    expect(sheet.sections.Equipos).toHaveLength(0)
    expect(sheet.sections.Materiales).toHaveLength(1)
    expect(sheet.issues.map((issue) => issue.message)).toContain('Seccion Equipos sin componentes.')
  })

  it('reads general data from the cell immediately to the right of each Franklin label', async () => {
    const parsed = await parseRubrosApuWorkbook(await workbookBuffer(12))
    const sheet = parsed.sheets[0]

    expect(sheet).toMatchObject({
      code: 'RALB0007',
      description: 'Enlucido vertical',
      unit: 'm2',
      performanceValue: 1,
    })
  })

  it('prints a diagnostic map with general data, section blocks, headers, and row decisions', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    let output = ''

    try {
      await parseRubrosApuWorkbook(await workbookBuffer(9, {
        includeDecorativeRows: true,
        omitLabor: true,
        omitTransport: true,
      }))
      output = infoSpy.mock.calls.map((call) => String(call[0])).join('\n')
    } finally {
      infoSpy.mockRestore()
    }

    expect(output).toContain('datos generales')
    expect(output).toContain('mapa secciones')
    expect(output).toContain('encabezados')
    expect(output).toContain('fila')
    expect(output).toContain('aceptada')
    expect(output).toContain('descartada')
  })

  it('matches labor code C1 by full occupational structure instead of internal code', async () => {
    mocks.prisma.laborItem.findMany.mockResolvedValue([{ code: 'MO-001', roleName: 'C1 - Alba\u00f1il especializado' }])

    const preview = await previewRubrosImportFromExcelBuffer(await workbookBuffer(9, { laborCode: 'C1' }))
    const labor = preview.components.find((component) => component.section === 'Mano de obra')

    expect(labor).toMatchObject({
      matchedComponent: 'MO-001 C1 - Alba\u00f1il especializado',
      matchMethod: 'descripcion normalizada',
      status: 'OK',
    })
  })

  it('validates rubro with only Equipos and Materiales as warning, not error', async () => {
    const preview = await previewRubrosImportFromExcelBuffer(await workbookBuffer(9, { omitLabor: true, omitTransport: true }))

    expect(preview.sheets[0]).toMatchObject({
      status: 'Con advertencias',
      equipmentCount: 1,
      laborCount: 0,
      materialsCount: 1,
      transportCount: 0,
      errors: [],
    })
    expect(preview.sheets[0].warnings).toContain('No se encontro la seccion Mano de obra. Se continuara sin componentes de mano de obra.')
    expect(preview.sheets[0].warnings).toContain('No se encontro la seccion Transporte. Se continuara sin componentes de transporte.')
  })

  it('does not convert dash rows, repeated headers, or SUBTOTAL into preview components', async () => {
    const preview = await previewRubrosImportFromExcelBuffer(await workbookBuffer(9, {
      omitLabor: true,
      omitTransport: true,
      includeDecorativeRows: true,
    }))

    expect(preview.components.map((component) => component.sourceText)).toEqual(['Concretera', 'Cemento Portland'])
    expect(preview.components.map((component) => component.sourceText)).not.toContain('-')
    expect(preview.components.map((component) => component.sourceText)).not.toContain('SUBTOTAL')
  })

  it('counts only real equipment rows and matches components without code by description', async () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('RUBRO-DASH')

    sheet.getCell('A2').value = 'RUBRO'
    sheet.getCell('B2').value = 'Rubro con guiones'
    sheet.getCell('A3').value = 'CODIGO'
    sheet.getCell('B3').value = 'RDASH001'
    sheet.getCell('A4').value = 'UNIDAD'
    sheet.getCell('B4').value = 'u'

    addSection(sheet, 9, 'EQUIPOS', ['C\u00f3digo', 'Descripci\u00f3n', 'Cantidad', 'Tarifa', 'Rendimiento'], [
      [null, 'Herramienta menor', 1, 2.5, 1],
      [null, '-', null, null, null],
      [null, '-', 1, 2, 3],
      ['-', '-', null, null, null],
    ])

    const buffer = await workbook.xlsx.writeBuffer()
    const preview = await previewRubrosImportFromExcelBuffer(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer))

    expect(preview.sheets[0].equipmentCount).toBe(1)
    expect(preview.components).toHaveLength(1)
    expect(preview.components[0]).toMatchObject({
      sourceText: 'Herramienta menor',
      matchedComponent: 'EQ-002 Herramienta menor',
      matchMethod: 'descripcion normalizada',
      status: 'OK',
    })
    expect(preview.issues.map((issue) => issue.message).join(' ')).not.toContain('falta codigo')
    expect(preview.components.map((component) => component.sourceText)).not.toContain('-')
  })

  it('delimits sections by real titles with blanks, shifted Transporte, and ninguno rows', async () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('RUBRO-MIX')

    sheet.getCell('A2').value = 'RUBRO'
    sheet.getCell('B2').value = 'Rubro con secciones desplazadas'
    sheet.getCell('A3').value = 'CODIGO'
    sheet.getCell('B3').value = 'RMIX001'
    sheet.getCell('A4').value = 'UNIDAD'
    sheet.getCell('B4').value = 'u'

    addSection(sheet, 9, 'EQUIPOS', ['C\u00f3digo', 'Descripci\u00f3n', 'Cantidad', 'Tarifa', 'Rendimiento'], [
      [null, 'ninguno', null, null, null],
      [null, 'Concretera', 1, 5.5, 0.25],
    ], { omitSubtotal: true, blankRowsBeforeData: 2 })
    addSection(sheet, 26, 'MANO DE OBRA DIRECTA', ['C\u00f3digo', 'Estructura ocupacional', 'Cantidad', 'Tarifa', 'Rendimiento'], [
      [null, 'ninguno', null, null, null],
      [null, 'C1 - Alba\u00f1il especializado', 2, 4.5, 0.5],
    ], { omitSubtotal: true, blankRowsBeforeData: 3 })
    addSection(sheet, 45, 'MATERIALES', ['C\u00f3digo', 'Descripci\u00f3n', 'Unidad', 'Cantidad', 'P. Unitario'], [
      [null, 'Cemento Portland', 'saco', 0.25, 8],
    ], { omitSubtotal: true, blankRowsBeforeData: 1 })
    addSection(sheet, 70, 'FLETE', ['C\u00f3digo', 'Descripci\u00f3n', 'Unidad', 'Cantidad', 'Precio unitario'], [
      [null, 'Acarreo interno', 'm3-km', 1, 2],
    ], { blankRowsBeforeData: 4 })

    const buffer = await workbook.xlsx.writeBuffer()
    const parsed = await parseRubrosApuWorkbook(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer))
    const parsedSheet = parsed.sheets[0]

    expect(parsedSheet.sections.Equipos.map((row) => row.description)).toEqual(['Concretera'])
    expect(parsedSheet.sections['Mano de obra'].map((row) => row.description)).toEqual(['C1 - Alba\u00f1il especializado'])
    expect(parsedSheet.sections.Materiales.map((row) => row.description)).toEqual(['Cemento Portland'])
    expect(parsedSheet.sections.Transporte.map((row) => row.description)).toEqual(['Acarreo interno'])
    expect(parsedSheet.sections.Equipos.some((row) => row.description.includes('Alba'))).toBe(false)
  })

  it('reads the real Franklin structural pattern with formula rows and numbered section titles', async () => {
    const parsedSheet = await parseFranklinPatternSheet(0)

    expect(parsedSheet.sections.Equipos.map((row) => row.description)).toEqual(['Herramienta menor'])
    expect(parsedSheet.sections['Mano de obra'].map((row) => row.description)).toEqual([
      'C1 - Maestro mayor',
      'E2 - Pe\u00f3n/ayudante',
      'D2 - Alba\u00f1il',
      'B1 - Residente de obra',
    ])
    expect(parsedSheet.sections.Materiales.map((row) => row.description)).toEqual([
      'Agua',
      'Cemento portland gris',
      'Arena fina',
      'Aditivo impermeabilizante',
      'Aditivo adherente',
    ])
    expect(parsedSheet.sections.Transporte).toHaveLength(0)
    expect(parsedSheet.issues.map((issue) => issue.message)).toContain('Seccion Transporte sin componentes.')
  })

  it('reads the same Franklin structural pattern with three blank rows above', async () => {
    const parsedSheet = await parseFranklinPatternSheet(3)

    expect(parsedSheet.sections.Equipos).toHaveLength(1)
    expect(parsedSheet.sections['Mano de obra']).toHaveLength(4)
    expect(parsedSheet.sections.Materiales).toHaveLength(5)
    expect(parsedSheet.sections.Transporte).toHaveLength(0)
  })
})

async function parseFranklinPatternSheet(rowOffset: number) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('FRANKLIN')

    sheet.getCell('A1').value = 'PROYECTO'
    sheet.getCell('B1').value = 'Hospital'
    sheet.getCell('A3').value = 'RUBRO'
    sheet.getCell('B3').value = 'Mamposteria de bloque'
    sheet.getCell('A4').value = 'CODIGO'
    sheet.getCell('B4').value = 'R-FRANKLIN'
    sheet.getCell('E3').value = 'UNIDAD'
    sheet.getCell('F3').value = 'm2'
    sheet.getCell('G3').value = 'RENDIMIENTO'
    sheet.getCell('H3').value = 12

    addSection(sheet, 9 + rowOffset, 'EQUIPOS (1)', ['DESCRIPCION', 'CANTIDAD', 'TARIFA', 'COSTO HORA', 'RENDIMIENTO', 'COSTO'], [
      ['Herramienta menor', 1, 0.25, 0.25, 1, 0.25],
      ['ninguno', null, null, null, null, null],
      ['-', null, null, null, null, null],
    ])
    addSection(sheet, 18 + rowOffset, 'MANO DE OBRA (2)', ['DESCRIPCION', 'CANTIDAD', 'JORNAL /HR', 'COSTO HORA', 'RENDIMIENTO', 'COSTO'], [
      ['C1 - Maestro mayor', 1, 5.5, 5.5, 0.1, 0.55],
      ['E2 - Pe\u00f3n/ayudante', 2, 3.2, 6.4, 0.1, 0.64],
      ['D2 - Alba\u00f1il', 1, 4.25, 4.25, 0.1, 0.43],
      ['B1 - Residente de obra', 0.1, 8, 0.8, 0.1, 0.08],
      ['ninguno', null, null, null, null, null],
    ])
    addSection(sheet, 30 + rowOffset, 'MATERIALES (3)', ['DESCRIPCION', '', 'UNIDAD', 'CANTIDAD', 'P. UNITARIO', 'COSTO'], [
      ['Agua', null, 'm3', 0.02, 1, 0.02],
      ['Cemento portland gris', null, 'saco', 0.35, 8, 2.8],
      ['Arena fina', null, 'm3', 0.04, 15, 0.6],
      ['Aditivo impermeabilizante', null, 'kg', 0.1, 3, 0.3],
      ['Aditivo adherente', null, 'kg', 0.08, 4, 0.32],
      ['ninguno', null, '-', null, null, null],
      ['-', null, '-', 0, 0, 0],
    ])
    addSection(sheet, 44 + rowOffset, 'TRANSPORTE (4)', ['DESCRIPCION', 'UNIDAD', 'DISTANCIA', 'CANTIDAD', 'TARIFA', 'COSTO'], [
      ['', '', null, null, null, null],
      ['ninguno', '-', null, null, null, null],
      ['-', '-', null, 0, 0, 0],
    ])

    const buffer = await workbook.xlsx.writeBuffer()
    const parsed = await parseRubrosApuWorkbook(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer))
    return parsed.sheets[0]
}
