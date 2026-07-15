# Portal das Utilidades - Status do Sistema

**Última atualização:** 15/07/2026  
**Versão:** 1.0.0  
**Stack:** Next.js 16 + React 19 + Supabase + Tailwind CSS + shadcn/ui

---

## 📊 Resumo Geral

| Módulo | Status | Funcionalidades |
|--------|--------|-----------------|
| Dashboard | ✅ Implementado | Visão geral, gráficos, simuladores, **clima** |
| Indicadores | ✅ Implementado | KPIs, gauges, resumo operacional |
| Login/Auth | ✅ Implementado | Autenticação Supabase, primeiro acesso |
| Controle de Usuários | ✅ Implementado | CRUD, permissões, auditoria |
| Utilidades & Medições | ✅ Implementado | Hidrômetros, horímetros, cisternas |
| Insumos & Estoque | ✅ Implementado | Produtos, movimentações, estoque |
| Resíduos | ✅ Implementado | Decantadores, leitos, destino final |
| Manutenção | ✅ Implementado | Ordens de Serviço, checklists |
| Atividades Preventivas | ✅ Implementado | Planos, calendário, periodicidade |
| Checklists | ✅ Implementado | QR Code, execução, histórico |
| Laboratório | ✅ Implementado | Análises, gráficos, formulários |
| Relatórios | ✅ Implementado | 13 tipos, geração, histórico |
| Usuários | ✅ Implementado | Gerenciamento completo |
| **Meteorologia** | ✅ Implementado | Previsão do tempo, alertas, impactos |

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica
- **Frontend:** Next.js 16.2.10 (App Router) + React 19.2.4
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Realtime)
- **Estilo:** Tailwind CSS 4 + shadcn/ui + tema industrial vibrante
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **Ícones:** Lucide React

### Estrutura de Pastas
```
src/
├── app/
│   ├── (auth)/          # Login, Setup
│   ├── (dashboard)/     # Todas as páginas do sistema
│   │   ├── dashboard/
│   │   ├── utilidades/
│   │   ├── insumos/
│   │   ├── residuos/
│   │   ├── manutencao/
│   │   ├── atividades-preventivas/
│   │   ├── checklists/
│   │   ├── laboratorio/
│   │   ├── relatorios/
│   │   └── usuarios/
│   └── api/admin/       # API routes
├── components/
│   ├── shared/          # Componentes reutilizáveis
│   ├── dashboard/       # Componentes do dashboard
│   ├── utilidades/      # Formulários de medições
│   ├── insumos/         # Gestão de estoque
│   ├── residuos/        # Gestão de resíduos
│   ├── manutencao/      # Ordens de serviço
│   ├── atividades/      # Planos preventivos
│   ├── checklists/      # Inspeções com QR
│   ├── laboratorio/     # Análises de qualidade
│   ├── relatorios/      # Geração de relatórios
│   └── usuarios/        # Gestão de usuários
├── hooks/               # Hooks customizados
├── lib/                 # Utilitários, validações, Supabase
├── types/               # Tipos TypeScript
└── middleware.ts         # Autenticação
```

---

## 📋 Módulos Detalhados

### 1. Dashboard (`/dashboard`)
**Status:** ✅ Completo

**Funcionalidades:**
- Stats cards com dados reais do banco
- Gráfico de balanço hídrico (WaterBalanceChart)
- Simulador de cisternas (CisternSimulator) - 3 cisternas
- Simulador de hidrômetros (HydrantSimulator)
- Painel de alertas críticos
- Status de bombas
- Resumo de produção

**Componentes:**
- `WaterBalanceChart` - Gráfico de barras entrada vs saída
- `CisternSimulator` - Visualização de nível com barra de progresso
- `HydrantSimulator` - Leitura atual vs média
- `PumpStatusCard` - Status das bombas
- `CriticalAlertsPanel` - Alertas ativos
- `ProductionSummary` - Resumo operacional

---

### 2. Login & Autenticação (`/login`, `/setup`)
**Status:** ✅ Completo

**Funcionalidades:**
- Login com email/senha via Supabase Auth
- Página de setup para primeiro SuperAdmin
- Middleware de proteção de rotas
- Redirecionamento automático

**Fluxo:**
1. Acessa `/setup` → Cria SuperAdmin
2. Acessa `/login` → Faz login
3. Redireciona para `/dashboard`

---

### 3. Controle de Usuários (`/usuarios`)
**Status:** ✅ Completo

**Funcionalidades:**
- Lista de usuários com busca e filtros
- Criação/edição de usuários
- Perfis: SuperAdmin, Admin, Usuário
- Permissões por módulo
- Permissões por setor
- Histórico de auditoria
- Reset de senha

**Hierarquia:**
```
SuperAdmin (100)
  └── Admin (50)
        └── Usuário (10)
```

**API Routes:**
- `GET/POST /api/admin/users`
- `GET/PUT/DELETE /api/admin/users/[id]`
- `POST /api/admin/users/[id]/reset-password`
- `GET/PUT /api/admin/users/[id]/permissions`
- `GET /api/admin/roles`
- `GET /api/admin/audit`

---

### 4. Utilidades & Medições (`/utilidades`)
**Status:** ✅ Completo

**Funcionalidades:**
- Leituras de hidrômetros
- Leituras de horímetros (por poço)
- Leituras de cisternas
- Tabelas de histórico

**Tabs:**
1. **Hidrômetros & Horímetros** - Formulário unificado
2. **Cisternas** - Formulário específico

**Cisternas disponíveis:**
- BACIA AMORTECIMENTO - 296 M³
- CISTERNA LAVAGEM - 320 M³
- CISTERNA E. BRUTO - 440 M³

**Poços:**
- POÇO 01, POÇO 02, POÇO 03, POÇO 04
- HIDRÔMETRO ENTRADA/SAÍDA

**Turnos:** 1A, 1B, 2A, 2B

---

### 5. Insumos & Estoque (`/insumos`)
**Status:** ✅ Completo

**Funcionalidades:**
- Cadastro de produtos
- Movimentação de estoque (entrada/saída/ajuste)
- Controle de estoque mínimo
- Preview de estoque após movimentação
- Filtros por categoria

**Categorias:**
- Químico, GLP, Diesel, Outro

**Unidades:**
- kg, Litros, m³, Unidades, Sacos

---

### 6. Gestão de Resíduos (`/residuos`)
**Status:** ✅ Completo

**Funcionalidades:**
- Registro de decantadores
- Controle de leitos de secagem
- Destino final do lodo
- Atualização automática de status

**Tabs:**
1. **Decantadores** - Esgotamento, inspeção, manutenção
2. **Leitos de Secagem** - Abrir, fechar, remover lodo
3. **Destino Final** - Rastreamento completo

**Ações Decantador:**
- Esgotamento, Inspeção, Manutenção

**Ações Leito:**
- Abrir, Fechar, Remover Lodo, Inspeção

---

### 7. Manutenção (`/manutencao`)
**Status:** ✅ Completo

**Funcionalidades:**
- Ordens de Serviço (OS)
- Filtros por tipo e status
- Detalhe da OS completo
- Checklist de execução
- Materiais utilizados
- Histórico do equipamento

**Tipos de OS:**
- Corretiva, Preventiva, Preditiva, Emergencial

**Status da OS:**
- Aberta, Em Andamento, Pausada, Aguardando Peças, Concluída, Cancelada

**Detalhe da OS inclui:**
- Informações gerais
- Equipamento e localização
- Datas (abertura, início, conclusão)
- Checklist interativo
- Materiais utilizados
- Histórico do equipamento

---

### 8. Atividades Preventivas (`/atividades-preventivas`)
**Status:** ✅ Completo

**Funcionalidades:**
- Cadastro de planos preventivos
- Calendário de atividades
- Lista de atividades com prazos
- Geração automática de OS

**Periodicidade:**
- Diária, Semanal, Quinzenal, Mensal
- Bimestral, Trimestral, Semestral, Anual
- Por Horímetro, Por Hidrômetro
- Por Produção, Personalizada

**Calendário:**
- Visualização mensal
- Cores por categoria
- Indicador de prazo

---

### 9. Checklists (`/checklists`)
**Status:** ✅ Completo

**Funcionalidades:**
- Scanner QR Code
- Execução de checklists
- Modelos personalizados
- Histórico de execuções
- Geração automática de OS

**Fluxo:**
1. Escaneia QR Code
2. Identifica equipamento
3. Abre checklist correspondente
4. Operador responde itens
5. Ao concluir → gera OS se necessário

**Tipos de Resposta:**
- Sim/Não, Texto, Número, Lista

**Integrações:**
- Geração automática de OS para itens críticos
- GPS automático (se disponível)
- Timer de execução

---

### 10. Laboratório (`/laboratorio`)
**Status:** ✅ Completo

**Funcionalidades:**
- Cadastro de análises
- Gráficos de pH e turbidez
- Gráfico de eficiência de decantação
- Tabela de análises
- Indicadores de qualidade

**Parâmetros:**
- pH, Turbidez, Temperatura, Eficiência de Decantação

**Pontos de Coleta:**
- Hidrômetro, Serpentina, Bacia de Amortecimento
- Efluente Bruto, Efluente Tratado

---

### 11. Relatórios (`/relatorios`)
**Status:** ✅ Completo

**Funcionalidades:**
- 13 tipos de relatório
- Filtros por período, setor, turno
- Geração de relatório
- Download e impressão
- Histórico de geração

**Tipos de Relatório:**
1. Relatório Diário da ETE
2. Relatório de Manutenção
3. Relatório de Checklists
4. Relatório Laboratorial
5. Relatório de Consumo
6. Relatório de Estoque
7. Relatório de Lodo
8. Relatório de Ocorrências
9. Relatório de Horímetros
10. Relatório de Hidrômetros
11. Relatório de Alarmes
12. Relatório de Usuários
13. Auditoria do Sistema

---

## 🗄️ Banco de Dados

### Tabelas Principais (28+ tabelas)

**Autenticação:**
- `auth.users` (Supabase)
- `user_profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_sector_permissions`

**Operacional:**
- `cistern_levels`
- `hydrant_readings`
- `well_horimeters`
- `lab_analyses`

**Estoque:**
- `products`
- `stock_movements`
- `solution_preparations`

**Resíduos:**
- `decanter_records`
- `drying_beds`
- `drying_bed_records`
- `sludge_disposals`
- `oil_disposals`

**Manutenção:**
- `assets`
- `pump_readings`
- `maintenance_records`
- `service_requests`
- `maintenance_plans`
- `maintenance_orders`
- `maintenance_checklists`
- `maintenance_order_checklist`
- `maintenance_materials`
- `maintenance_order_materials`
- `maintenance_photos`

**Checklists:**
- `checklist_templates`
- `checklist_template_items`
- `equipment_qrcodes`
- `checklist_executions`
- `checklist_execution_items`

**Relatórios:**
- `report_templates`
- `report_history`
- `report_schedules`

**Sistema:**
- `system_config`
- `alert_rules`
- `alert_history`
- `audit_logs`

---

## 🔧 Migrations SQL

| # | Arquivo | Descrição |
|---|---------|-----------|
| 001 | initial_schema | Schema inicial com 28 tabelas |
| 002 | rls_policies | Políticas RLS |
| 003 | seed_data | Dados iniciais |
| 004 | user_control | Sistema de usuários e permissões |
| 005 | create_superadmin_function | Função para criar SuperAdmin |
| 006 | updates_shifts_and_cisterns | Atualização de turns e cisternas |
| 007 | maintenance_system | Sistema de manutenção e OS |
| 008 | checklist_system | Sistema de checklists com QR |
| 009 | reports_system | Sistema de relatórios |

---

## 🎨 Design System

### Paleta de Cores
| Cor | Hex | Uso |
|-----|-----|-----|
| Primária | #1A3A5A | Azul industrial escuro |
| Secundária | #6C757D | Cinza neutro |
| Destaque | #28A745 | Verde água (sucesso) |
| Alerta | #DC3545 | Vermelho vivo (erro) |
| Atenção | #FFC107 | Laranja/amarelo (aviso) |
| Info | #00b4d8 | Azul claro (informação) |

### Componentes UI
- Cards com borda lateral colorida por variante
- Botões com gradiente verde
- Glassmorphism no header
- Sidebar com gradiente industrial
- Status indicators coloridos

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Supabase project configurado

### Setup
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Executar migrations no Supabase SQL Editor
# (arquivos em supabase/migrations/)

# Iniciar desenvolvimento
npm run dev
```

### URLs Importantes
- **App:** http://localhost:3000
- **Setup:** http://localhost:3000/setup
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard

---

## 📝 Notas Técnicas

### Turnos
Sistema atualizado de A/B/C para **1A, 1B, 2A, 2B**

### Cisternas
Nomes padronizados:
- BACIA AMORTECIMENTO - 296 M³
- CISTERNA LAVAGEM - 320 M³
- CISTERNA E. BRUTO - 440 M³

### Poços
- POÇO 01, POÇO 02, POÇO 03, POÇO 04
- HIDRÔMETRO ENTRADA/SAÍDA (não relacionado a poço)

### Integrações
- **Checklist → OS:** Itens críticos geram OS automaticamente
- **Preventiva → OS:** Planos vencidos geram OS
- **Estoque → OS:** Materiais utilizados baixam estoque

---

## 🔐 Segurança

### Autenticação
- Supabase Auth com SSR cookies
- Middleware protege todas as rotas `/dashboard/*`

### Autorização
- 3 níveis: SuperAdmin (100), Admin (50), Usuário (10)
- Permissões por módulo (view, create, update, delete)
- Permissões por setor

### Auditoria
- Logs de todas as alterações em `audit_logs`
- Registro de IP e user agent

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Páginas | 14 rotas |
| Componentes | 45+ componentes |
| Tabelas DB | 35+ tabelas |
| API Routes | 10+ endpoints |
| Migrations | 9 migrations |
| Linhas de código | ~18.000+ |

---

## 🗺️ Roadmap de Versões

| Versão | Status | Principais Entregas |
|--------|--------|---------------------|
| **1.0** | ✅ Concluído | Sistema completo com 12 módulos operacionais |
| **1.1** | 🔄 Planejado | Dashboard meteorológico, alertas de chuva, histórico climático, impactos operacionais |
| **1.2** | 📋 Futuro | Indicadores (KPIs), painel executivo, alertas WhatsApp/E-mail, relatórios agendados |
| **2.0** | 📋 Futuro | Integração SCADA, CLPs, sensores IoT, leitura automática, modelos preditivos com IA |

**Detalhes da versão 1.1:** Consulte `docs/PLANO_EVOLUCAO_V1.1.0.md`

---

**Desenvolvido por:** MiMoCode  
**Última atualização:** 15/07/2026
