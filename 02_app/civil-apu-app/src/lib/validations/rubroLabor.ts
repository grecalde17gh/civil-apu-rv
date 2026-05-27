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
}, z.number().finite().positive())

export const rubroLaborFormSchema = z.object({
  rubroId: nonEmptyString,
  laborItemId: nonEmptyString,
  workerQuantity: positiveNumber,
  timeRequired: positiveNumber,
  notes: z.string().trim().optional(),
})

export type RubroLaborFormInput = z.infer<typeof rubroLaborFormSchema>

export function validateRubroLaborInput(data: unknown): RubroLaborFormInput {
  return rubroLaborFormSchema.parse(data)
}
