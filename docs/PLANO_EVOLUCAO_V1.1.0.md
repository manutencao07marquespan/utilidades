# Plano de Evolução - Portal das Utilidades
## Versão 1.1.0 - Dashboard Inteligente e Integrado com Clima

**Versão Atual:** 1.0.0  
**Versão Alvo:** 1.1.0  
**Data de Início:** Julho/2026  
**Duração Estimada:** 4-6 semanas

---

## 📋 Resumo Executivo

Transformar o Portal das Utilidades em um **sistema preditivo e inteligente**, fornecendo suporte à decisão operacional através da integração com dados meteorológicos, indicadores inteligentes e novos recursos de gestão.

### Diferencial da Versão 1.1.0
- Dashboard operacional em tempo real com dados meteorológicos
- Alertas automáticos baseados em previsão do tempo
- Impacto operacional calculado automaticamente
- Integração inteligente entre módulos
- Indicadores de desempenho (KPIs)

---

## 🎯 Funcionalidades Detalhadas

### 1. Dashboard Inteligente

#### 1.1 Card: Condições Meteorológicas
**Localização:** Dashboard Principal

**Layout:**
```
┌─────────────────────────────────────────────┐
│  🌤 PREVISÃO DO TEMPO                       │
├─────────────────────────────────────────────┤
│  Temperatura      24°C                      │
│  Umidade          78%                       │
│  Vento            12 km/h                   │
│  Precipitação     85%                       │
│  Chuva prevista   18 mm                     │
│  Última atualização 09:00                   │
├─────────────────────────────────────────────┤
│  Previsão para os próximos dias             │
│  Hoje    🌧 18 mm  Máx 27° Mín 18°         │
│  Amanhã  🌦 8 mm                           │
│  Sexta   ☀ Sem chuva                       │
│  Sábado  ⛈ 42 mm                           │
└─────────────────────────────────────────────┘
```

**Dados necessários:**
- API meteorológica (OpenWeatherMap, WeatherAPI)
- Cache de 15-30 minutos
- Atualização automática

#### 1.2 Indicador Operacional
**Conversão de previsão em impacto:**

| Precipitação | Impacto | Cor |
|--------------|---------|-----|
| 0-10 mm | 🟢 Baixo | Verde |
| 10-25 mm | 🟡 Moderado | Amarelo |
| 25-50 mm | 🟠 Alto | Laranja |
| >50 mm | 🔴 Crítico | Vermelho |

---

### 2. Sistema de Alertas Meteorológicos

#### 2.1 Alertas Automáticos
**Trigger:** Previsão de chuva > 10 mm

**Exemplo de Alerta:**
```
⚠ Atenção

Previsão: 30 mm nas próximas 6 horas
Impacto esperado: Aumento de vazão

Verificar:
✓ Bacia de amortecimento
✓ Decantadores
✓ Bombas
✓ Leitos de secagem
✓ Estoque de polímero
```

#### 2.2 Alerta de Chuva Intensa
**Trigger:** Previsão > 50 mm

**Ações automáticas:**
1. 🔴 Gerar alerta crítico no sistema
2. 📱 Exibir popup/banner vermelho
3. 📝 Registrar em histórico
4. 📧 Notificar responsáveis (futuro: WhatsApp)

---

### 3. Painel Hidrológico

**Novo widget no Dashboard:**

```
┌─────────────────────────────────────────────┐
│  📊 PAINEL HIDROLÓGICO                      │
├─────────────────────────────────────────────┤
│  Volume da Bacia     72%  ↑ Tendência       │
│  Entrada           340 m³/h                 │
│  Saída             298 m³/h                 │
│  Previsão          Entrada aumentará 18%    │
└─────────────────────────────────────────────┘
```

**Lógica:**
- Se chuva prevista > 20mm: entrada aumenta 15-25%
- Se chuva prevista > 50mm: entrada aumenta 25-40%
- Calcular com base no histórico

---

### 4. Tendência de Vazão

**Novo gráfico:**

Cruza:
- Chuva prevista
- Vazão histórica
- Nível das cisternas

**Resultado:**
```
Próximas 24 horas
Entrada prevista: 420 m³
Saída prevista: 380 m³
```

---

### 5. Inteligência para Produtos Químicos

**Se previsão indicar chuva intensa:**

| Produto | Impacto | Ação |
|---------|---------|------|
| PAC | +15% | Aumentar estoque mínimo |
| Polímero | +12% | Verificar fornecedor |
| Cloro | Normal | Manter |

**Exibição no Dashboard:**
```
📦 PRODUTOS QUÍMICOS
PAC:     Estoque 450 kg (mínimo 400) ⚠️
Polímero: Estoque 200 kg (mínimo 150) ✅
Cloro:   Estoque 50 L (mínimo 30) ✅
```

---

### 6. Inteligência para Lodo

**Se chuva intensa prevista:**

```
⚠️ ALERTA - GESTÃO DE LODO

Condição: Chuva intensa prevista (42 mm)
Recomendação: EVITAR abertura de leitos

Risco:
- Perda de eficiência na secagem
- Contaminação do lodo

Sugestão: Aguardar redução da precipitação
```

---

### 7. Integração com Checklists

**Em dias chuvosos, adicionar automaticamente:**

```
☑️ CHECKLIST EXTRA - DIA CHUVOSO

☐ Verificar drenagem
☐ Conferir grades de entrada
☐ Limpar canaletas
☐ Verificar bombas reserva
☐ Conferir nível da bacia
☐ Verificar calhas e rufos
☐ Inspecionar comportas
```

**Implementação:**
- Detectar se há previsão de chuva
- Inserir itens extras no checklist do dia
- Marcar como obrigatório

---

### 8. Integração com Manutenção

**Se chuva prevista, priorizar OS de:**

| Equipamento | Prioridade | Motivo |
|-------------|------------|--------|
| Bombas | Alta | Possível aumento de demanda |
| Gradeamento | Alta | Acúmulo de detritos |
| Drenagem | Crítica | Evitar alagamento |
| Comportas | Alta | Controle de fluxo |

**Ação automática:**
- Criar OS preventiva para equipamentos críticos
- Definir prioridade como "Alta" ou "Crítica"

---

### 9. Dashboard Executivo

**Novos indicadores:**

```
┌─────────────────────────────────────────────┐
│  📊 DASHBOARD EXECUTIVO                     │
├─────────────────────────────────────────────┤
│  Condição Operacional    NORMAL    🟢       │
│  Previsão Chuva          MODERADA  🟡       │
│  Impacto Previsto        ALTO      🟠       │
│  Produtos Críticos       PAC, Lodo 🟡       │
│  Alarmes                 3         🔴       │
└─────────────────────────────────────────────┘
```

---

### 10. Histórico Climático

**Nova tabela no Dashboard:**

| Data | Chuva | Vazão | pH | Turbidez | Eficiência | Produção |
|------|-------|-------|-----|----------|------------|----------|
| 15/07 | 18mm | 340 | 7.2 | 12 | 94% | 1200 m³ |
| 14/07 | 0mm | 310 | 7.1 | 10 | 96% | 1180 m³ |
| 13/07 | 42mm | 380 | 7.4 | 18 | 91% | 1100 m³ |

**Permite:** Comparar chuva × operação

---

### 11. Novo Módulo: /indicadores

**KPIs do Sistema:**

| KPI | Descrição | Meta |
|-----|-----------|------|
| Consumo de água | m³/dia | < 1500 |
| Eficiência tratamento | % | > 95% |
| Disponibilidade equipamentos | % | > 98% |
| MTBF | Horas | > 2000 |
| MTTR | Horas | < 24 |
| Consumo químicos | kg/m³ | < 0.5 |
| Produção | m³/dia | > 1000 |
| Vazão | m³/h | 300-400 |
| Chuva | mm/dia | - |
| Energia | kWh/m³ | < 0.8 |
| Custos | R$/m³ | < 5.00 |

---

### 12. Dashboard com Mapa

**Novo widget:**

```
┌─────────────────────────────────────────────┐
│  🗺 MAPA OPERACIONAL                        │
├─────────────────────────────────────────────┤
│  [Mapa com localização da ETE]              │
│  • Condição meteorológica atual             │
│  • Radar de chuva                           │
│  • Equipamentos críticos (futuro)           │
└─────────────────────────────────────────────┘
```

---

### 13. Serviço de APIs Meteorológicas

**Estrutura:**

```
src/lib/weather/
├── weather.ts              # Interface principal
├── weather-service.ts      # Serviço de consulta
├── weather-types.ts        # Tipos TypeScript
├── weather-cache.ts        # Cache 15-30 min
└── weather-icons.ts        # Mapeamento de ícones
```

**API Recomendada:** OpenWeatherMap (gratuita até 1000 calls/dia)

**Endpoints:**
- Current weather: `api.openweathermap.org/data/2.5/weather`
- Forecast: `api.openweathermap.org/data/2.5/forecast`

---

### 14. Banco de Dados

**Novas tabelas:**

```sql
-- Previsões meteorológicas
CREATE TABLE weather_forecasts (
  id UUID PRIMARY KEY,
  forecast_date DATE,
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  wind_speed NUMERIC(5,2),
  precipitation_probability NUMERIC(5,2),
  precipitation_mm NUMERIC(8,2),
  weather_condition TEXT,
  alert_level TEXT,
  created_at TIMESTAMPTZ
);

-- Alertas meteorológicos
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY,
  type TEXT,
  severity TEXT,
  title TEXT,
  description TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active BOOLEAN
);

-- Impactos operacionais
CREATE TABLE operational_impacts (
  id UUID PRIMARY KEY,
  forecast_id UUID REFERENCES weather_forecasts,
  predicted_flow NUMERIC(10,2),
  predicted_chemical_consumption JSONB,
  predicted_sludge NUMERIC(10,2),
  risk_level TEXT
);
```

---

### 15. Roadmap de Versões

| Versão | Principais Entregas |
|--------|---------------------|
| **1.1** | Dashboard meteorológico, alertas de chuva, histórico climático, impactos operacionais |
| **1.2** | Indicadores (KPIs), painel executivo, envio de alertas por WhatsApp/E-mail, relatórios agendados |
| **2.0** | Integração com SCADA, CLPs, sensores IoT, leitura automática de hidrômetros/horímetros, modelos preditivos com IA |

---

## 🔧 Implementação Técnica

### Fase 1: API Meteorológica (Semana 1)
- [ ] Criar serviço de consulta à API
- [ ] Implementar cache
- [ ] Configurar chaves de API
- [ ] Testar endpoints

### Fase 2: Dashboard Meteorológico (Semana 2)
- [ ] Criar componente WeatherCard
- [ ] Adicionar ao Dashboard
- [ ] Implementar indicador de impacto
- [ ] Testar com dados reais

### Fase 3: Sistema de Alertas (Semana 3)
- [ ] Criar tabela weather_alerts
- [ ] Implementar detecção de chuva
- [ ] Criar componente de alerta
- [ ] Integrar com notificações

### Fase 4: Integrações (Semana 4)
- [ ] Integrar com Checklists
- [ ] Integrar com Manutenção
- [ ] Integrar com Estoque
- [ ] Integrar com Resíduos

### Fase 5: Indicadores e KPIs (Semana 5)
- [ ] Criar módulo /indicadores
- [ ] Implementar cálculos de KPIs
- [ ] Criar gráficos de tendência
- [ ] Dashboard executivo

### Fase 6: Testes e Deploy (Semana 6)
- [ ] Testes de integração
- [ ] Testes de performance
- [ ] Documentação
- [ ] Deploy em produção

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Disponibilidade da API meteorológica | > 99% |
| Tempo de resposta do Dashboard | < 2s |
| Alertas gerados corretamente | 100% |
| Integrações funcionando | 100% |
| KPIs calculados corretamente | 100% |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| API meteorológica fora do ar | Média | Alto | Cache local, fallback manual |
| Dados incorretos | Baixa | Alto | Validação, cruzamento com histórico |
| Performance do Dashboard | Média | Médio | Lazy loading, cache |
| Integrações com módulos | Baixa | Médio | Testes automatizados |

---

## 📚 Referências

- [OpenWeatherMap API](https://openweathermap.org/api)
- [WeatherAPI](https://www.weatherapi.com/)
- [Documentação Supabase](https://supabase.com/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)

---

**Elaborado por:** MiMoCode  
**Data:** 15/07/2026  
**Versão:** 1.0
