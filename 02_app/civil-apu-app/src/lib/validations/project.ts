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
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return value
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().min(0).max(100))

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

const projectStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED'])

export const projectFormSchema = z.object({
  name: nonEmptyString,
  clientName: optionalString,
  location: optionalString,
  province: optionalString,
  city: optionalString,
  startDate: optionalDate,
  endDate: optionalDate,
  defaultIndirectPercentage: percentNumber,
  notes: optionalString,
  status: projectStatusSchema,
})

export type ProjectFormInput = z.infer<typeof projectFormSchema>

export function validateProjectInput(data: unknown): ProjectFormInput {
  return projectFormSchema.parse(data)
}
