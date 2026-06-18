import { assertNonNegative, assertPositive, roundCurrency } from './validation'

export const DEFAULT_SCHEDULE_WEEK_COUNT = 8
export const MAX_SCHEDULE_WEEK_COUNT = 52

export type ScheduleRange = {
  startWeek: number | null
  endWeek: number | null
}

export type ScheduleSummary = {
  weeklyPartial: number[]
  weeklyPartialPercent: number[]
  accumulated: number[]
  accumulatedPercent: number[]
  totalDistributed: number
}

export function clampScheduleWeekCount(value: number): number {
  assertPositive(value, 'weekCount')

  if (!Number.isInteger(value)) {
    throw new Error('weekCount must be an integer')
  }

  if (value > MAX_SCHEDULE_WEEK_COUNT) {
    throw new Error(`weekCount must be ${MAX_SCHEDULE_WEEK_COUNT} or less`)
  }

  return value
}

export function normalizeScheduleRange(range: ScheduleRange, weekCount: number): ScheduleRange {
  clampScheduleWeekCount(weekCount)

  if (range.startWeek === null || range.endWeek === null) {
    return { startWeek: null, endWeek: null }
  }

  const startWeek = Math.min(range.startWeek, range.endWeek)
  const endWeek = Math.max(range.startWeek, range.endWeek)

  if (!Number.isInteger(startWeek) || !Number.isInteger(endWeek)) {
    return { startWeek: null, endWeek: null }
  }

  if (startWeek < 1 || endWeek > weekCount) {
    return { startWeek: null, endWeek: null }
  }

  return { startWeek, endWeek }
}

export function getSelectedWeekCount(range: ScheduleRange): number {
  if (range.startWeek === null || range.endWeek === null) return 0
  return range.endWeek - range.startWeek + 1
}

export function calculateWeeklyScheduleAmount(totalAmount: number, range: ScheduleRange): number {
  assertNonNegative(totalAmount, 'totalAmount')

  const selectedWeekCount = getSelectedWeekCount(range)
  if (selectedWeekCount === 0 || totalAmount === 0) return 0

  return roundCurrency(totalAmount / selectedWeekCount)
}

export function buildScheduleRowValues(params: {
  weekCount: number
  totalAmount: number
  startWeek: number | null
  endWeek: number | null
}): number[] {
  const range = normalizeScheduleRange(
    {
      startWeek: params.startWeek,
      endWeek: params.endWeek,
    },
    params.weekCount,
  )
  const weeklyAmount = calculateWeeklyScheduleAmount(params.totalAmount, range)

  return Array.from({ length: params.weekCount }, (_, index) => {
    const week = index + 1
    return range.startWeek !== null && range.endWeek !== null && week >= range.startWeek && week <= range.endWeek
      ? weeklyAmount
      : 0
  })
}

export function calculateScheduleSummary(rows: number[][]): ScheduleSummary {
  const weekCount = Math.max(0, ...rows.map((row) => row.length))
  const weeklyPartial = Array.from({ length: weekCount }, (_, index) =>
    roundCurrency(rows.reduce((sum, row) => sum + (row[index] ?? 0), 0)),
  )
  const totalDistributed = roundCurrency(weeklyPartial.reduce((sum, value) => sum + value, 0))
  const weeklyPartialPercent = weeklyPartial.map((value) =>
    totalDistributed > 0 ? roundCurrency((value / totalDistributed) * 100) : 0,
  )

  let runningTotal = 0
  const accumulated = weeklyPartial.map((value) => {
    runningTotal = roundCurrency(runningTotal + value)
    return runningTotal
  })
  const accumulatedPercent = accumulated.map((value) =>
    totalDistributed > 0 ? roundCurrency((value / totalDistributed) * 100) : 0,
  )

  return {
    weeklyPartial,
    weeklyPartialPercent,
    accumulated,
    accumulatedPercent,
    totalDistributed,
  }
}
