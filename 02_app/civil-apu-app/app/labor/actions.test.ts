import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyLabor: vi.fn(),
  createLabor: vi.fn(),
  updateLabor: vi.fn(),
  toggleLaborActive: vi.fn(),
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
  validateLaborInput: vi.fn(),
}))

import { copyLaborAction } from './actions'

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
})
