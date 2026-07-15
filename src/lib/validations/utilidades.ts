import { z } from 'zod'

export const hydrantReadingSchema = z.object({
  reading_date: z.date(),
  shift: z.enum(['1A', '1B', '2A', '2B']),
  hydrant_code: z.string().min(1),
  direction: z.enum(['input', 'output']),
  reading_value: z.number().min(0),
  previous_reading: z.number().min(0).optional(),
  observations: z.string().optional(),
})

export type HydrantReadingInput = z.infer<typeof hydrantReadingSchema>

export const wellHorimeterSchema = z.object({
  reading_date: z.date(),
  shift: z.enum(['1A', '1B', '2A', '2B']),
  well_code: z.string().min(1),
  current_hours: z.number().min(0),
  previous_hours: z.number().min(0).optional(),
  observations: z.string().optional(),
})

export type WellHorimeterInput = z.infer<typeof wellHorimeterSchema>

export const cisternLevelSchema = z.object({
  reading_date: z.date(),
  shift: z.enum(['1A', '1B', '2A', '2B']),
  cistern_code: z.string().min(1),
  level_percentage: z.number().min(0).max(100).optional(),
  level_meters: z.number().min(0).optional(),
  observations: z.string().optional(),
})

export type CisternLevelInput = z.infer<typeof cisternLevelSchema>

export const shiftLabels: Record<string, string> = {
  '1A': 'Turno 1A',
  '1B': 'Turno 1B',
  '2A': 'Turno 2A',
  '2B': 'Turno 2B',
}

export const directionLabels: Record<string, string> = {
  input: 'Entrada',
  output: 'Saída',
}
