import { roundMoney } from './rounding'

export function assertValidNumber(value: unknown, name: string): number {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required`)
  }

  if (typeof value !== 'number') {
    throw new Error(`${name} must be a number`)
  }

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`)
  }

  return value
}

export function assertNonNegative(value: number, name: string): number {
  assertValidNumber(value, name)

  if (value < 0) {
    throw new Error(`${name} must be non-negative`)
  }

  return value
}

export function assertPercentage(value: number, name: string): number {
  assertNonNegative(value, name)

  if (value > 100) {
    throw new Error(`${name} must be 100 or less`)
  }

  return value
}

export function assertPositive(value: number, name: string): number {
  assertValidNumber(value, name)

  if (value <= 0) {
    throw new Error(`${name} must be greater than zero`)
  }

  return value
}

export function roundCurrency(value: number): number {
  return roundMoney(value, 2)
}
