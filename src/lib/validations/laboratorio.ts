import { z } from 'zod'

export const labAnalysisSchema = z.object({
  analysis_date: z.date(),
  shift: z.enum(['A', 'B', 'C']),
  collection_point: z.enum([
    'hidrometro',
    'serpentina',
    'bacia_amortecimento',
    'efluente_bruto',
    'efluente_tratado',
  ]),
  ph: z.number().min(0).max(14).optional(),
  turbidity: z.number().min(0).optional(),
  temperature: z.number().min(-10).max(100).optional(),
  decantation_efficiency: z.number().min(0).max(100).optional(),
  observations: z.string().optional(),
})

export type LabAnalysisInput = z.infer<typeof labAnalysisSchema>

export const collectionPointLabels: Record<string, string> = {
  hidrometro: 'Hidrômetro',
  serpentina: 'Serpentina',
  bacia_amortecimento: 'Bacia de Amortecimento',
  efluente_bruto: 'Efluente Bruto',
  efluente_tratado: 'Efluente Tratado',
}
