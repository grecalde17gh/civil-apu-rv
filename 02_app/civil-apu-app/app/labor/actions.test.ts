import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyLabor: vi.fn(),
  createLabor: vi.fn(),
  updateLabor: vi.fn(),
  toggleLaborActive: vi.fn(),
  validateLaborInput: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/src/lib/db/labor', () => ({
  copyLabor: mocks.copyLabor,
  createLabor: mocks.createLabor,
  updateLabor: mocks.updateLabor,
  toggleLaborActive: mocks.toggleLaborActive,
}))

vi.mock('@/src/lib/validations/labor', () => ({
  validateLaborInput: mocks.validateLaborInput,
}))

import { copyLaborAction, createLaborAction, updateLaborAction } from './actions'

const validLaborPayload = {
  code: 'MO-001',
  roleName: 'Albanil',
  hourlyCost: 4.5,
  dailyCost: undefined,
  cpc: '',
  vae: undefined,
  category: '',
  priceDate: undefined,
  isActive: true,
}

describe('copyLaborAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('copies a labor item and redirects to the copied labor editor', async () => {
    mocks.copyLabor.mockResolvedValue({ id: 'labor-copy' })

    const formData = new FormData()
    formData.set('id', 'labor-original')

    await expect(copyLaborAction(formData)).rejects.toThrow('REDIRECT:/labor/labor-copy/edit')

    expect(mocks.copyLabor).toHaveBeenCalledWith('labor-original')
  })

  it('creates a labor item without competencies or availability', async () => {
    mocks.validateLaborInput.mockReturnValue(validLaborPayload)

    const formData = new FormData()
    formData.set('code', 'MO-001')
    formData.set('roleName', 'Albanil')
    formData.set('hourlyCost', '4.5')
    formData.set('isActive', 'on')

    await expect(createLaborAction(formData)).rejects.toThrow('REDIRECT:/labor')

    expect(mocks.validateLaborInput).toHaveBeenCalledWith(
      expect.not.objectContaining({
        competencies: expect.anything(),
        availability: expect.anything(),
      }),
    )
    expect(mocks.createLabor).toHaveBeenCalledWith(validLaborPayload)
  })

  it('updates a labor item without competencies or availability', async () => {
    mocks.validateLaborInput.mockReturnValue({
      ...validLaborPayload,
      roleName: 'Maestro mayor',
    })

    const formData = new FormData()
    formData.set('id', 'labor-1')
    formData.set('roleName', 'Maestro mayor')
    formData.set('hourlyCost', '6')

    await expect(updateLaborAction(formData)).rejects.toThrow('REDIRECT:/labor')

    expect(mocks.validateLaborInput).toHaveBeenCalledWith(
      expect.not.objectContaining({
        competencies: expect.anything(),
        availability: expect.anything(),
      }),
    )
    expect(mocks.updateLabor).toHaveBeenCalledWith(
      'labor-1',
      expect.not.objectContaining({
        competencies: expect.anything(),
        availability: expect.anything(),
      }),
    )
  })
})
