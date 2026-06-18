import { describe, expect, it } from 'vitest'
import {
  buildScheduleRowValues,
  calculateScheduleSummary,
  calculateWeeklyScheduleAmount,
  normalizeScheduleRange,
} from '../budgetSchedule'

describe('budget schedule calculations', () => {
  it('normalizes ranges as a single consecutive selection', () => {
    expect(normalizeScheduleRange({ startWeek: 4, endWeek: 2 }, 8)).toEqual({ startWeek: 2, endWeek: 4 })
    expect(normalizeScheduleRange({ startWeek: 2, endWeek: 9 }, 8)).toEqual({ startWeek: null, endWeek: null })
  })

  it('splits the row total equally across selected weeks', () => {
    const range = { startWeek: 2, endWeek: 4 }

    expect(calculateWeeklyScheduleAmount(900, range)).toBe(300)
    expect(buildScheduleRowValues({ weekCount: 5, totalAmount: 900, startWeek: 2, endWeek: 4 })).toEqual([
      0,
      300,
      300,
      300,
      0,
    ])
  })

  it('calculates partial and accumulated investment rows', () => {
    const summary = calculateScheduleSummary([
      [100, 100, 0],
      [0, 50, 50],
    ])

    expect(summary.weeklyPartial).toEqual([100, 150, 50])
    expect(summary.weeklyPartialPercent).toEqual([33.33, 50, 16.67])
    expect(summary.accumulated).toEqual([100, 250, 300])
    expect(summary.accumulatedPercent).toEqual([33.33, 83.33, 100])
    expect(summary.totalDistributed).toBe(300)
  })
})
