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

const percentNumber = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().min(0).max(100).optional())

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

const budgetStatusSchema = z.enum(['DRAFT', 'REVIEWED', 'ISSUED', 'ARCHIVED'])

export const budgetFormSchema = z.object({
  code: optionalString,
  name: nonEmptyString,
  status: budgetStatusSchema.default('DRAFT'),
  indirectPercentage: percentNumber.default(0),
  ivaPercentage: percentNumber.default(0),
  notes: optionalString,
  issuedAt: optionalDate,
})

export type BudgetFormInput = z.infer<typeof budgetFormSchema>

export function validateBudgetInput(data: unknown): BudgetFormInput {
  return budgetFormSchema.parse(data)
}

export const budgetItemSchema = z.object({
  rubroId: z.string().uuid(),
  quantity: z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      const number = Number(trimmed)
      return Number.isNaN(number) ? value : number
    }
    return value
  }, z.number().finite().min(0.0001)),
})

export type BudgetItemInput = z.infer<typeof budgetItemSchema>

export function validateBudgetItemInput(data: unknown): BudgetItemInput {
  return budgetItemSchema.parse(data)
}
