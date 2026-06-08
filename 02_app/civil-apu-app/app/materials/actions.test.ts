import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyMaterial: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  toggleMaterialActive: vi.fn(),
  validateMaterialInput: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/src/lib/db/materials', () => ({
  copyMaterial: mocks.copyMaterial,
  createMaterial: mocks.createMaterial,
  updateMaterial: mocks.updateMaterial,
  toggleMaterialActive: mocks.toggleMaterialActive,
}))

vi.mock('@/src/lib/validations/material', () => ({
  validateMaterialInput: mocks.validateMaterialInput,
}))

import { copyMaterialAction, createMaterialAction, updateMaterialAction } from './actions'

const validMaterialPayload = {
  code: 'MAT-001',
  description: 'Cemento',
  unit: 'kg',
  price1: 1.25,
  price2: undefined,
  price3: undefined,
  cpc: '',
  vae: undefined,
  usesCategory1: false,
  usesCategory2: false,
  priceDate: undefined,
  isActive: true,
}

describe('copyMaterialAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('copies a material and redirects to the copied material editor', async () => {
    mocks.copyMaterial.mockResolvedValue({ id: 'material-copy' })

    const formData = new FormData()
    formData.set('id', 'material-original')

    await expect(copyMaterialAction(formData)).rejects.toThrow('REDIRECT:/materials/material-copy/edit')

    expect(mocks.copyMaterial).toHaveBeenCalledWith('material-original')
  })

  it('creates a material with no formula categories when both checkboxes are empty', async () => {
    mocks.validateMaterialInput.mockReturnValue(validMaterialPayload)

    const formData = new FormData()
    formData.set('code', 'MAT-001')
    formData.set('description', 'Cemento')
    formData.set('unit', 'kg')
    formData.set('price1', '1.25')
    formData.set('isActive', 'on')

    await expect(createMaterialAction(formData)).rejects.toThrow('REDIRECT:/materials')

    expect(mocks.validateMaterialInput).toHaveBeenCalledWith(
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
        isActive: true,
      }),
    )
    expect(mocks.createMaterial).toHaveBeenCalledWith(validMaterialPayload)
  })

  it('ignores obsolete formula category flags when creating a material', async () => {
    mocks.validateMaterialInput.mockReturnValue(validMaterialPayload)

    const formData = new FormData()
    formData.set('description', 'Acero')
    formData.set('unit', 'kg')
    formData.set('price1', '2.5')
    formData.set('usesCategory1', 'on')
    formData.set('usesCategory2', 'on')

    await expect(createMaterialAction(formData)).rejects.toThrow('REDIRECT:/materials')

    expect(mocks.validateMaterialInput).toHaveBeenCalledWith(
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
        isActive: false,
      }),
    )
    expect(mocks.createMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
      }),
    )
  })

  it('ignores obsolete formula category 1 flag when updating a material', async () => {
    mocks.validateMaterialInput.mockReturnValue(validMaterialPayload)

    const formData = new FormData()
    formData.set('id', 'material-1')
    formData.set('description', 'Cemento gris')
    formData.set('unit', 'kg')
    formData.set('price1', '1.4')
    formData.set('usesCategory1', 'on')

    await expect(updateMaterialAction(formData)).rejects.toThrow('REDIRECT:/materials')

    expect(mocks.validateMaterialInput).toHaveBeenCalledWith(
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
        isActive: false,
      }),
    )
    expect(mocks.updateMaterial).toHaveBeenCalledWith(
      'material-1',
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
      }),
    )
  })

  it('ignores obsolete formula category 2 flag when updating a material', async () => {
    mocks.validateMaterialInput.mockReturnValue(validMaterialPayload)

    const formData = new FormData()
    formData.set('id', 'material-2')
    formData.set('description', 'Arena')
    formData.set('unit', 'm3')
    formData.set('price1', '12')
    formData.set('usesCategory2', 'on')

    await expect(updateMaterialAction(formData)).rejects.toThrow('REDIRECT:/materials')

    expect(mocks.validateMaterialInput).toHaveBeenCalledWith(
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
      }),
    )
    expect(mocks.updateMaterial).toHaveBeenCalledWith(
      'material-2',
      expect.objectContaining({
        usesCategory1: false,
        usesCategory2: false,
      }),
    )
  })
})
