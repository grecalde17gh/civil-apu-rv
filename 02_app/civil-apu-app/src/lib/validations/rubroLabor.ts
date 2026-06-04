import { z } from 'zod'
import { decimalInputPreprocess } from './decimalInput'

const nonEmptyString = z.string().trim().min(1)

const positiveNumber = z.preprocess(decimalInputPreprocess, z.number().finite().positive())

const nonNegativeNumber = z.preprocess(decimalInputPreprocess, z.number().finite().nonnegative())

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

export const rubroLaborUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  workerQuantity: nonNegativeNumber,
  timeRequired: nonNegativeNumber,
  hourlyCostSnapshot: nonNegativeNumber,
  notes: z.string().trim().optional(),
})

export type RubroLaborUpdateInput = z.infer<typeof rubroLaborUpdateSchema>

export function validateRubroLaborUpdateInput(data: unknown): RubroLaborUpdateInput {
  return rubroLaborUpdateSchema.parse(data)
}
