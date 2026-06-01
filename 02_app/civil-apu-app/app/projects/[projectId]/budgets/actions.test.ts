import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createBudget: vi.fn(),
  copyBudget: vi.fn(),
  updateBudget: vi.fn(),
  createBudgetItem: vi.fn(),
  recalculateBudgetTotals: vi.fn(),
  getBudgetItemsByBudgetId: vi.fn(),
  deleteBudgetItem: vi.fn(),
  getBudgetByIdWithProject: vi.fn(),
  getProjectById: vi.fn(),
  getRubroById: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/src/lib/db/budgets', () => ({
  createBudget: mocks.createBudget,
  copyBudget: mocks.copyBudget,
  updateBudget: mocks.updateBudget,
  createBudgetItem: mocks.createBudgetItem,
  recalculateBudgetTotals: mocks.recalculateBudgetTotals,
  getBudgetItemsByBudgetId: mocks.getBudgetItemsByBudgetId,
  deleteBudgetItem: mocks.deleteBudgetItem,
  getBudgetByIdWithProject: mocks.getBudgetByIdWithProject,
}))

vi.mock('@/src/lib/db/projects', () => ({
  getProjectById: mocks.getProjectById,
}))

vi.mock('@/src/lib/db/rubros', () => ({
  getRubroById: mocks.getRubroById,
}))

vi.mock('@/src/lib/validations/budget', () => ({
  validateBudgetInput: vi.fn(),
  validateBudgetItemInput: (data: Record<string, FormDataEntryValue>) => ({
    rubroId: data.rubroId,
    quantity: Number(data.quantity),
  }),
}))

vi.mock('@/src/lib/calculations/budget', () => ({
  calculateBudgetItemSnapshots: ({
    quantity,
    directCost,
    indirectPercentage,
  }: {
    quantity: number
    directCost: number
    indirectPercentage: number
  }) => {
    const indirectCostSnapshot = directCost * (indirectPercentage / 100)
    const unitPriceSnapshot = directCost + indirectCostSnapshot
    const subtotalSnapshot = quantity * unitPriceSnapshot

    return {
      indirectPercentageApplied: indirectPercentage,
      directCostSnapshot: directCost,
      indirectCostSnapshot,
      unitPriceSnapshot,
      subtotalSnapshot,
      totalPrice: subtotalSnapshot,
    }
  },
}))

import { addBudgetItemAction, copyBudgetAction } from './actions'

describe('addBudgetItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the budget indirect percentage for an existing rubro without changing the rubro master value', async () => {
    mocks.getBudgetByIdWithProject.mockResolvedValue({
      id: 'budget-test1',
      indirectPercentage: { toString: () => '20' },
      project: {
        defaultIndirectPercentage: { toString: () => '18' },
      },
    })
    mocks.getRubroById.mockResolvedValue({
      id: 'rubro-hormigon',
      code: 'H-001',
      description: 'Hormigon simple',
      unit: 'm3',
      directCost: { toString: () => '100' },
      indirectPercentage: { toString: () => '25' },
    })
    mocks.getBudgetItemsByBudgetId.mockResolvedValue([])

    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('projectId', 'project-franklin')
    formData.set('rubroId', 'rubro-hormigon')
    formData.set('quantity', '2')

    await expect(addBudgetItemAction(formData)).rejects.toThrow('REDIRECT:/projects/project-franklin/budgets/budget-test1/edit')

    expect(mocks.createBudgetItem).toHaveBeenCalledWith(
      expect.objectContaining({
        rubroId: 'rubro-hormigon',
        indirectPercentageApplied: 20,
        directCostSnapshot: 100,
        indirectCostSnapshot: 20,
        unitPriceSnapshot: 120,
        subtotalSnapshot: 240,
        totalPrice: 240,
      }),
    )
  })

  it('copies a budget and redirects to the copied budget editor', async () => {
    mocks.copyBudget.mockResolvedValue({ id: 'budget-copy' })

    const formData = new FormData()
    formData.set('budgetId', 'budget-original')
    formData.set('projectId', 'project-franklin')

    await expect(copyBudgetAction(formData)).rejects.toThrow('REDIRECT:/projects/project-franklin/budgets/budget-copy/edit')

    expect(mocks.copyBudget).toHaveBeenCalledWith('budget-original')
  })
})
