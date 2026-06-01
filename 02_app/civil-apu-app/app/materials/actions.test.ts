import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyMaterial: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  toggleMaterialActive: vi.fn(),
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
  validateMaterialInput: vi.fn(),
}))

import { copyMaterialAction } from './actions'

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
})
