import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

const nonNegativeNumber = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().nonnegative())

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

const optionalDate = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? value : date
  }
  return value
}, z.date().optional())

export const equipmentFormSchema = z.object({
  code: z.string().trim().optional(),
  description: nonEmptyString,
  equipmentType: z.string().trim().optional(),
  hourlyRate: optionalNonNegativeNumber,
  dailyRate: optionalNonNegativeNumber,
  purchaseCost: optionalNonNegativeNumber,
  maintenanceRequired: z.boolean().default(false),
  maintenanceNotes: z.string().trim().optional(),
  cpc: z.string().trim().optional(),
  vae: optionalNonNegativeNumber,
  priceDate: optionalDate,
  isActive: z.boolean().default(true),
})

export type EquipmentFormInput = z.infer<typeof equipmentFormSchema>

export function validateEquipmentInput(data: unknown): EquipmentFormInput {
  return equipmentFormSchema.parse(data)
}
