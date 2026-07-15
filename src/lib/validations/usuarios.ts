import { z } from 'zod'

export const createUserSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  role_id: z.string().uuid('Perfil inválido'),
  department: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  is_active: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  role_id: z.string().uuid('Perfil inválido').optional(),
  department: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const permissionSchema = z.object({
  module: z.string(),
  action: z.string(),
  allowed: z.boolean(),
})

export const sectorPermissionSchema = z.object({
  sector: z.string(),
  can_view: z.boolean().default(true),
  can_create: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  can_delete: z.boolean().default(false),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
