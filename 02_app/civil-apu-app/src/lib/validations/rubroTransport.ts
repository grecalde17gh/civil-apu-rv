import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

const positiveNumber = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return value
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().nonnegative())

export const rubroTransportFormSchema = z.object({
  rubroId: nonEmptyString,
  description: nonEmptyString,
  unit: nonEmptyString,
  quantity: positiveNumber,
  unitCost: positiveNumber,
  notes: z.string().trim().optional(),
})

export type RubroTransportFormInput = z.infer<typeof rubroTransportFormSchema>

export function validateRubroTransportInput(data: unknown): RubroTransportFormInput {
  return rubroTransportFormSchema.parse(data)
}

export const rubroTransportUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  description: nonEmptyString,
  unit: nonEmptyString,
  quantity: positiveNumber,
  unitCost: positiveNumber,
  notes: z.string().trim().optional(),
})

export type RubroTransportUpdateInput = z.infer<typeof rubroTransportUpdateSchema>

export function validateRubroTransportUpdateInput(data: unknown): RubroTransportUpdateInput {
  return rubroTransportUpdateSchema.parse(data)
}
