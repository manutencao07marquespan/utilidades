// System Constants
export const APP_NAME = 'Portal das Utilidades'
export const APP_DESCRIPTION = 'Sistema de Controle para ETE'

// Shifts
export const SHIFTS = ['1A', '1B', '2A', '2B'] as const
export type Shift = (typeof SHIFTS)[number]

export const SHIFT_LABELS: Record<Shift, string> = {
  '1A': 'Turno 1A',
  '1B': 'Turno 1B',
  '2A': 'Turno 2A',
  '2B': 'Turno 2B',
}

// Cistern Codes
export const CISTERN_CODES = [
  { code: 'BACIA AMORTECIMENTO - 296 M³', name: 'Bacia de Amortecimento', capacity: 296 },
  { code: 'CISTERNA LAVAGEM - 320 M³', name: 'Cisterna de Lavagem', capacity: 320 },
  { code: 'CISTERNA E. BRUTO - 440 M³', name: 'Cisterna Efluente Bruto', capacity: 440 },
] as const

// Well Codes
export const WELL_CODES = ['POÇO 01', 'POÇO 02', 'POÇO 03', 'POÇO 04'] as const
export type WellCode = (typeof WELL_CODES)[number]

// Collection Points
export const COLLECTION_POINTS = [
  'hidrometro',
  'serpentina',
  'bacia_amortecimento',
  'efluente_bruto',
  'efluente_tratado',
] as const
export type CollectionPoint = (typeof COLLECTION_POINTS)[number]

export const COLLECTION_POINT_LABELS: Record<CollectionPoint, string> = {
  hidrometro: 'Hidrômetro',
  serpentina: 'Serpentina',
  bacia_amortecimento: 'Bacia de Amortecimento',
  efluente_bruto: 'Efluente Bruto',
  efluente_tratado: 'Efluente Tratado',
}

// Product Categories
export const PRODUCT_CATEGORIES = ['quimico', 'glp', 'diesel', 'outro'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  quimico: 'Químico',
  glp: 'GLP',
  diesel: 'Diesel',
  outro: 'Outro',
}

// Stock Movement Types
export const STOCK_MOVEMENT_TYPES = ['entry', 'exit', 'adjustment'] as const
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number]

export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  entry: 'Entrada',
  exit: 'Saída',
  adjustment: 'Ajuste',
}

// Asset Types
export const ASSET_TYPES = ['pump', 'valve', 'motor', 'other'] as const
export type AssetType = (typeof ASSET_TYPES)[number]

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  pump: 'Bomba',
  valve: 'Válvula',
  motor: 'Motor',
  other: 'Outro',
}

// Asset Status
export const ASSET_STATUSES = ['active', 'maintenance', 'inactive', 'retired'] as const
export type AssetStatus = (typeof ASSET_STATUSES)[number]

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Ativo',
  maintenance: 'Em Manutenção',
  inactive: 'Inativo',
  retired: 'Aposentado',
}

// Pump Status
export const PUMP_STATUSES = ['running', 'stopped', 'maintenance', 'fault'] as const
export type PumpStatus = (typeof PUMP_STATUSES)[number]

export const PUMP_STATUS_LABELS: Record<PumpStatus, string> = {
  running: 'Funcionando',
  stopped: 'Parada',
  maintenance: 'Em Manutenção',
  fault: 'Com Falha',
}

// Maintenance Types
export const MAINTENANCE_TYPES = ['preventive', 'corrective', 'predictive'] as const
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number]

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  predictive: 'Preditiva',
}

// Maintenance Status
export const MAINTENANCE_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number]

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

// Service Request Priority
export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

// Service Request Status
export const SERVICE_STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'cancelled'] as const
export type ServiceStatus = (typeof SERVICE_STATUSES)[number]

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  open: 'Aberta',
  assigned: 'Atribuída',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

// User Roles
export const USER_ROLES = ['SuperAdmin', 'Admin', 'Usuario'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: 'Super Administrador',
  Admin: 'Administrador',
  Usuario: 'Usuário',
}

export const USER_ROLE_LEVELS: Record<UserRole, number> = {
  SuperAdmin: 100,
  Admin: 50,
  Usuario: 10,
}

export const MODULES = [
  { name: 'dashboard', display_name: 'Dashboard' },
  { name: 'laboratorio', display_name: 'Laboratório' },
  { name: 'utilidades', display_name: 'Utilidades' },
  { name: 'insumos', display_name: 'Insumos & Estoque' },
  { name: 'residuos', display_name: 'Resíduos' },
  { name: 'manutencao', display_name: 'Manutenção' },
  { name: 'usuarios', display_name: 'Controle de Usuários' },
  { name: 'checklists', display_name: 'Checklists' },
  { name: 'relatorios', display_name: 'Relatórios' },
  { name: 'atividades', display_name: 'Atividades Preventivas' },
] as const

export const PERMISSION_ACTIONS = [
  { action: 'view', label: 'Visualizar' },
  { action: 'create', label: 'Inserir' },
  { action: 'update', label: 'Editar' },
  { action: 'delete', label: 'Excluir' },
  { action: 'export', label: 'Exportar' },
] as const

// Checklist Types
export const CHECKLIST_TYPES = ['daily', 'chemical_preparation', 'sludge', 'custom'] as const
export type ChecklistType = (typeof CHECKLIST_TYPES)[number]

export const CHECKLIST_TYPE_LABELS: Record<ChecklistType, string> = {
  daily: 'Rotina Diária',
  chemical_preparation: 'Preparo de Produtos Químicos',
  sludge: 'Gestão de Lodo',
  custom: 'Personalizado',
}

// Checklist Status
export const CHECKLIST_STATUSES = ['pending', 'in_progress', 'completed', 'skipped'] as const
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number]

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  skipped: 'Pulado',
}

// Drying Bed Status
export const DRYING_BED_STATUSES = ['available', 'in_use', 'drying', 'completed'] as const
export type DryingBedStatus = (typeof DRYING_BED_STATUSES)[number]

export const DRYING_BED_STATUS_LABELS: Record<DryingBedStatus, string> = {
  available: 'Disponível',
  in_use: 'Em Uso',
  drying: 'Secando',
  completed: 'Concluído',
}

// Decanter Action Types
export const DECANTER_ACTION_TYPES = ['emptying', 'inspection', 'maintenance'] as const
export type DecanterActionType = (typeof DECANTER_ACTION_TYPES)[number]

export const DECANTER_ACTION_TYPE_LABELS: Record<DecanterActionType, string> = {
  emptying: 'Esgotamento',
  inspection: 'Inspeção',
  maintenance: 'Manutenção',
}

// Drying Bed Action Types
export const DRYING_BED_ACTION_TYPES = ['open', 'close', 'remove_sludge', 'inspect'] as const
export type DryingBedActionType = (typeof DRYING_BED_ACTION_TYPES)[number]

export const DRYING_BED_ACTION_TYPE_LABELS: Record<DryingBedActionType, string> = {
  open: 'Abertura',
  close: 'Fechamento',
  remove_sludge: 'Remoção de Lodo',
  inspect: 'Inspeção',
}

// Alert Severity
export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'Informação',
  warning: 'Aviso',
  critical: 'Crítico',
}

// Notification Methods
export const NOTIFICATION_METHODS = ['system', 'whatsapp', 'email'] as const
export type NotificationMethod = (typeof NOTIFICATION_METHODS)[number]

export const NOTIFICATION_METHOD_LABELS: Record<NotificationMethod, string> = {
  system: 'Sistema',
  whatsapp: 'WhatsApp',
  email: 'Email',
}

// Preventive Activity Categories
export const PREVENTIVE_CATEGORIES = ['equipment', 'facility', 'safety', 'environmental', 'other'] as const
export type PreventiveCategory = (typeof PREVENTIVE_CATEGORIES)[number]

export const PREVENTIVE_CATEGORY_LABELS: Record<PreventiveCategory, string> = {
  equipment: 'Equipamento',
  facility: 'Instalação',
  safety: 'Segurança',
  environmental: 'Ambiental',
  other: 'Outro',
}

// Preventive Execution Status
export const PREVENTIVE_STATUSES = ['pending', 'in_progress', 'completed', 'overdue', 'skipped'] as const
export type PreventiveStatus = (typeof PREVENTIVE_STATUSES)[number]

export const PREVENTIVE_STATUS_LABELS: Record<PreventiveStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  overdue: 'Atrasada',
  skipped: 'Pulada',
}

// Sludge Disposal Sources
export const SLUDGE_SOURCES = ['decanter', 'drying_bed'] as const
export type SludgeSource = (typeof SLUDGE_SOURCES)[number]

export const SLUDGE_SOURCE_LABELS: Record<SludgeSource, string> = {
  decanter: 'Decantador',
  drying_bed: 'Leito de Secagem',
}
