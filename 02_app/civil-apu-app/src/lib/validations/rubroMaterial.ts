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

const nonNegativeNumber = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return value
    const number = Number(trimmed)
    return Number.isNaN(number) ? value : number
  }
  return value
}, z.number().finite().nonnegative())

export const rubroMaterialFormSchema = z.object({
  rubroId: nonEmptyString,
  materialId: nonEmptyString,
  quantity: positiveNumber,
  notes: z.string().trim().optional(),
})

export type RubroMaterialFormInput = z.infer<typeof rubroMaterialFormSchema>

export function validateRubroMaterialInput(data: unknown): RubroMaterialFormInput {
  return rubroMaterialFormSchema.parse(data)
}

export const rubroMaterialUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  quantity: nonNegativeNumber,
  unit: z.string().trim().optional(),
  unitCostSnapshot: nonNegativeNumber,
  notes: z.string().trim().optional(),
})

export type RubroMaterialUpdateInput = z.infer<typeof rubroMaterialUpdateSchema>

export function validateRubroMaterialUpdateInput(data: unknown): RubroMaterialUpdateInput {
  return rubroMaterialUpdateSchema.parse(data)
}
