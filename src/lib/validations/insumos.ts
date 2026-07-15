import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['quimico', 'glp', 'diesel', 'outro']),
  unit: z.string().min(1),
  current_stock: z.number().min(0),
  min_stock: z.number().min(0),
  max_stock: z.number().min(0).optional(),
  supplier: z.string().optional(),
  unit_price: z.number().min(0).optional(),
  location: z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>

export const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  movement_type: z.enum(['entry', 'exit', 'adjustment']),
  quantity: z.number().min(0.01),
  unit_price: z.number().min(0).optional(),
  reason: z.string().optional(),
  reference_document: z.string().optional(),
})

export type StockMovementInput = z.infer<typeof stockMovementSchema>

export const solutionPreparationSchema = z.object({
  preparation_date: z.date(),
  shift: z.enum(['A', 'B', 'C']),
  product_id: z.string().uuid(),
  concentration: z.number().min(0).max(100).optional(),
  volume_prepared: z.number().min(0.01),
  unit: z.string().default('L'),
  batch_number: z.string().optional(),
  expiry_date: z.date().optional(),
  observations: z.string().optional(),
})

export type SolutionPreparationInput = z.infer<typeof solutionPreparationSchema>

export const categoryLabels: Record<string, string> = {
  quimico: 'Químico',
  glp: 'GLP',
  diesel: 'Diesel',
  outro: 'Outro',
}

export const movementTypeLabels: Record<string, string> = {
  entry: 'Entrada',
  exit: 'Saída',
  adjustment: 'Ajuste',
}
