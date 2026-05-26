import { assertNonNegative, assertPositive, assertValidNumber, roundCurrency } from './validation'

export type PerformanceMode =
  | 'MANUAL_TIME'
  | 'HOURS_PER_UNIT'
  | 'UNITS_PER_HOUR'
  | 'UNITS_PER_DAY'

export interface CalculateLaborCostParams {
  workerQuantity: number
  hourlyCost: number
  timeRequired?: number
  performanceValue?: number
  performanceMode: PerformanceMode
  hoursPerDay?: number
}

export function calculateLaborCost(params: CalculateLaborCostParams): number {
  const {
    workerQuantity,
    hourlyCost,
    timeRequired,
    performanceValue,
    performanceMode,
    hoursPerDay = 8,
  } = params

  assertValidNumber(workerQuantity, 'workerQuantity')
  assertValidNumber(hourlyCost, 'hourlyCost')
  assertNonNegative(workerQuantity, 'workerQuantity')
  assertNonNegative(hourlyCost, 'hourlyCost')
  assertNonNegative(hoursPerDay, 'hoursPerDay')

  let duration: number

  switch (performanceMode) {
    case 'MANUAL_TIME':
      if (timeRequired === undefined) {
        throw new Error('timeRequired is required for MANUAL_TIME mode')
      }
      assertPositive(timeRequired, 'timeRequired')
      duration = timeRequired
      break

    case 'UNITS_PER_HOUR':
      if (performanceValue === undefined) {
        throw new Error('performanceValue is required for UNITS_PER_HOUR mode')
      }
      assertPositive(performanceValue, 'performanceValue')
      duration = 1 / performanceValue
      // Pendiente de validación con Franklin: interpretar rendimiento como unidades por hora
      break

    case 'UNITS_PER_DAY':
      if (performanceValue === undefined) {
        throw new Error('performanceValue is required for UNITS_PER_DAY mode')
      }
      assertPositive(performanceValue, 'performanceValue')
      duration = hoursPerDay / performanceValue
      // Pendiente de validación con Franklin: interpretar rendimiento como unidades por jornada
      break

    case 'HOURS_PER_UNIT':
      if (performanceValue === undefined) {
        throw new Error('performanceValue is required for HOURS_PER_UNIT mode')
      }
      assertPositive(performanceValue, 'performanceValue')
      duration = performanceValue
      // Pendiente de validación con Franklin: interpretar rendimiento como horas por unidad
      break

    default:
      throw new Error(`Unsupported performance mode: ${performanceMode}`)
  }

  const total = workerQuantity * hourlyCost * duration
  return roundCurrency(total)
}
