import path from 'node:path'
import 'dotenv/config'
import * as XLSX from 'xlsx'

type ImportSummary = {
  read: number
  imported: number
  omitted: number
  errors: number
}

function cleanText(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text === '' ? null : text
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function findColumn(headers: unknown[], candidates: string[]): number {
  const normalizedCandidates = candidates.map(normalize)
  return headers.findIndex((header) => normalizedCandidates.includes(normalize(String(header ?? ''))))
}

export async function importIpcoDenominationsFromWorkbook(filePath: string): Promise<ImportSummary> {
  const { prisma } = await getPrisma()
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('El archivo no contiene hojas')
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, blankrows: false })
  const [headers = [], ...dataRows] = rows
  const nameIndex = findColumn(headers, ['denominacion', 'denominación', 'name', 'description'])
  const codeIndex = findColumn(headers, ['codigo', 'código', 'code'])

  if (nameIndex === -1) {
    throw new Error('No se encontro columna de denominacion')
  }

  const existing = await prisma.ipcoDenomination.findMany({ select: { name: true, code: true } })
  const existingNames = new Set(existing.map((item) => normalize(item.name)))
  const existingCodes = new Set(existing.map((item) => cleanText(item.code)).filter(Boolean).map((code) => code!.toUpperCase()))
  const seenNames = new Set<string>()
  const seenCodes = new Set<string>()
  const createRows: Array<{ code?: string; name: string; source: string }> = []
  const summary: ImportSummary = { read: 0, imported: 0, omitted: 0, errors: 0 }

  for (const row of dataRows) {
    summary.read += 1
    const name = cleanText(row[nameIndex])
    const code = codeIndex >= 0 ? cleanText(row[codeIndex]) : null

    if (!name) {
      summary.errors += 1
      continue
    }

    const normalizedName = normalize(name)
    const normalizedCode = code?.toUpperCase()

    if (
      existingNames.has(normalizedName) ||
      seenNames.has(normalizedName) ||
      (normalizedCode && (existingCodes.has(normalizedCode) || seenCodes.has(normalizedCode)))
    ) {
      summary.omitted += 1
      continue
    }

    seenNames.add(normalizedName)
    if (normalizedCode) seenCodes.add(normalizedCode)
    createRows.push({ code: code ?? undefined, name, source: path.basename(filePath) })
  }

  if (createRows.length > 0) {
    summary.imported = (await prisma.ipcoDenomination.createMany({ data: createRows })).count
  }

  return summary
}

async function main() {
  const filePath = path.resolve(process.cwd(), '..', '..', '01_excel_base', 'Denominaciones_IPCO.xlsx')
  const summary = await importIpcoDenominationsFromWorkbook(filePath)

  console.log(`Leidas: ${summary.read}`)
  console.log(`Importadas: ${summary.imported}`)
  console.log(`Omitidas por duplicado: ${summary.omitted}`)
  console.log(`Errores: ${summary.errors}`)
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
    .finally(async () => {
      const { prisma } = await getPrisma()
      await prisma.$disconnect()
    })
}

async function getPrisma() {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? process.env.DIRECT_URL
  return import('../src/lib/db/prisma')
}
