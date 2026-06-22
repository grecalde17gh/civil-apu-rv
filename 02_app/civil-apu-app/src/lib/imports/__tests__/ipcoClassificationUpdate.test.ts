import ExcelJS from 'exceljs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    material: {
      findMany: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
    laborItem: {
      findMany: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
    equipmentItem: {
      findMany: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
    ipcoDenomination: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../../db/prisma', () => ({
  prisma: mocks.prisma,
}))

import { updateIpcoClassificationsFromBuffer } from '../ipcoClassificationUpdate'

async function workbookBuffer(sheets: Record<string, Array<Array<string | number | null>>>) {
  const workbook = new ExcelJS.Workbook()

  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const sheet = workbook.addWorksheet(sheetName)
    rows.forEach((row) => sheet.addRow(row))
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}

describe('IPCO classification update import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.ipcoDenomination.findMany.mockResolvedValue([{ id: 'den-1', code: 'D1', name: 'Cemento y agregados' }])
    mocks.prisma.material.findMany.mockResolvedValue([
      { id: 'mat-1', code: 'MAT-001' },
      { id: 'mat-2', code: 'MAT-002' },
    ])
    mocks.prisma.laborItem.findMany.mockResolvedValue([{ id: 'lab-1', code: 'MO-001' }])
    mocks.prisma.equipmentItem.findMany.mockResolvedValue([{ id: 'eq-1', code: 'EQ-001' }])
    mocks.prisma.material.update.mockResolvedValue({})
    mocks.prisma.laborItem.update.mockResolvedValue({})
    mocks.prisma.equipmentItem.update.mockResolvedValue({})
  })

  it('updates only existing catalog records by code and reports skipped rows', async () => {
    const buffer = await workbookBuffer({
      Materiales: [
        ['codigo', 'denominacion_ipco', 'cpc', 'descripcion', 'costo', 'vae'],
        ['MAT-001', 'D1', '0.01', 'No debe cambiar', 99, 0.5],
        ['MAT-999', 'D1', '0.02', 'No existe', 20, 0.4],
        ['MAT-002', null, '0.03', 'Sin IPCO', 10, 0.3],
        [null, 'D1', '0.04', 'Sin codigo', 10, 0.2],
        ['MAT-001', 'D1', '0.05', 'Duplicado', 10, 0.1],
      ],
      'Mano de obra': [
        ['codigo', 'denominacion_ipco', 'cpc', 'rol', 'costo'],
        ['MO-001', 'Cemento y agregados', null, 'Peon', 4],
      ],
      Equipos: [
        ['codigo', 'denominacion_ipco', 'cpc', 'descripcion', 'tarifa'],
        ['EQ-001', 'No existe IPCO', '0.07', 'Equipo', 12],
      ],
    })

    const result = await updateIpcoClassificationsFromBuffer(buffer)

    expect(mocks.prisma.material.update).toHaveBeenCalledTimes(0)
    expect(mocks.prisma.laborItem.update).toHaveBeenCalledWith({
      where: { id: 'lab-1' },
      data: { denominationId: 'den-1' },
    })
    expect(mocks.prisma.equipmentItem.update).not.toHaveBeenCalled()
    expect(mocks.prisma.material.createMany).not.toHaveBeenCalled()
    expect(mocks.prisma.laborItem.createMany).not.toHaveBeenCalled()
    expect(mocks.prisma.equipmentItem.createMany).not.toHaveBeenCalled()

    expect(result.materials).toMatchObject({
      read: 5,
      updated: 0,
      notFound: 1,
      withoutIpco: 1,
    })
    expect(result.materials.errors).toEqual([
      { rowNumber: 2, code: 'MAT-001', message: 'Codigo duplicado en el archivo' },
      { rowNumber: 5, code: null, message: 'Codigo requerido para actualizar por codigo' },
      { rowNumber: 6, code: 'MAT-001', message: 'Codigo duplicado en el archivo' },
    ])
    expect(result.labor.updated).toBe(1)
    expect(result.equipment.errors).toEqual([
      { rowNumber: 2, code: 'EQ-001', message: 'Denominacion IPCO no encontrada' },
    ])
    expect(result.totals).toEqual({
      read: 7,
      updated: 1,
      notFound: 1,
      withoutIpco: 1,
      errors: 4,
    })
  })

  it('updates CPC only when the Excel row provides one', async () => {
    const buffer = await workbookBuffer({
      Materiales: [
        ['codigo', 'denominacion_ipco', 'cpc'],
        ['MAT-001', 'D1', '0.01'],
      ],
      'Mano de obra': [['codigo', 'denominacion_ipco', 'cpc']],
      Equipos: [['codigo', 'denominacion_ipco', 'cpc']],
    })

    const result = await updateIpcoClassificationsFromBuffer(buffer)

    expect(mocks.prisma.material.update).toHaveBeenCalledWith({
      where: { id: 'mat-1' },
      data: { denominationId: 'den-1', cpc: '0.01' },
    })
    expect(result.materials.updated).toBe(1)
  })
})
