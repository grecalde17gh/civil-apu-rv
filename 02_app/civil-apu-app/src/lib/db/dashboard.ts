import { prisma } from './prisma'

export async function getDashboardSummary() {
  const [
    materialsCount,
    laborCount,
    equipmentCount,
    rubrosCount,
    projectsCount,
    budgetsCount,
    recentProjects,
    recentBudgets,
  ] = await Promise.all([
    prisma.material.count(),
    prisma.laborItem.count(),
    prisma.equipmentItem.count(),
    prisma.rubro.count(),
    prisma.project.count(),
    prisma.budget.count(),
    prisma.project.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { budgets: true },
        },
      },
    }),
    prisma.budget.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      include: {
        project: true,
        _count: {
          select: { items: true },
        },
      },
    }),
  ])

  return {
    counts: {
      materials: materialsCount,
      labor: laborCount,
      equipment: equipmentCount,
      rubros: rubrosCount,
      projects: projectsCount,
      budgets: budgetsCount,
    },
    recentProjects,
    recentBudgets,
  }
}
