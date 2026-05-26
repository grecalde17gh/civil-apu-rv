export function roundMoney(value: number, decimalPlaces = 2): number {
  if (!Number.isFinite(value)) {
    throw new Error('roundMoney: value must be a finite number')
  }

  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new Error('roundMoney: decimalPlaces must be a non-negative integer')
  }

  const factor = 10 ** decimalPlaces
  return Math.round(value * factor + Number.EPSILON) / factor
}
