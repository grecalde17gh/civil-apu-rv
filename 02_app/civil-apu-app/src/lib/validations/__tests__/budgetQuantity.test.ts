import { describe, expect, it } from 'vitest'
import { validateBudgetItemQuantityInput } from '../budget'

describe('budget item quantity validation', () => {
  it('accepts decimal comma for budget item quantity', () => {
    expect(
      validateBudgetItemQuantityInput({
        budgetId: 'budget-1',
        budgetItemId: 'item-1',
        projectId: 'project-1',
        quantity: '2,5',
      }),
    ).toMatchObject({ quantity: 2.5 })
  })

  it('rejects zero quantity', () => {
    expect(() =>
      validateBudgetItemQuantityInput({
        budgetId: 'budget-1',
        budgetItemId: 'item-1',
        quantity: '0',
      }),
    ).toThrow()
  })
})
