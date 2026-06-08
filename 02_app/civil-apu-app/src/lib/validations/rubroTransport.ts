import { z } from 'zod'
import { isValidCatalogCode } from '../catalogCodes'
import { decimalInputPreprocess } from './decimalInput'

const nonEmptyString = z.string().trim().min(1)

const positiveNumber = z.preprocess(decimalInputPreprocess, z.number().finite().nonnegative())
const optionalString = z.string().trim().optional()

export const rubroTransportFormSchema = z.object({
  rubroId: nonEmptyString,
  code: z.string().trim().optional().refine((code) => !code || isValidCatalogCode(code, 'TR'), {
    message: 'El codigo debe tener el formato TR-001',
  }),
  description: nonEmptyString,
  unit: nonEmptyString,
  quantity: positiveNumber,
  unitCost: positiveNumber,
  denominationId: optionalString,
  notes: z.string().trim().optional(),
})

export type RubroTransportFormInput = z.infer<typeof rubroTransportFormSchema>

export function validateRubroTransportInput(data: unknown): RubroTransportFormInput {
  return rubroTransportFormSchema.parse(data)
}

export const rubroTransportUpdateSchema = z.object({
  id: nonEmptyString,
  rubroId: nonEmptyString,
  code: z.string().trim().optional().refine((code) => !code || isValidCatalogCode(code, 'TR'), {
    message: 'El codigo debe tener el formato TR-001',
  }),
  description: nonEmptyString,
  unit: nonEmptyString,
  quantity: positiveNumber,
  unitCost: positiveNumber,
  denominationId: optionalString,
  notes: z.string().trim().optional(),
})

export type RubroTransportUpdateInput = z.infer<typeof rubroTransportUpdateSchema>

export function validateRubroTransportUpdateInput(data: unknown): RubroTransportUpdateInput {
  return rubroTransportUpdateSchema.parse(data)
}
