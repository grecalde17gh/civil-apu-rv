import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env')

  try {
    const envFile = readFileSync(envPath, 'utf8')

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const rawValue = trimmed.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^["']|["']$/g, '')

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // The script can still run when DATABASE_URL is already provided.
  }
}

function assertResetIsConfirmed() {
  console.warn('Esto eliminará datos de prueba del entorno actual.')
  console.warn('No se borrará estructura de base de datos, migraciones ni schema.prisma.')

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reset bloqueado: no se permite ejecutar este script con NODE_ENV=production.')
  }

  if (process.env.CONFIRM_RESET !== 'true') {
    throw new Error('Reset bloqueado: ejecuta con CONFIRM_RESET=true para confirmar la limpieza.')
  }
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable required to initialize Prisma Client.')
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  })

  return new PrismaClient({ adapter })
}

async function main() {
  loadEnvFile()
  assertResetIsConfirmed()

  const prisma = createPrismaClient()

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      await tx.calculationSetting.updateMany({
        where: { projectId: { not: null } },
        data: { projectId: null },
      })

      const changeLogs = await tx.changeLog.deleteMany()
      const importLogs = await tx.importLog.deleteMany()
      const budgetItems = await tx.budgetItem.deleteMany()
      const budgets = await tx.budget.deleteMany()
      const rubroMaterials = await tx.rubroMaterial.deleteMany()
      const rubroLabor = await tx.rubroLabor.deleteMany()
      const rubroEquipment = await tx.rubroEquipment.deleteMany()
      const rubroTransport = await tx.rubroTransport.deleteMany()
      const projects = await tx.project.deleteMany()
      const rubros = await tx.rubro.deleteMany()
      const materials = await tx.material.deleteMany()
      const laborItems = await tx.laborItem.deleteMany()
      const equipmentItems = await tx.equipmentItem.deleteMany()
      const materialCategories = await tx.materialCategory.deleteMany()

      return {
        changeLogs: changeLogs.count,
        importLogs: importLogs.count,
        budgetItems: budgetItems.count,
        budgets: budgets.count,
        rubroMaterials: rubroMaterials.count,
        rubroLabor: rubroLabor.count,
        rubroEquipment: rubroEquipment.count,
        rubroTransport: rubroTransport.count,
        projects: projects.count,
        rubros: rubros.count,
        materials: materials.count,
        laborItems: laborItems.count,
        equipmentItems: equipmentItems.count,
        materialCategories: materialCategories.count,
      }
    })

    console.log('Reset de datos de desarrollo completado.')
    console.table(deleted)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
