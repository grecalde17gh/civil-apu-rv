import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createRubro: vi.fn(),
  copyRubro: vi.fn(),
  updateRubro: vi.fn(),
  getBudgetById: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/src/lib/db/rubros', () => ({
  createRubro: mocks.createRubro,
  copyRubro: mocks.copyRubro,
  updateRubro: mocks.updateRubro,
}))

vi.mock('@/src/lib/db/budgets', () => ({
  getBudgetById: mocks.getBudgetById,
}))

vi.mock('@/src/lib/db/rubroMaterials', () => ({
  addRubroMaterial: vi.fn(),
  deleteRubroMaterial: vi.fn(),
}))

vi.mock('@/src/lib/db/rubroLabor', () => ({
  addRubroLabor: vi.fn(),
  deleteRubroLabor: vi.fn(),
}))

vi.mock('@/src/lib/db/rubroEquipment', () => ({
  addRubroEquipment: vi.fn(),
  deleteRubroEquipment: vi.fn(),
}))

vi.mock('@/src/lib/db/rubroTransport', () => ({
  addRubroTransport: vi.fn(),
  deleteRubroTransport: vi.fn(),
}))

vi.mock('@/src/lib/validations/rubro', () => ({
  validateRubroInput: (data: Record<string, FormDataEntryValue>) => ({
    code: data.code,
    description: data.description,
    unit: data.unit,
    indirectPercentage: Number(data.indirectPercentage),
    status: data.status,
    calculationStatus: data.calculationStatus,
  }),
}))

vi.mock('@/src/lib/validations/rubroMaterial', () => ({
  validateRubroMaterialInput: vi.fn(),
}))

vi.mock('@/src/lib/validations/rubroLabor', () => ({
  validateRubroLaborInput: vi.fn(),
}))

vi.mock('@/src/lib/validations/rubroEquipment', () => ({
  validateRubroEquipmentInput: vi.fn(),
}))

vi.mock('@/src/lib/validations/rubroTransport', () => ({
  validateRubroTransportInput: vi.fn(),
}))

import { copyRubroAction, createRubroAction } from './actions'

describe('createRubroAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inherits the budget indirect percentage when a rubro is created from a budget context', async () => {
    mocks.getBudgetById.mockResolvedValue({
      id: 'budget-1',
      indirectPercentage: { toString: () => '25' },
    })
    mocks.createRubro.mockResolvedValue({ id: 'rubro-1' })

    const formData = new FormData()
    formData.set('code', 'R-001')
    formData.set('description', 'Rubro desde presupuesto')
    formData.set('unit', 'm2')
    formData.set('indirectPercentage', '')
    formData.set('status', 'DRAFT')
    formData.set('calculationStatus', 'PENDING')
    formData.set('budgetId', 'budget-1')

    await expect(createRubroAction(formData)).rejects.toThrow('REDIRECT:/rubros/rubro-1/edit?budgetId=budget-1')

    expect(mocks.createRubro).toHaveBeenCalledWith(
      expect.objectContaining({
        indirectPercentage: 25,
      }),
    )
  })

  it('keeps a manual indirect percentage typed in the rubro form', async () => {
    mocks.createRubro.mockResolvedValue({ id: 'rubro-2' })

    const formData = new FormData()
    formData.set('code', 'R-002')
    formData.set('description', 'Rubro con indirecto manual')
    formData.set('unit', 'm2')
    formData.set('indirectPercentage', '12')
    formData.set('status', 'DRAFT')
    formData.set('calculationStatus', 'PENDING')
    formData.set('budgetId', 'budget-1')

    await expect(createRubroAction(formData)).rejects.toThrow('REDIRECT:/rubros/rubro-2/edit?budgetId=budget-1')

    expect(mocks.getBudgetById).not.toHaveBeenCalled()
    expect(mocks.createRubro).toHaveBeenCalledWith(
      expect.objectContaining({
        indirectPercentage: 12,
      }),
    )
  })

  it('copies a rubro and redirects to the copied rubro editor', async () => {
    mocks.copyRubro.mockResolvedValue({ id: 'rubro-copy' })

    const formData = new FormData()
    formData.set('id', 'rubro-original')

    await expect(copyRubroAction(formData)).rejects.toThrow('REDIRECT:/rubros/rubro-copy/edit')

    expect(mocks.copyRubro).toHaveBeenCalledWith('rubro-original')
  })
})
