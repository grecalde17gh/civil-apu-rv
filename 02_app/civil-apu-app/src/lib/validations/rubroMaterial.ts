import { z } from 'zod'
import { decimalInputPreprocess } from './decimalInput'

const nonEmptyString = z.string().trim().min(1)

const positiveNumber = z.preprocess(
  decimalInputPreprocess,
  z.number().finite().positive('Complete los datos obligatorios del componente antes de agregarlo.'),
)

const priceOption = z.preprocess(decimalInputPreprocess, z.number().int().min(1).max(3))

export const rubroMaterialFormSchema = z.object({
  rubroId: nonEmptyString,
  materialId: nonEmptyString,
  quantity: positiveNumber,
  priceOption: priceOption.default(1),
  notes: z.string().trim().optional(),
})

export type RubroMaterialFormInput = z.infer<typeof rubroMaterialFormSchema>

export function validateRubroMaterialInput(data: unknown): RubroMaterialFormInput {
  return rubroMaterialFormSchema.parse(data)
}

export const rubroMaterialUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  quantity: positiveNumber,
  unit: z.string().trim().optional(),
  priceOption: priceOption.optional(),
  notes: z.string().trim().optional(),
})

export type RubroMaterialUpdateInput = z.infer<typeof rubroMaterialUpdateSchema>

export function validateRubroMaterialUpdateInput(data: unknown): RubroMaterialUpdateInput {
  return rubroMaterialUpdateSchema.parse(data)
}
