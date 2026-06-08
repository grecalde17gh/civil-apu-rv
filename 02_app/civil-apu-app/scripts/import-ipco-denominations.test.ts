import os from 'node:os'
import path from 'node:path'
import { mkdtempSync, rmSync } from 'node:fs'
import * as XLSX from 'xlsx'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    ipcoDenomination: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}))

vi.mock('../src/lib/db/prisma', () => ({
  prisma: mocks.prisma,
}))

import { importIpcoDenominationsFromWorkbook } from './import-ipco-denominations'

function createWorkbook(rows: unknown[][]) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'ipco-denominations-'))
  const filePath = path.join(dir, 'Denominaciones_IPCO.xlsx')
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Lista_Denominaciones')
  XLSX.writeFile(workbook, filePath)
  return { dir, filePath }
}

describe('importIpcoDenominationsFromWorkbook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.ipcoDenomination.findMany.mockResolvedValue([])
    mocks.prisma.ipcoDenomination.createMany.mockImplementation(async ({ data }) => ({ count: data.length }))
  })

  it('imports unique denominations and omits duplicates', async () => {
    const { dir, filePath } = createWorkbook([
      ['Denominacion'],
      ['Cemento Portland'],
      ['Acero en barras'],
      [' cemento  portland '],
    ])

    try {
      const result = await importIpcoDenominationsFromWorkbook(filePath)

      expect(result).toEqual({ read: 3, imported: 2, omitted: 1, errors: 0 })
      expect(mocks.prisma.ipcoDenomination.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ name: 'Cemento Portland', source: 'Denominaciones_IPCO.xlsx' }),
          expect.objectContaining({ name: 'Acero en barras', source: 'Denominaciones_IPCO.xlsx' }),
        ],
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('can be rerun without duplicating existing denominations', async () => {
    mocks.prisma.ipcoDenomination.findMany.mockResolvedValue([{ name: 'Cemento Portland', code: null }])
    const { dir, filePath } = createWorkbook([
      ['Denominacion'],
      ['Cemento Portland'],
      ['Arena fina'],
    ])

    try {
      const result = await importIpcoDenominationsFromWorkbook(filePath)

      expect(result).toEqual({ read: 2, imported: 1, omitted: 1, errors: 0 })
      expect(mocks.prisma.ipcoDenomination.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ name: 'Arena fina' })],
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

