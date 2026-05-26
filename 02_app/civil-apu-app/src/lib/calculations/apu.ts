import { assertNonNegative, assertPercentage, assertValidNumber, roundCurrency } from './validation'

export function sumCosts(costs: number[]): number {
  if (!Array.isArray(costs)) {
    throw new Error('costs must be an array')
  }

  const total = costs.reduce((sum, value, index) => {
    assertValidNumber(value, `costs[${index}]`)
    assertNonNegative(value, `costs[${index}]`)
    return sum + value
  }, 0)

  return roundCurrency(total)
}

export function calculateDirectCost(params: {
  materialsSubtotal: number
  laborSubtotal: number
  equipmentSubtotal: number
  transportSubtotal: number
}): number {
  const { materialsSubtotal, laborSubtotal, equipmentSubtotal, transportSubtotal } = params

  assertNonNegative(materialsSubtotal, 'materialsSubtotal')
  assertNonNegative(laborSubtotal, 'laborSubtotal')
  assertNonNegative(equipmentSubtotal, 'equipmentSubtotal')
  assertNonNegative(transportSubtotal, 'transportSubtotal')

  return roundCurrency(materialsSubtotal + laborSubtotal + equipmentSubtotal + transportSubtotal)
}

export function calculateIndirectCost(directCost: number, indirectPercentage: number): number {
  assertNonNegative(directCost, 'directCost')
  assertPercentage(indirectPercentage, 'indirectPercentage')

  const indirect = directCost * (indirectPercentage / 100)
  return roundCurrency(indirect)
}

export function calculateUnitPrice(directCost: number, indirectPercentage: number): number {
  assertNonNegative(directCost, 'directCost')
  assertPercentage(indirectPercentage, 'indirectPercentage')

  const indirectCost = calculateIndirectCost(directCost, indirectPercentage)
  return roundCurrency(directCost + indirectCost)
}

export function calculateAPU(params: {
  materials: number[]
  labor: number[]
  equipment: number[]
  transport: number[]
  indirectPercentage: number
}) {
  const { materials, labor, equipment, transport, indirectPercentage } = params

  const materialsSubtotal = sumCosts(materials)
  const laborSubtotal = sumCosts(labor)
  const equipmentSubtotal = sumCosts(equipment)
  const transportSubtotal = sumCosts(transport)

  const directCost = calculateDirectCost({
    materialsSubtotal,
    laborSubtotal,
    equipmentSubtotal,
    transportSubtotal,
  })

  const indirectCost = calculateIndirectCost(directCost, indirectPercentage)
  const unitPrice = calculateUnitPrice(directCost, indirectPercentage)

  return {
    materialsSubtotal,
    laborSubtotal,
    equipmentSubtotal,
    transportSubtotal,
    directCost,
    indirectCost,
    unitPrice,
  }
}
