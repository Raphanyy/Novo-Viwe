# 📋 TarefasMVP - Plataforma Viwe
## Análise Completa e Roadmap para MVP Funcional

---

## 📊 **RESUMO EXECUTIVO**

**Status Atual:** Plataforma com 70% da infraestrutura implementada
**Tempo Estimado para MVP:** 3-4 semanas (80-120 horas)
**Prioridade:** Completar funcionalidades core e conectar frontend ↔ backend

---

## 🎯 **TAREFAS CRÍTICAS** (Semana 1)
*Sem essas tarefas, o MVP não funciona*

### 🗄️ **1. DATABASE & SCHEMA**
- [ ] **1.1** Criar migrations SQL completas para todas as 19 tabelas
  - users, user_preferences, auth_sessions
  - routes, route_stops, route_sets
  - navigation_sessions, route_metrics, user_stats
  - clients, client_stops, notifications
  - plans, subscriptions, payment_history
  - search_results, pois, system_config, audit_logs
- [ ] **1.2** Criar script de seed com dados essenciais
  - Usuário admin padrão
  - Planos básicos (basic, premium, interactive)
  - POIs essenciais por categoria
  - Configurações do sistema
- [ ] **1.3** Implementar sistema de migrations automático
- [ ] **1.4** Documentar schema completo

**Tempo estimado:** 12-16 horas

### 🔌 **2. CONECTAR FRONTEND ↔ BACKEND**
- [ ] **2.1** Substituir dados mock por chamadas API reais
  - RoutesPage: usar GET /api/routes
  - RouteConfigurationModal: usar POST /api/routes
  - Dashboard: usar endpoints de stats
- [ ] **2.2** Implementar interceptors HTTP para auth
  - Auto-refresh de tokens
  - Retry com novo token
  - Logout automático se unauthorized
- [ ] **2.3** Tratamento de erros padronizado
- [ ] **2.4** Loading states em todas as operações

**Tempo estimado:** 16-20 horas

### 🗺️ **3. MAPBOX CONFIGURAÇÃO COMPLETA**
- [ ] **3.1** Configurar token Mapbox em produção
- [ ] **3.2** Validar todas as APIs Mapbox funcionando
  - Geocoding ✅
  - Directions ✅ 
  - Optimization ⚠️ (completar cálculos)
  - Matrix ✅
  - Isochrone ✅
- [ ] **3.3** Implementar fallback para token inválido
- [ ] **3.4** Cache de resultados Mapbox

**Tempo estimado:** 8-12 horas

### 🔐 **4. AUTENTICAÇÃO ROBUSTA**
- [ ] **4.1** Implementar middleware requireEmailVerified
- [ ] **4.2** Sistema de refresh tokens automático
- [ ] **4.3** Logout em todas as sessões
- [ ] **4.4** Rate limiting por usuário
- [ ] **4.5** Validação de dados de entrada

**Tempo estimado:** 10-14 horas

---

## ⚡ **TAREFAS ESSENCIAIS** (Semana 2)
*Core features que definem o produto*

### 🧭 **5. NAVEGAÇÃO EM TEMPO REAL**
- [ ] **5.1** Implementar WebSocket para updates em tempo real
- [ ] **5.2** Sistema de tracking de localização GPS
- [ ] **5.3** Cálculo de ETA dinâmico
- [ ] **5.4** Notificações de desvios de rota
- [ ] **5.5** Sincronização multi-dispositivo

**Tempo estimado:** 20-24 horas

### 🗺️ **6. INTERFACE DE NAVEGAÇÃO**
- [ ] **6.1** UI turn-by-turn com instruções visuais
- [ ] **6.2** Renderização de passos de navegação
- [ ] **6.3** Indicador de progresso da rota
- [ ] **6.4** Botões de controle (pausar/retomar/parar)
- [ ] **6.5** Modo noturno para navegação
- [ ] **6.6** Síntese de voz (opcional)

**Tempo estimado:** 16-20 horas

### 🛣️ **7. SISTEMA DE ROTAS COMPLETO**
- [ ] **7.1** Criar rota com múltiplas paradas
- [ ] **7.2** Editar rota existente
- [ ] **7.3** Duplicar e compartilhar rotas
- [ ] **7.4** Histórico de rotas percorridas
- [ ] **7.5** Favoritar rotas
- [ ] **7.6** Filtros e busca avançada

**Tempo estimado:** 14-18 horas

### 📍 **8. PONTOS DE INTERESSE (POIs)**
- [ ] **8.1** Visualização de POIs no mapa
- [ ] **8.2** Categorias dinâmicas
- [ ] **8.3** POIs personalizados do usuário
- [ ] **8.4** Busca de POIs próximos
- [ ] **8.5** Detalhes e avaliações de POIs
- [ ] **8.6** Integração com rota (adicionar parada)

**Tempo estimado:** 12-16 horas

---

## 🚀 **TAREFAS IMPORTANTES** (Semana 3)
*Funcionalidades avançadas que agregam valor*

### 💳 **9. SISTEMA DE BILLING & PLANOS**
- [ ] **9.1** Implementar middleware requirePlan
- [ ] **9.2** Limits por plano (requests/mês)
- [ ] **9.3** Upgrade/downgrade de planos
- [ ] **9.4** Webhook Stripe completo
- [ ] **9.5** Histórico de pagamentos
- [ ] **9.6** Sistema de créditos

**Tempo estimado:** 16-20 horas

### 🔔 **10. SISTEMA DE NOTIFICAÇÕES**
- [ ] **10.1** Notificações push no navegador
- [ ] **10.2** Notificações por email
- [ ] **10.3** Central de notificações
- [ ] **10.4** Preferências de notificação
- [ ] **10.5** Notificações de navegação automáticas

**Tempo estimado:** 10-14 horas

### 📊 **11. MÉTRICAS & ANALYTICS**
- [ ] **11.1** Dashboard de estatísticas pessoais
- [ ] **11.2** Relatórios de uso
- [ ] **11.3** Métricas de economia (tempo/combustível)
- [ ] **11.4** Comparativo de rotas
- [ ] **11.5** Insights de padrões de uso
- [ ] **11.6** Exportar dados

**Tempo estimado:** 12-16 horas

### ⚡ **12. OTIMIZAÇÃO DE ROTAS**
- [ ] **12.1** Algoritmo de otimização multi-critério
- [ ] **12.2** Cálculo de economia real
- [ ] **12.3** Sugestões de melhorias
- [ ] **12.4** Comparação antes/depois
- [ ] **12.5** Otimização em tempo real
- [ ] **12.6** Consideração de trânsito

**Tempo estimado:** 18-22 horas

---

## 💎 **TAREFAS DESEJÁVEIS** (Semana 4)
*Polimento e produção*

### 🧪 **13. TESTES & QUALIDADE**
- [ ] **13.1** Testes unitários backend (80% coverage)
- [ ] **13.2** Testes de integração API
- [ ] **13.3** Testes E2E frontend
- [ ] **13.4** Testes de performance
- [ ] **13.5** Testes de carga
- [ ] **13.6** Setup CI/CD

**Tempo estimado:** 16-20 horas

### 📱 **14. RESPONSIVIDADE & MOBILE**
- [ ] **14.1** Layout mobile-first otimizado
- [ ] **14.2** Gestos touch no mapa
- [ ] **14.3** Modo landscape para navegação
- [ ] **14.4** PWA (Progressive Web App)
- [ ] **14.5** Instalação como app
- [ ] **14.6** Offline básico

**Tempo estimado:** 14-18 horas

### 🔧 **15. INFRAESTRUTURA & MONITORAMENTO**
- [ ] **15.1** Logging estruturado
- [ ] **15.2** Health checks avançados
- [ ] **15.3** Monitoramento de performance
- [ ] **15.4** Alertas automáticos
- [ ] **15.5** Backup automático
- [ ] **15.6** CDN para assets

**Tempo estimado:** 12-16 horas

### 🎨 **16. UX/UI POLIMENTO**
- [ ] **16.1** Animações e transições
- [ ] **16.2** Skeleton loading
- [ ] **16.3** Feedback visual aprimorado
- [ ] **16.4** Acessibilidade (WCAG)
- [ ] **16.5** Temas personalizáveis
- [ ] **16.6** Tutoriais interativos

**Tempo estimado:** 10-14 horas

---

## 🔧 **TAREFAS TÉCNICAS ESPECÍFICAS**

### 🗃️ **DATABASE MIGRATIONS NECESSÁRIAS**
```sql
-- Exemplo da estrutura necessária
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  plan_type VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- + 18 outras tabelas...
```

### 🔌 **ENDPOINTS A IMPLEMENTAR/CORRIGIR**
```typescript
// Faltando implementar:
POST   /api/routes/:id/optimize
GET    /api/user/stats
POST   /api/navigation/:id/waypoint
GET    /api/pois/search
PATCH  /api/user/preferences
POST   /api/routes/:id/share
```

### 🎯 **COMPONENTES FRONTEND PRIORITÁRIOS**
```typescript
// Componentes críticos a criar:
- NavigationInterface.tsx
- TurnByTurnInstructions.tsx
- RouteOptimizationModal.tsx
- POIDetailsModal.tsx
- NotificationCenter.tsx
- BillingDashboard.tsx
```

---

## 📈 **CRONOGRAMA SUGERIDO**

### **Semana 1: Fundação** (40h)
- Database & Schema (16h)
- Frontend ↔ Backend (20h)
- Mapbox & Auth (4h)

### **Semana 2: Core Features** (40h)
- Navegação Tempo Real (24h)
- Interface Navegação (16h)

### **Semana 3: Features Avançadas** (40h)
- Sistema Rotas (18h)
- POIs Completo (16h)
- Billing Básico (6h)

### **Semana 4: Polimento** (40h)
- Testes (20h)
- Mobile/Responsivo (12h)
- Infraestrutura (8h)

---

## ⚠️ **RISCOS & DEPENDÊNCIAS**

### **🔴 RISCOS ALTOS**
- Schema do banco incompleto pode bloquear desenvolvimento
- Token Mapbox inválido quebra funcionalidades core
- WebSocket pode ter complexidade não prevista

### **🟡 RISCOS MÉDIOS**
- Performance do banco com muitos POIs
- Rate limits Mapbox em produção
- Complexidade do billing com Stripe

### **🟢 RISCOS BAIXOS**
- Testes podem ser feitos após MVP
- Mobile pode ser otimizado depois
- Monitoramento não bloqueia funcionamento

---

## 🎯 **CRITÉRIOS DE SUCESSO DO MVP**

### **✅ MÍNIMO VIÁVEL:**
1. Usuário consegue fazer login/cadastro
2. Usuário consegue criar uma rota com múltiplas paradas
3. Usuário consegue iniciar navegação e receber instruções
4. Sistema atualiza localização em tempo real
5. Usuário consegue ver POIs no mapa
6. Sistema funciona no desktop e mobile básico

### **🏆 IDEAL:**
- Todas as tarefas críticas + essenciais
- 80% das tarefas importantes
- Funcionalidade offline básica
- Performance excelente (<2s carregamento)

---

## 📝 **NOTAS IMPORTANTES**

1. **Priorizar sempre funcionalidade sobre polimento**
2. **Testar cada feature antes de partir para próxima**
3. **Manter backup do banco durante desenvolvimento**
4. **Documentar APIs conforme implementa**
5. **Considerar limitações de rate limit do Mapbox**
6. **Focar em UX da navegação - é o diferencial**

---

**Última atualização:** 2025-01-25  
**Revisão necessária:** Após cada sprint  
**Responsável:** Equipe de desenvolvimento Viwe

---

*Este documento deve ser revisado semanalmente e atualizado conforme o progresso. Tarefas podem ser repriorizadas baseado em feedback de usuários ou limitações técnicas descobertas durante desenvolvimento.*
