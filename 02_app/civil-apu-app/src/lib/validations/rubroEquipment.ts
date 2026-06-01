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

export const rubroEquipmentFormSchema = z.object({
  rubroId: nonEmptyString,
  equipmentItemId: nonEmptyString,
  equipmentQuantity: positiveNumber,
  timeRequired: positiveNumber,
  notes: z.string().trim().optional(),
})

export type RubroEquipmentFormInput = z.infer<typeof rubroEquipmentFormSchema>

export function validateRubroEquipmentInput(data: unknown): RubroEquipmentFormInput {
  return rubroEquipmentFormSchema.parse(data)
}

export const rubroEquipmentUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  equipmentQuantity: nonNegativeNumber,
  timeRequired: nonNegativeNumber,
  rateSnapshot: nonNegativeNumber,
  notes: z.string().trim().optional(),
})

export type RubroEquipmentUpdateInput = z.infer<typeof rubroEquipmentUpdateSchema>

export function validateRubroEquipmentUpdateInput(data: unknown): RubroEquipmentUpdateInput {
  return rubroEquipmentUpdateSchema.parse(data)
}
