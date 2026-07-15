# Portal das Utilidades - Sistema de Controle para ETE

Sistema web completo para gestão e controle de Estação de Tratamento de Efluentes (ETE).

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Estilo:** Tailwind CSS 4 + shadcn/ui
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod

## 📦 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# 3. Executar migrations no Supabase SQL Editor
# (arquivos em supabase/migrations/ na ordem numérica)

# 4. Iniciar desenvolvimento
npm run dev
```

### Acessos

- **App:** http://localhost:3000
- **Setup (1º acesso):** http://localhost:3000/setup
- **Login:** http://localhost:3000/login

## 📋 Módulos

| Módulo | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/dashboard` | Visão geral do sistema |
| Utilidades | `/utilidades` | Hidrômetros, horímetros, cisternas |
| Insumos | `/insumos` | Gestão de estoque |
| Resíduos | `/residuos` | Decantadores, leitos de secagem |
| Manutenção | `/manutencao` | Ordens de serviço |
| Atividades | `/atividades-preventivas` | Planos preventivos |
| Checklists | `/checklists` | Inspeções com QR Code |
| Laboratório | `/laboratorio` | Análises de qualidade |
| Relatórios | `/relatorios` | 13 tipos de relatório |
| Usuários | `/usuarios` | Gestão de usuários |

## 🗄️ Banco de Dados

Execute as migrations na ordem:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_data.sql`
4. `004_user_control.sql`
5. `005_create_superadmin_function.sql`
6. `006_update_shifts_and_cisterns.sql`
7. `007_maintenance_system.sql`
8. `008_checklist_system.sql`
9. `009_reports_system.sql`

## 📖 Documentação

Consulte `docs/STATUS_DO_SISTEMA.md` para documentação completa do sistema.

## 🎨 Tema

Tema industrial vibrante com cores:
- Primária: Azul escuro (#1A3A5A)
- Destaque: Verde água (#28A745)
- Alerta: Vermelho (#DC3545)
- Atenção: Amarelo (#FFC107)

---

**Desenvolvido para:** Gestão de ETE  
**Versão:** 1.0.0
