import { z } from 'zod'

export const assetSchema = z.object({
  name: z.string().min(1),
  asset_code: z.string().optional(),
  type: z.enum(['pump', 'valve', 'motor', 'other']),
  location: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  installation_date: z.date().optional(),
  status: z.enum(['active', 'maintenance', 'inactive', 'retired']).default('active'),
})

export type AssetInput = z.infer<typeof assetSchema>

export const pumpReadingSchema = z.object({
  asset_id: z.string().uuid(),
  reading_date: z.date(),
  shift: z.enum(['A', 'B', 'C']),
  status: z.enum(['running', 'stopped', 'maintenance', 'fault']),
  power_kw: z.number().min(0).optional(),
  flow_rate: z.number().min(0).optional(),
  pressure_bar: z.number().min(0).optional(),
  vibration: z.number().min(0).optional(),
  temperature: z.number().optional(),
  observations: z.string().optional(),
})

export type PumpReadingInput = z.infer<typeof pumpReadingSchema>

export const maintenanceRecordSchema = z.object({
  asset_id: z.string().uuid(),
  maintenance_type: z.enum(['preventive', 'corrective', 'predictive']),
  description: z.string().min(1),
  performed_date: z.date().optional(),
  next_due_date: z.date().optional(),
  cost: z.number().min(0).optional(),
  technician: z.string().optional(),
  parts_replaced: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
})

export type MaintenanceRecordInput = z.infer<typeof maintenanceRecordSchema>

export const serviceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['open', 'assigned', 'in_progress', 'completed', 'cancelled']).default('open'),
  asset_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.date().optional(),
  cost: z.number().min(0).optional(),
})

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>

export const assetTypeLabels: Record<string, string> = {
  pump: 'Bomba',
  valve: 'Válvula',
  motor: 'Motor',
  other: 'Outro',
}

export const assetStatusLabels: Record<string, string> = {
  active: 'Ativo',
  maintenance: 'Em Manutenção',
  inactive: 'Inativo',
  retired: 'Aposentado',
}

export const pumpStatusLabels: Record<string, string> = {
  running: 'Funcionando',
  stopped: 'Parada',
  maintenance: 'Em Manutenção',
  fault: 'Com Falha',
}

export const maintenanceTypeLabels: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  predictive: 'Preditiva',
}

export const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

export const serviceStatusLabels: Record<string, string> = {
  open: 'Aberta',
  assigned: 'Atribuída',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}
