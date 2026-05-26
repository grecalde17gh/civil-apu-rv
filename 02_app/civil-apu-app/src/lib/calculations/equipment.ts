import { assertNonNegative, assertPositive, assertValidNumber, roundCurrency } from './validation'

export type RateType = 'HOURLY' | 'DAILY' | 'FIXED'
export type EquipmentPerformanceMode =
  | 'MANUAL_TIME'
  | 'HOURS_PER_UNIT'
  | 'UNITS_PER_HOUR'
  | 'UNITS_PER_DAY'

export interface CalculateEquipmentCostParams {
  equipmentQuantity: number
  rate: number
  timeRequired?: number
  performanceValue?: number
  performanceMode: EquipmentPerformanceMode
  rateType: RateType
  hoursPerDay?: number
}

function convertDailyToHourly(rate: number, hoursPerDay: number): number {
  assertPositive(hoursPerDay, 'hoursPerDay')
  return rate / hoursPerDay
}

export function calculateEquipmentCost(params: CalculateEquipmentCostParams): number {
  const {
    equipmentQuantity,
    rate,
    timeRequired,
    performanceValue,
    performanceMode,
    rateType,
    hoursPerDay = 8,
  } = params

  assertValidNumber(equipmentQuantity, 'equipmentQuantity')
  assertValidNumber(rate, 'rate')
  assertNonNegative(equipmentQuantity, 'equipmentQuantity')
  assertNonNegative(rate, 'rate')
  assertNonNegative(hoursPerDay, 'hoursPerDay')

  let effectiveRate = rate
  let duration = 0

  if (rateType === 'DAILY') {
    effectiveRate = convertDailyToHourly(rate, hoursPerDay)
    // Pendiente de validación con Franklin: conversión de tarifa diaria a tarifa horaria
  }

  switch (rateType) {
    case 'FIXED':
      duration = 1
      break

    case 'HOURLY':
      if (performanceMode === 'MANUAL_TIME') {
        if (timeRequired === undefined) {
          throw new Error('timeRequired is required for HOURLY MANUAL_TIME mode')
        }
        assertPositive(timeRequired, 'timeRequired')
        duration = timeRequired
      } else if (performanceMode === 'UNITS_PER_HOUR') {
        if (performanceValue === undefined) {
          throw new Error('performanceValue is required for UNITS_PER_HOUR mode')
        }
        assertPositive(performanceValue, 'performanceValue')
        duration = 1 / performanceValue
        // Pendiente de validación con Franklin: interpretación de rendimiento en equipos por hora
      } else if (performanceMode === 'UNITS_PER_DAY') {
        if (performanceValue === undefined) {
          throw new Error('performanceValue is required for UNITS_PER_DAY mode')
        }
        assertPositive(performanceValue, 'performanceValue')
        duration = hoursPerDay / performanceValue
        // Pendiente de validación con Franklin: interpretación de rendimiento en equipos por jornada
      } else if (performanceMode === 'HOURS_PER_UNIT') {
        if (performanceValue === undefined) {
          throw new Error('performanceValue is required for HOURS_PER_UNIT mode')
        }
        assertPositive(performanceValue, 'performanceValue')
        duration = performanceValue
        // Pendiente de validación con Franklin: interpretación de horas por unidad
      } else {
        throw new Error(`Unsupported performance mode: ${performanceMode}`)
      }
      break

    case 'DAILY':
      if (performanceMode === 'MANUAL_TIME') {
        if (timeRequired === undefined) {
          throw new Error('timeRequired is required for DAILY MANUAL_TIME mode')
        }
        assertPositive(timeRequired, 'timeRequired')
        duration = timeRequired
      } else {
        if (performanceValue === undefined) {
          throw new Error(`performanceValue is required for DAILY ${performanceMode} mode`)
        }
        assertPositive(performanceValue, 'performanceValue')
        if (performanceMode === 'UNITS_PER_HOUR') {
          duration = 1 / performanceValue
        } else if (performanceMode === 'UNITS_PER_DAY') {
          duration = hoursPerDay / performanceValue
        } else if (performanceMode === 'HOURS_PER_UNIT') {
          duration = performanceValue
        } else {
          throw new Error(`Unsupported performance mode: ${performanceMode}`)
        }
        // Pendiente de validación con Franklin: aplicación de modos con tarifa diaria
      }
      break

    case 'FIXED':
      duration = 1
      break

    default:
      throw new Error(`Unsupported rate type: ${rateType}`)
  }

  const total = equipmentQuantity * effectiveRate * duration
  return roundCurrency(total)
}
