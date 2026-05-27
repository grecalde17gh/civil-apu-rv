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

export const laborFormSchema = z.object({
  code: z.string().trim().optional(),
  roleName: nonEmptyString,
  hourlyCost: nonNegativeNumber,
  dailyCost: optionalNonNegativeNumber,
  competencies: z.string().trim().optional(),
  availability: z.string().trim().optional(),
  cpc: z.string().trim().optional(),
  vae: optionalNonNegativeNumber,
  category: z.string().trim().optional(),
  priceDate: optionalDate,
  isActive: z.boolean().default(true),
})

export type LaborFormInput = z.infer<typeof laborFormSchema>

export function validateLaborInput(data: unknown): LaborFormInput {
  return laborFormSchema.parse(data)
}
