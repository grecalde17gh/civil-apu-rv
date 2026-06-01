import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyEquipment: vi.fn(),
  createEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  toggleEquipmentActive: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/src/lib/db/equipment', () => ({
  copyEquipment: mocks.copyEquipment,
  createEquipment: mocks.createEquipment,
  updateEquipment: mocks.updateEquipment,
  toggleEquipmentActive: mocks.toggleEquipmentActive,
}))

vi.mock('@/src/lib/validations/equipment', () => ({
  validateEquipmentInput: vi.fn(),
}))

import { copyEquipmentAction } from './actions'

describe('copyEquipmentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('copies an equipment item and redirects to the copied equipment editor', async () => {
    mocks.copyEquipment.mockResolvedValue({ id: 'equipment-copy' })

    const formData = new FormData()
    formData.set('id', 'equipment-original')

    await expect(copyEquipmentAction(formData)).rejects.toThrow('REDIRECT:/equipment/equipment-copy/edit')

    expect(mocks.copyEquipment).toHaveBeenCalledWith('equipment-original')
  })
})
