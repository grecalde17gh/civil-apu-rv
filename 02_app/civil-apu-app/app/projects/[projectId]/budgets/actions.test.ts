import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createBudget: vi.fn(),
  copyBudget: vi.fn(),
  updateBudget: vi.fn(),
  createBudgetItem: vi.fn(),
  recalculateBudgetTotals: vi.fn(),
  getBudgetItemsByBudgetId: vi.fn(),
  deleteBudgetItem: vi.fn(),
  updateBudgetItemQuantity: vi.fn(),
  getBudgetByIdWithProject: vi.fn(),
  getProjectById: vi.fn(),
  getRubroById: vi.fn(),
  updateBudgetSchedule: vi.fn(),
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
  updateBudgetItemQuantity: mocks.updateBudgetItemQuantity,
  getBudgetByIdWithProject: mocks.getBudgetByIdWithProject,
}))

vi.mock('@/src/lib/db/projects', () => ({
  getProjectById: mocks.getProjectById,
}))

vi.mock('@/src/lib/db/rubros', () => ({
  getRubroById: mocks.getRubroById,
}))

vi.mock('@/src/lib/db/budgetSchedule', () => ({
  updateBudgetSchedule: mocks.updateBudgetSchedule,
}))

vi.mock('@/src/lib/validations/budget', () => ({
  validateBudgetInput: vi.fn(),
  validateBudgetItemInput: (data: Record<string, FormDataEntryValue>) => ({
    rubroId: data.rubroId,
    quantity: Number(data.quantity),
  }),
  validateBudgetItemQuantityInput: (data: Record<string, FormDataEntryValue>) => ({
    budgetId: String(data.budgetId),
    budgetItemId: String(data.budgetItemId),
    projectId: data.projectId ? String(data.projectId) : undefined,
    quantity: Number(String(data.quantity).replace(',', '.')),
  }),
}))

vi.mock('@/src/lib/validations/budgetSchedule', () => ({
  validateBudgetScheduleInput: (data: {
    weekCount: FormDataEntryValue | null
    entries: Array<{
      budgetItemId: string
      groupName: string
      startWeek: number | null
      endWeek: number | null
    }>
  }) => ({
    weekCount: Number(data.weekCount),
    entries: data.entries,
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

vi.mock('@/src/lib/validations/rubroCompletion', () => ({
  incompleteRubroMessage:
    'El rubro debe tener al menos un componente con costo mayor a cero antes de guardarse o usarse en un presupuesto.',
  isUsableRubroForBudget: (rubro: { directCost: { toString(): string } | null }) =>
    Number(rubro.directCost?.toString() ?? '0') > 0,
}))

import { addBudgetItemAction, addBudgetItemFormAction, addBudgetItemsFormAction, copyBudgetAction, updateBudgetItemQuantityAction, updateBudgetScheduleAction } from './actions'

describe('addBudgetItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getBudgetItemsByBudgetId.mockResolvedValue([])
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

  it('does not add a rubro without positive direct cost to a budget', async () => {
    mocks.getBudgetByIdWithProject.mockResolvedValue({
      id: 'budget-test1',
      indirectPercentage: { toString: () => '20' },
      project: {
        defaultIndirectPercentage: { toString: () => '18' },
      },
    })
    mocks.getRubroById.mockResolvedValue({
      id: 'rubro-incompleto',
      code: 'R-000',
      description: 'Rubro incompleto',
      unit: 'u',
      directCost: { toString: () => '0' },
      indirectPercentage: { toString: () => '20' },
    })

    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('projectId', 'project-franklin')
    formData.set('rubroId', 'rubro-incompleto')
    formData.set('quantity', '1')

    await expect(addBudgetItemAction(formData)).rejects.toThrow(
      'El rubro debe tener al menos un componente con costo mayor a cero',
    )
    expect(mocks.createBudgetItem).not.toHaveBeenCalled()
  })

  it('does not add the same rubro twice to a budget', async () => {
    mocks.getBudgetByIdWithProject.mockResolvedValue({
      id: 'budget-test1',
      indirectPercentage: { toString: () => '20' },
      project: {
        defaultIndirectPercentage: { toString: () => '18' },
      },
    })
    mocks.getBudgetItemsByBudgetId.mockResolvedValue([{ rubroId: 'rubro-hormigon' }])

    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('projectId', 'project-franklin')
    formData.set('rubroId', 'rubro-hormigon')
    formData.set('quantity', '1')

    await expect(addBudgetItemAction(formData)).rejects.toThrow('El rubro ya pertenece a este presupuesto.')
    expect(mocks.createBudgetItem).not.toHaveBeenCalled()
  })

  it('adds multiple selected rubros and skips rubros already in the budget', async () => {
    mocks.getBudgetByIdWithProject.mockResolvedValue({
      id: 'budget-test1',
      indirectPercentage: { toString: () => '20' },
      project: {
        defaultIndirectPercentage: { toString: () => '18' },
      },
    })
    mocks.getBudgetItemsByBudgetId.mockResolvedValue([{ rubroId: 'rubro-existente' }])
    mocks.getRubroById
      .mockResolvedValueOnce({
        id: 'rubro-hormigon',
        code: 'H-001',
        description: 'Hormigon simple',
        unit: 'm3',
        directCost: { toString: () => '100' },
        indirectPercentage: { toString: () => '25' },
      })
      .mockResolvedValueOnce({
        id: 'rubro-acero',
        code: 'A-001',
        description: 'Acero',
        unit: 'kg',
        directCost: { toString: () => '10' },
        indirectPercentage: { toString: () => '25' },
      })

    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('projectId', 'project-franklin')
    formData.set('quantity', '1')
    formData.append('rubroIds', 'rubro-existente')
    formData.append('rubroIds', 'rubro-hormigon')
    formData.append('rubroIds', 'rubro-acero')

    await expect(addBudgetItemsFormAction({ ok: true, message: null }, formData)).rejects.toThrow('REDIRECT:/projects/project-franklin/budgets/budget-test1/edit')

    expect(mocks.createBudgetItem).toHaveBeenCalledTimes(2)
    expect(mocks.createBudgetItem).toHaveBeenNthCalledWith(1, expect.objectContaining({ rubroId: 'rubro-hormigon', itemNumber: '2' }))
    expect(mocks.createBudgetItem).toHaveBeenNthCalledWith(2, expect.objectContaining({ rubroId: 'rubro-acero', itemNumber: '3' }))
  })

  it('returns a UI-safe message when an incomplete rubro is submitted from the form', async () => {
    mocks.getBudgetByIdWithProject.mockResolvedValue({
      id: 'budget-test1',
      indirectPercentage: { toString: () => '20' },
      project: {
        defaultIndirectPercentage: { toString: () => '18' },
      },
    })
    mocks.getRubroById.mockResolvedValue({
      id: 'rubro-incompleto',
      code: 'R-000',
      description: 'Rubro incompleto',
      unit: 'u',
      directCost: null,
      indirectPercentage: { toString: () => '20' },
    })

    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('projectId', 'project-franklin')
    formData.set('rubroId', 'rubro-incompleto')
    formData.set('quantity', '1')

    const result = await addBudgetItemFormAction({ ok: true, message: null }, formData)

    expect(result.ok).toBe(false)
    expect(result.message).toContain('El rubro debe tener al menos un componente')
    expect(mocks.createBudgetItem).not.toHaveBeenCalled()
  })

  it('copies a budget and redirects to the copied budget editor', async () => {
    mocks.copyBudget.mockResolvedValue({ id: 'budget-copy' })

    const formData = new FormData()
    formData.set('budgetId', 'budget-original')
    formData.set('projectId', 'project-franklin')

    await expect(copyBudgetAction(formData)).rejects.toThrow('REDIRECT:/projects/project-franklin/budgets/budget-copy/edit')

    expect(mocks.copyBudget).toHaveBeenCalledWith('budget-original')
  })

  it('updates a budget item quantity without touching the rubro master', async () => {
    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('budgetItemId', 'budget-item-1')
    formData.set('projectId', 'project-franklin')
    formData.set('quantity', '2,5')

    await expect(updateBudgetItemQuantityAction(formData)).rejects.toThrow('REDIRECT:/projects/project-franklin/budgets/budget-test1/edit')

    expect(mocks.updateBudgetItemQuantity).toHaveBeenCalledWith({
      budgetId: 'budget-test1',
      budgetItemId: 'budget-item-1',
      projectId: 'project-franklin',
      quantity: 2.5,
    })
    expect(mocks.getRubroById).not.toHaveBeenCalled()
  })

  it('updates a budget schedule from serialized entries', async () => {
    const formData = new FormData()
    formData.set('budgetId', 'budget-test1')
    formData.set('weekCount', '8')
    formData.set(
      'entries',
      JSON.stringify([
        {
          budgetItemId: 'budget-item-1',
          groupName: 'PRELIMINARES',
          startWeek: 2,
          endWeek: 4,
        },
      ]),
    )

    const result = await updateBudgetScheduleAction({ ok: true, message: null }, formData)

    expect(result.ok).toBe(true)
    expect(mocks.updateBudgetSchedule).toHaveBeenCalledWith({
      budgetId: 'budget-test1',
      weekCount: 8,
      entries: [
        {
          budgetItemId: 'budget-item-1',
          groupName: 'PRELIMINARES',
          startWeek: 2,
          endWeek: 4,
        },
      ],
    })
  })
})
