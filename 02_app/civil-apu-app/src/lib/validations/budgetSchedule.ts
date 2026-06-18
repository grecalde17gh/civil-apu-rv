import { z } from 'zod'
import { MAX_SCHEDULE_WEEK_COUNT } from '@/src/lib/calculations/budgetSchedule'

const scheduleEntrySchema = z.object({
  budgetItemId: z.string().min(1),
  groupName: z.string().trim().default('Grupo 1'),
  startWeek: z.number().int().positive().nullable(),
  endWeek: z.number().int().positive().nullable(),
})

export type BudgetScheduleEntryFormInput = z.infer<typeof scheduleEntrySchema>

const scheduleFormSchema = z.object({
  weekCount: z.coerce.number().int().min(1).max(MAX_SCHEDULE_WEEK_COUNT),
  entries: z.array(scheduleEntrySchema),
})

export type BudgetScheduleFormInput = z.infer<typeof scheduleFormSchema>

export function validateBudgetScheduleInput(data: unknown): BudgetScheduleFormInput {
  return scheduleFormSchema.parse(data)
}
