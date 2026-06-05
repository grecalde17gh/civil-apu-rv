import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  createLabor: vi.fn(),
  updateLabor: vi.fn(),
  createEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  prisma: {
    material: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
    },
    laborItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
    },
    equipmentItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
    },
  },
}))

vi.mock('../../db/prisma', () => ({
  prisma: mocks.prisma,
}))

vi.mock('../../db/labor', () => ({
  createLabor: mocks.createLabor,
  updateLabor: mocks.updateLabor,
}))

vi.mock('../../db/materials', () => ({
  createMaterial: mocks.createMaterial,
  updateMaterial: mocks.updateMaterial,
}))

vi.mock('../../db/equipment', () => ({
  createEquipment: mocks.createEquipment,
  updateEquipment: mocks.updateEquipment,
}))

import { applyEquipmentImport, previewEquipmentFromBuffer } from '../equipmentImport'
import { applyLaborImport, buildLaborTemplateBuffer, LABOR_TEMPLATE_FILE_NAME, previewLaborFromBuffer } from '../laborImport'
import { parseBooleanInput, parseDecimalInput } from '../commonImport'
import { MATERIALS_TEMPLATE_FILE_NAME, applyMaterialsImport, buildMaterialsTemplateBuffer, previewMaterialsFromBuffer } from '../materialsImport'
import { buildEquipmentTemplateBuffer, EQUIPMENT_TEMPLATE_FILE_NAME } from '../equipmentImport'
import { GET as getMaterialsTemplate } from '../../../../app/api/imports/materials/template/route'
import { GET as getLaborTemplate } from '../../../../app/api/imports/labor/template/route'
import { GET as getEquipmentTemplate } from '../../../../app/api/imports/equipment/template/route'

async function workbookBuffer(sheetName: string, headers: string[], rows: Array<Array<string | number | null>>) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  sheet.addRow(headers)
  rows.forEach((row) => sheet.addRow(row))
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}

function legacyXlsWorkbookBuffer(sheetName: string, headers: string[], rows: Array<Array<string | number | null>>) {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' }) as Buffer
}

function decimalMock(value: string | number) {
  return { toString: () => String(value) }
}

function sheetHeaders(workbook: ExcelJS.Workbook) {
  return (workbook.worksheets[0].getRow(1).values as Array<string>).slice(1)
}

describe('catalog Excel imports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.material.findMany.mockResolvedValue([])
    mocks.prisma.material.findUnique.mockResolvedValue(null)
    mocks.prisma.material.createMany.mockImplementation(async ({ data }) => ({ count: data.length }))
    mocks.prisma.laborItem.findMany.mockResolvedValue([])
    mocks.prisma.laborItem.findUnique.mockResolvedValue(null)
    mocks.prisma.laborItem.createMany.mockImplementation(async ({ data }) => ({ count: data.length }))
    mocks.prisma.equipmentItem.findMany.mockResolvedValue([])
    mocks.prisma.equipmentItem.findUnique.mockResolvedValue(null)
    mocks.prisma.equipmentItem.createMany.mockImplementation(async ({ data }) => ({ count: data.length }))
  })

  it('parses decimal comma and latin thousands formats', () => {
    expect(parseDecimalInput('12,5')).toBe(12.5)
    expect(parseDecimalInput('1.234,56')).toBe(1234.56)
    expect(parseDecimalInput('1234,56')).toBe(1234.56)
    expect(parseDecimalInput('12')).toBe(12)
    expect(parseDecimalInput('12.5')).toBe(12.5)
  })

  it('rejects malformed decimal values', () => {
    expect(parseDecimalInput('abc')).toBeNull()
    expect(parseDecimalInput('12,,5')).toBeNull()
    expect(parseDecimalInput('12..5')).toBeNull()
  })

  it('parses boolean input variants for material categories', () => {
    expect(parseBooleanInput('Si')).toBe(true)
    expect(parseBooleanInput('SI')).toBe(true)
    expect(parseBooleanInput('true')).toBe(true)
    expect(parseBooleanInput('1')).toBe(true)
    expect(parseBooleanInput('No')).toBe(false)
    expect(parseBooleanInput('NO')).toBe(false)
    expect(parseBooleanInput('false')).toBe(false)
    expect(parseBooleanInput('0')).toBe(false)
  })

  it('generates MAT codes and assigns material categories by default when category columns are absent', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [
      [null, 'Cemento', 'saco', '1.234,56'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({
      Code: 'MAT-001',
      UnitPrice: 1234.56,
      UsesCategory1: true,
      UsesCategory2: false,
    })
    expect(preview[0].originalValues.UnitPrice).toBe('1.234,56')
  })

  it('normalizes material cpc and vae in 00.01 percent format', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo', 'cpc', 'vae'], [
      [null, 'Cemento', 'saco', 10, '00.01%', '12.50%'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Cpc: '0.0001', Vae: 0.125 })
  })

  it('normalizes material cpc and vae with decimal comma', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo', 'cpc', 'vae'], [
      [null, 'Pintura', 'gal', 15, '12,50%', '0,01'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Cpc: '0.125', Vae: 0.01 })
  })

  it('rejects invalid material cpc and vae values', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo', 'cpc', 'vae'], [
      [null, 'Arena', 'm3', 12, 'abc', 'texto'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toContain('CPC debe ser numerico, porcentaje valido o vacio')
    expect(preview[0].errors).toContain('VAE debe ser numerico, porcentaje valido o vacio')
  })

  it('reads legacy .xls material workbooks', async () => {
    const buffer = legacyXlsWorkbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [
      [null, 'Arena fina', 'm3', '12,50'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview).toHaveLength(1)
    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Code: 'MAT-001', Description: 'Arena fina', UnitPrice: 12.5 })
  })

  it('imports a valid labor preview row and generates MO code when empty', async () => {
    const buffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo'], [[null, 'Albanil', 'hora', 4.5]])

    const preview = await previewLaborFromBuffer(buffer)

    expect(preview).toHaveLength(1)
    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Code: 'MO-001', RoleName: 'Albanil', HourlyCost: 4.5 })
  })

  it('imports labor cpc and vae values', async () => {
    const buffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo', 'cpc', 'vae'], [
      [null, 'Peon', 'hora', 3.5, '1%', '12,50%'],
    ])

    const preview = await previewLaborFromBuffer(buffer)

    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Code: 'MO-001', Cpc: '0.01', Vae: 0.125 })
  })

  it('imports a valid equipment preview row and generates EQ code when empty', async () => {
    const buffer = await workbookBuffer('Equipos', ['codigo', 'descripcion', 'unidad', 'tarifa'], [[null, 'Concretera', 'hora', 8]])

    const preview = await previewEquipmentFromBuffer(buffer)

    expect(preview).toHaveLength(1)
    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Code: 'EQ-001', Description: 'Concretera', HourlyRate: 8 })
  })

  it('imports equipment cpc and vae values', async () => {
    const buffer = await workbookBuffer('Equipos', ['codigo', 'descripcion', 'unidad', 'tarifa', 'cpc', 'vae'], [
      [null, 'Bomba', 'hora', 5, '0,01', '0.01%'],
    ])

    const preview = await previewEquipmentFromBuffer(buffer)

    expect(preview[0].errors).toEqual([])
    expect(preview[0].data).toMatchObject({ Code: 'EQ-001', Cpc: '0.01', Vae: 0.0001 })
  })

  it('detects an equal existing material by code and omits it', async () => {
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001', description: 'Cemento', unit: 'saco', unitCost: decimalMock(10) },
    ])
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [
      ['MAT-001', 'Cemento', 'saco', '10,00'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0]).toMatchObject({ status: 'existing', errors: [], conflicts: [] })
    expect(preview[0].existingValues).toMatchObject({ Code: 'MAT-001', UnitPrice: 10 })
  })

  it('detects a material conflict by code when cost is different', async () => {
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001', description: 'Cemento Portland', unit: 'saco', unitCost: decimalMock('8.50') },
    ])
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [
      ['MAT-001', 'Cemento Portland', 'saco', '8,75'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].status).toBe('conflict')
    expect(preview[0].conflicts).toContainEqual({ field: 'costo', existing: 8.5, incoming: 8.75 })
  })

  it('detects duplicate material without code by normalized description and does not generate a new code', async () => {
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001', description: 'Cemento Portland', unit: 'saco', unitCost: decimalMock('8.50') },
    ])
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [
      [null, 'CEMENTO  PORTLAND', 'saco', '8,50'],
    ])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].status).toBe('existing')
    expect(preview[0].data.Code).toBe('MAT-001')
    expect(preview[0].data.Code).not.toBe('MAT-002')
  })

  it('detects an equal existing labor item by normalized role name', async () => {
    mocks.prisma.laborItem.findMany.mockResolvedValue([
      { id: 'lab-1', code: 'MO-001', roleName: 'Albanil especializado', hourlyCost: decimalMock('4.50') },
    ])
    const buffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo'], [
      [null, 'ALBANIL  ESPECIALIZADO', 'hora', '4,50'],
    ])

    const preview = await previewLaborFromBuffer(buffer)

    expect(preview[0].status).toBe('existing')
    expect(preview[0].data.Code).toBe('MO-001')
  })

  it('reports equipment conflicts without creating duplicates', async () => {
    mocks.prisma.equipmentItem.findMany.mockResolvedValue([
      { id: 'eq-1', code: 'EQ-001', description: 'Concretera', hourlyRate: decimalMock(8) },
    ])

    const result = await applyEquipmentImport([
      { rowNumber: 2, Code: 'EQ-001', Description: 'Concretera', Unit: 'hora', HourlyRate: 9 },
    ])

    expect(result).toEqual({ created: 0, updated: 0, omitted: 0, conflicts: 1, rejected: 0 })
    expect(mocks.prisma.equipmentItem.createMany).not.toHaveBeenCalled()
    expect(mocks.createEquipment).not.toHaveBeenCalled()
  })

  it('rejects invalid MO codes', async () => {
    const buffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo'], [['LAB-001', 'Peon', 'hora', 3]])

    const preview = await previewLaborFromBuffer(buffer)

    expect(preview[0].errors).toContain('Codigo debe tener formato MO-001')
  })

  it('rejects invalid MAT codes', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [['M-001', 'Cemento', 'saco', 10]])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toContain('Code debe tener formato MAT-001')
  })

  it('rejects invalid EQ codes', async () => {
    const buffer = await workbookBuffer('Equipos', ['codigo', 'descripcion', 'unidad', 'tarifa'], [['E-001', 'Bomba', 'hora', 5]])

    const preview = await previewEquipmentFromBuffer(buffer)

    expect(preview[0].errors).toContain('Codigo debe tener formato EQ-001')
  })

  it('rejects negative labor and equipment costs', async () => {
    const laborBuffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo'], [['MO-001', 'Peon', 'hora', -1]])
    const equipmentBuffer = await workbookBuffer('Equipos', ['codigo', 'descripcion', 'unidad', 'tarifa'], [['EQ-001', 'Bomba', 'hora', -2]])

    const laborPreview = await previewLaborFromBuffer(laborBuffer)
    const equipmentPreview = await previewEquipmentFromBuffer(equipmentBuffer)

    expect(laborPreview[0].errors).toContain('Costo debe ser >= 0')
    expect(equipmentPreview[0].errors).toContain('Tarifa debe ser >= 0')
  })

  it('rejects negative material costs', async () => {
    const buffer = await workbookBuffer('Materiales', ['codigo', 'descripcion', 'unidad', 'costo'], [['MAT-001', 'Cemento', 'saco', -5]])

    const preview = await previewMaterialsFromBuffer(buffer)

    expect(preview[0].errors).toContain('UnitPrice debe ser >= 0')
  })

  it('reports duplicate catalog codes inside the same file', async () => {
    const buffer = await workbookBuffer('Mano de obra', ['codigo', 'rol', 'unidad', 'costo'], [
      ['MO-001', 'Peon', 'hora', 3],
      ['MO-001', 'Maestro', 'hora', 8],
    ])

    const preview = await previewLaborFromBuffer(buffer)

    expect(preview[0].errors).toContain('Codigo duplicado en el archivo')
    expect(preview[1].errors).toContain('Codigo duplicado en el archivo')
  })

  it('applies a valid equipment row by creating it', async () => {
    await applyEquipmentImport([{ rowNumber: 2, Code: 'EQ-001', Description: 'Concretera', Unit: 'hora', HourlyRate: 8, Cpc: '0.01', Vae: 0.125 }])

    expect(mocks.prisma.equipmentItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          code: 'EQ-001',
          description: 'Concretera',
          hourlyRate: 8,
          cpc: '0.01',
          vae: 0.125,
          maintenanceRequired: false,
          isActive: true,
        }),
      ],
    })
    expect(mocks.createEquipment).not.toHaveBeenCalled()
  })

  it('applies a valid labor row by creating it', async () => {
    await applyLaborImport([{ rowNumber: 2, Code: 'MO-001', RoleName: 'Peon', Unit: 'hora', HourlyCost: 3.25, Cpc: '0.01', Vae: 0.125 }])

    expect(mocks.prisma.laborItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          code: 'MO-001',
          roleName: 'Peon',
          hourlyCost: 3.25,
          cpc: '0.01',
          vae: 0.125,
          isActive: true,
        }),
      ],
    })
    expect(mocks.createLabor).not.toHaveBeenCalled()
  })

  it('imports valid material rows and rejects invalid rows in partial apply', async () => {
    const result = await applyMaterialsImport([
      { rowNumber: 2, Code: 'MAT-001', Description: 'Cemento', Unit: 'saco', UnitPrice: 10 },
      { rowNumber: 3, Code: 'MAT-002', Description: 'Arena', Unit: 'm3', UnitPrice: -1 },
    ])

    expect(result).toEqual({ created: 1, updated: 0, omitted: 0, conflicts: 0, rejected: 1 })
    expect(mocks.prisma.material.createMany).toHaveBeenCalledTimes(1)
    expect(mocks.prisma.material.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ code: 'MAT-001', unitCost: 10, usesCategory1: true, usesCategory2: false })],
    })
    expect(mocks.createMaterial).not.toHaveBeenCalled()
  })

  it('inserts multiple new materials with one batch createMany call', async () => {
    const result = await applyMaterialsImport([
      { rowNumber: 2, Code: 'MAT-001', Description: 'Cemento', Unit: 'saco', UnitPrice: 10 },
      { rowNumber: 3, Code: 'MAT-002', Description: 'Arena', Unit: 'm3', UnitPrice: 12.25 },
      { rowNumber: 4, Code: 'MAT-003', Description: 'Ripio', Unit: 'm3', UnitPrice: 14 },
    ])

    expect(result).toEqual({ created: 3, updated: 0, omitted: 0, conflicts: 0, rejected: 0 })
    expect(mocks.prisma.material.createMany).toHaveBeenCalledTimes(1)
    expect(mocks.prisma.material.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ code: 'MAT-001', description: 'Cemento' }),
        expect.objectContaining({ code: 'MAT-002', description: 'Arena' }),
        expect.objectContaining({ code: 'MAT-003', description: 'Ripio' }),
      ],
    })
  })

  it('imports only new materials and omits equal existing rows', async () => {
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001', description: 'Cemento Portland', unit: 'saco', unitCost: decimalMock('8.50') },
    ])

    const result = await applyMaterialsImport([
      { rowNumber: 2, Code: null, Description: 'cemento portland', Unit: 'saco', UnitPrice: 8.5 },
      { rowNumber: 3, Code: null, Description: 'Arena fina', Unit: 'm3', UnitPrice: 12.25 },
    ])

    expect(result).toEqual({ created: 1, updated: 0, omitted: 1, conflicts: 0, rejected: 0 })
    expect(mocks.prisma.material.createMany).toHaveBeenCalledTimes(1)
    expect(mocks.prisma.material.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ code: 'MAT-002', description: 'Arena fina' })],
    })
    expect(mocks.createMaterial).not.toHaveBeenCalled()
  })

  it('reports material conflicts without duplicating records', async () => {
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001', description: 'Cemento Portland', unit: 'saco', unitCost: decimalMock('8.50') },
    ])

    const result = await applyMaterialsImport([
      { rowNumber: 2, Code: 'MAT-001', Description: 'Cemento Portland', Unit: 'saco', UnitPrice: 8.75 },
    ])

    expect(result).toEqual({ created: 0, updated: 0, omitted: 0, conflicts: 1, rejected: 0 })
    expect(mocks.prisma.material.createMany).not.toHaveBeenCalled()
    expect(mocks.createMaterial).not.toHaveBeenCalled()
  })

  it('uses materiales as template sheet and download filename', async () => {
    const buffer = await buildMaterialsTemplateBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    expect(workbook.worksheets[0].name).toBe('Materiales')
    expect(MATERIALS_TEMPLATE_FILE_NAME).toBe('materiales.xlsx')
    expect(sheetHeaders(workbook)).toEqual(['codigo', 'descripcion', 'unidad', 'costo', 'cpc', 'vae'])
  })

  it('uses mano_de_obra as labor template download filename', async () => {
    const buffer = await buildLaborTemplateBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    expect(workbook.worksheets[0].name).toBe('Mano de obra')
    expect(LABOR_TEMPLATE_FILE_NAME).toBe('mano_de_obra.xlsx')
    expect(sheetHeaders(workbook)).toEqual(['codigo', 'rol', 'unidad', 'costo', 'cpc', 'vae'])
  })

  it('uses equipos as equipment template download filename', async () => {
    const buffer = await buildEquipmentTemplateBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    expect(workbook.worksheets[0].name).toBe('Equipos')
    expect(EQUIPMENT_TEMPLATE_FILE_NAME).toBe('equipos.xlsx')
    expect(sheetHeaders(workbook)).toEqual(['codigo', 'descripcion', 'unidad', 'tarifa', 'cpc', 'vae'])
  })

  it('materials template route responds with xlsx attachment', async () => {
    const response = await getMaterialsTemplate()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toContain('materiales.xlsx')
    expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  })

  it('labor template route responds with xlsx attachment', async () => {
    const response = await getLaborTemplate()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toContain('mano_de_obra.xlsx')
    expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  })

  it('equipment template route responds with xlsx attachment', async () => {
    const response = await getEquipmentTemplate()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toContain('equipos.xlsx')
    expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  })
})
