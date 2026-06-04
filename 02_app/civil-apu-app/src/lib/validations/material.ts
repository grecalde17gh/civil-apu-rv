import { z } from 'zod'
import { isValidCatalogCode } from '../catalogCodes'

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

export const materialFormSchema = z.object({
  code: z.string().trim().optional().refine((code) => !code || isValidCatalogCode(code, 'MAT'), {
    message: 'El codigo debe tener el formato MAT-001',
  }),
  description: nonEmptyString,
  unit: nonEmptyString,
  unitCost: nonNegativeNumber,
  cpc: z.string().trim().optional(),
  vae: optionalNonNegativeNumber,
  usesCategory1: z.boolean().default(false),
  usesCategory2: z.boolean().default(false),
  priceDate: optionalDate,
  isActive: z.boolean().default(true),
})

export type MaterialFormInput = z.infer<typeof materialFormSchema>

export function validateMaterialInput(data: unknown): MaterialFormInput {
  return materialFormSchema.parse(data)
}
