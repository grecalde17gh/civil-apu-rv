import { describe, expect, it } from 'vitest'
import {
  assertRubroCanUseState,
  incompleteRubroMessage,
  isUsableRubroForBudget,
} from '../rubroCompletion'

describe('rubro completion validation', () => {
  it('allows draft rubros without direct cost', () => {
    expect(() =>
      assertRubroCanUseState({
        status: 'DRAFT',
        calculationStatus: 'PENDING',
        directCost: null,
      }),
    ).not.toThrow()
  })

  it('rejects validated rubros without direct cost', () => {
    expect(() =>
      assertRubroCanUseState({
        status: 'VALIDATED',
        calculationStatus: 'PENDING',
        directCost: '0',
      }),
    ).toThrow(incompleteRubroMessage)
  })

  it('marks rubros with positive direct cost as usable for budgets', () => {
    expect(isUsableRubroForBudget({ directCost: '10.25' })).toBe(true)
    expect(isUsableRubroForBudget({ directCost: '0' })).toBe(false)
  })
})
