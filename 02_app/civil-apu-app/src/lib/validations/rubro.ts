import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

const optionalString = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }
  return value
}, z.string().trim().optional())

const indirectPercentage = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return 0
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().min(0).max(100))

const optionalNonNegativeNumber = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().nonnegative().optional())

const statusSchema = z.enum(['DRAFT', 'VALIDATED', 'ARCHIVED'])
const calculationStatusSchema = z.enum(['PENDING', 'CALCULATED', 'WITH_OBSERVATIONS', 'ERROR'])

export const rubroFormSchema = z.object({
  code: nonEmptyString,
  description: nonEmptyString,
  unit: nonEmptyString,
  category: optionalString,
  performanceValue: optionalNonNegativeNumber,
  performanceUnit: optionalString,
  indirectPercentage,
  notes: optionalString,
  status: statusSchema,
  calculationStatus: calculationStatusSchema,
})

export type RubroFormInput = z.infer<typeof rubroFormSchema>

export function validateRubroInput(data: unknown): RubroFormInput {
  return rubroFormSchema.parse(data)
}
