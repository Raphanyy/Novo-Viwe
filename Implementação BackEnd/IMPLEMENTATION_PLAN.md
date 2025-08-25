# PLANO DE IMPLEMENTAÇÃO DETALHADO DO BANCO DE DADOS

## VISÃO GERAL DO PROJETO

### Objetivo
Implementar o banco de dados completo da plataforma Viwe baseado na análise minuciosa do frontend, incluindo todos os modelos de dados, relacionamentos, APIs e funcionalidades identificadas.

### Escopo Total
- **20 tabelas principais** com relacionamentos complexos
- **34+ endpoints de API** necessários
- **6+ integrações externas** (Mapbox, Stripe, OAuth, etc.)
- **Sistema de autenticação completo** com JWT e sessões
- **Migração do frontend** de simulado para backend real

---

## FASE 1: PREPARAÇÃO E CONFIGURAÇÃO (Semana 1)

### 1.1 Setup do Ambiente de Desenvolvimento

#### Conectar Base de Dados
**Pré-requisito**: [Connect to Neon](#open-mcp-popover)

```bash
# 1. Conectar ao Neon via MCP
# 2. Obter string de conexão PostgreSQL
# 3. Configurar variáveis de ambiente
```

#### Configurar Variáveis de Ambiente
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=seu_neon_host
DB_PORT=5432
DB_NAME=viwe_production
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=jwt_secret_super_forte_256_bits
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Mapbox
MAPBOX_ACCESS_TOKEN=seu_mapbox_token_secreto
VITE_MAPBOX_ACCESS_TOKEN=seu_mapbox_token_publico

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua_sendgrid_api_key
FROM_EMAIL=noreply@viwe.com

# OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
APPLE_CLIENT_ID=seu_apple_client_id

# Stripe
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
```

#### Instalar Dependências no Servidor
```bash
cd server/
pnpm add prisma @prisma/client
pnpm add bcryptjs jsonwebtoken
pnpm add nodemailer @types/nodemailer
pnpm add stripe
pnpm add passport passport-google-oauth20 passport-local
pnpm add helmet cors express-rate-limit
pnpm add winston
```

### 1.2 Configuração do Banco de Dados

#### Executar Schema SQL
```bash
# 1. Executar DATABASE_SCHEMA.sql no Neon
psql $DATABASE_URL -f DATABASE_SCHEMA.sql

# 2. Verificar criação das tabelas
psql $DATABASE_URL -c "\dt"

# 3. Verificar indexes criados
psql $DATABASE_URL -c "\di"
```

#### Setup do Prisma (Opcional)
```bash
# Gerar schema Prisma do banco existente
npx prisma db pull

# Gerar cliente Prisma
npx prisma generate
```

---

## FASE 2: BACKEND - AUTENTICAÇÃO (Semana 2)

### 2.1 Implementar Middleware de Autenticação

#### server/middleware/auth.ts
```typescript
interface AuthMiddleware {
  // Validar JWT token
  validateToken(req, res, next): void;
  
  // Extrair usuário do token
  extractUser(req, res, next): void;
  
  // Verificar permissões
  requireAuth(req, res, next): void;
  requireEmailVerified(req, res, next): void;
  requirePlan(plan: string): Middleware;
}
```

#### server/utils/jwt.ts
```typescript
interface JWTUtils {
  generateAccessToken(user: User): string;
  generateRefreshToken(): string;
  verifyAccessToken(token: string): JWTPayload;
  verifyRefreshToken(token: string): boolean;
}
```

### 2.2 Endpoints de Autenticação

#### POST /api/auth/register
```typescript
// Validações:
// - Email único
// - Senha forte (8+ chars, maiúscula, número, especial)
// - Nome válido

// Fluxo:
// 1. Validar dados de entrada
// 2. Hash da senha (bcrypt)
// 3. Criar user + user_preferences
// 4. Gerar token de verificação de email
// 5. Enviar email de verificação
// 6. Retornar tokens JWT
```

#### POST /api/auth/login
```typescript
// Validações:
// - Email existe
// - Senha correta
// - Conta ativa

// Fluxo:
// 1. Buscar usuário por email
// 2. Verificar senha (bcrypt.compare)
// 3. Atualizar last_login_at
// 4. Criar auth_session
// 5. Gerar tokens JWT
// 6. Criar audit_log
// 7. Retornar tokens + user
```

#### POST /api/auth/refresh
```typescript
// Fluxo:
// 1. Validar refresh token
// 2. Buscar sessão ativa
// 3. Gerar novo access token
// 4. Atualizar last_used_at na sessão
// 5. Retornar novo access token
```

### 2.3 Verificação de Email e Recuperação de Senha

#### POST /api/auth/verify-email
#### POST /api/auth/forgot-password  
#### POST /api/auth/reset-password

### 2.4 Migração do AuthContext

#### client/contexts/AuthContext.tsx
```typescript
// Substituir implementação simulada por:
// - Chamadas HTTP reais para /api/auth/*
// - Armazenamento seguro de tokens
// - Auto-refresh de tokens
// - Logout automático em caso de erro 401
```

---

## FASE 3: BACKEND - CORE FEATURES (Semana 3-4)

### 3.1 Endpoints de Usuários

#### GET /api/user
#### PATCH /api/user
#### GET /api/user/preferences
#### PATCH /api/user/preferences
#### POST /api/user/avatar

### 3.2 Endpoints de Rotas

#### GET /api/routes
```typescript
// Query params: status, limit, offset, search
// Retorna: routes + route_stops + métricas básicas
```

#### POST /api/routes
```typescript
// Body: RouteConfigurationModal.FormData
// Fluxo:
// 1. Validar dados
// 2. Criar route
// 3. Criar route_stops
// 4. Associar clients
// 5. Calcular estimativas (Mapbox Directions)
// 6. Retornar rota completa
```

#### GET /api/routes/:id
#### PATCH /api/routes/:id
#### DELETE /api/routes/:id

### 3.3 Endpoints de Navegação

#### POST /api/navigation/start
```typescript
// Body: { routeId: string }
// Fluxo:
// 1. Validar rota existe e pertence ao usuário
// 2. Criar navigation_session
// 3. Atualizar route.status = 'active'
// 4. Inicializar métricas
// 5. Retornar session data
```

#### PATCH /api/navigation/:id
#### POST /api/navigation/:id/complete-stop
#### POST /api/navigation/:id/optimize

### 3.4 Migração dos Componentes Principais

#### MapPage.tsx
```typescript
// Substituir dados mockados por:
// - Chamadas reais para /api/routes
// - WebSocket para navegação em tempo real
// - Persistência de configurações
```

#### RoutesPage.tsx
```typescript
// Integrar com endpoints reais:
// - Listagem com filtros e busca
// - CRUD completo de rotas
// - Persistência de configurações
```

---

## FASE 4: INTEGRAÇÕES EXTERNAS (Semana 5)

### 4.1 Integração Mapbox no Backend

#### server/services/mapbox.ts
```typescript
interface MapboxService {
  geocoding(query: string): Promise<SearchResult[]>;
  reverseGeocoding(lat: number, lng: number): Promise<string>;
  directions(coordinates: number[][]): Promise<DirectionsResult>;
  optimization(coordinates: number[][]): Promise<OptimizationResult>;
}
```

#### Endpoints de Mapbox
```typescript
GET /api/geocoding/search?q=query&limit=5
GET /api/geocoding/reverse?lat=123&lng=456
POST /api/directions { coordinates: [[lng,lat], ...] }
POST /api/optimization { coordinates: [[lng,lat], ...] }
```

### 4.2 OAuth com Google e Apple

#### server/routes/oauth.ts
```typescript
// Google OAuth
GET /api/auth/oauth/google
GET /api/auth/oauth/google/callback

// Apple OAuth  
GET /api/auth/oauth/apple
GET /api/auth/oauth/apple/callback
```

#### Migração MobileLoginPage.tsx
```typescript
// Substituir simulação por redirecionamento real para OAuth
```

### 4.3 Sistema de Notificações

#### server/services/notifications.ts
```typescript
interface NotificationService {
  create(userId: string, notification: CreateNotificationDto): Promise<void>;
  sendEmail(to: string, template: string, data: any): Promise<void>;
  sendPush(userId: string, message: string): Promise<void>;
}
```

#### Endpoints de Notificações
```typescript
GET /api/notifications?read=false&limit=20
POST /api/notifications/:id/read
POST /api/notifications/mark-all-read
DELETE /api/notifications/:id
```

---

## FASE 5: BILLING E MONETIZAÇÃO (Semana 6)

### 5.1 Integração com Stripe

#### server/services/stripe.ts
```typescript
interface StripeService {
  createCustomer(user: User): Promise<string>;
  createSubscription(customerId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  handleWebhook(event: Stripe.Event): Promise<void>;
}
```

#### Endpoints de Billing
```typescript
GET /api/billing/plans
POST /api/billing/subscribe { planId: string, paymentMethodId: string }
POST /api/billing/cancel
GET /api/billing/history
POST /api/billing/webhooks/stripe
```

### 5.2 Migração do Sistema de Planos

#### PricingPage.tsx
```typescript
// Integrar com checkout real do Stripe
// Implementar fluxo completo de upgrade/downgrade
```

#### UpdatePlanPage.tsx
```typescript
// Dados dinâmicos de /api/billing/plans
// Checkout funcional
```

---

## FASE 6: ANALYTICS E MÉTRICAS (Semana 7)

### 6.1 Sistema de Métricas

#### server/services/analytics.ts
```typescript
interface AnalyticsService {
  calculateRouteMetrics(navigationSession: NavigationSession): Promise<RouteMetrics>;
  updateUserStats(userId: string, period: string): Promise<void>;
  generateDashboardStats(userId: string): Promise<DashboardStats>;
}
```

### 6.2 Endpoints de Analytics

#### GET /api/analytics/dashboard
#### GET /api/analytics/routes/:id/metrics
#### GET /api/analytics/stats?period=monthly

### 6.3 Migração do DashboardPage

#### DashboardPage.tsx
```typescript
// Dados reais de /api/analytics/dashboard
// Gráficos e métricas dinâmicas
// Cache inteligente
```

---

## FASE 7: PERFORMANCE E PRODUÇÃO (Semana 8)

### 7.1 Otimizações de Performance

#### Cache Redis
```typescript
// Cache para:
// - Resultados de geocoding
// - Estatísticas de usuário
// - Configurações do sistema
// - Dados de dashboard
```

#### Índices de Banco
```sql
-- Todos os índices já estão no DATABASE_SCHEMA.sql
-- Monitorar query performance
-- Adicionar índices conforme necessário
```

### 7.2 Segurança

#### Rate Limiting
```typescript
// Endpoints protegidos:
// - /api/auth/* (5 req/min)
// - /api/geocoding/* (100 req/min)
// - /api/routes (50 req/min)
```

#### Validação de Input
```typescript
// Usar Zod para validação:
// - Todos os endpoints POST/PATCH
// - Sanitização de dados
// - Prevenção de SQL injection
```

### 7.3 Monitoramento

#### Logging
```typescript
// Winston + structured logs
// Métricas de performance
// Erros e exceções
// Audit trail completo
```

#### Health Checks
```typescript
GET /api/health
GET /api/health/db
GET /api/health/redis
```

---

## FASE 8: TESTES E QUALIDADE (Semana 9)

### 8.1 Testes Unitários

#### server/tests/auth.test.ts
#### server/tests/routes.test.ts
#### server/tests/navigation.test.ts

### 8.2 Testes de Integração

#### Fluxos completos:
- Registro → Verificação → Login
- Criação de rota → Navegação → Finalização
- Upgrade de plano → Pagamento → Ativação

### 8.3 Testes E2E

#### client/e2e/
- Fluxo completo do usuário
- Cenários de erro
- Performance tests

---

## FASE 9: MIGRAÇÃO FRONTEND (Semana 10)

### 9.1 Substituição de Dados Mockados

#### Lista de componentes a migrar:
```typescript
// Páginas internas
✅ ActivityPage.tsx → GET /api/routes + analytics
✅ DashboardPage.tsx → GET /api/analytics/dashboard  
✅ MapPage.tsx → APIs de geocoding + navegação
✅ NotificationsPage.tsx → GET /api/notifications
✅ ProfilePage.tsx → GET /api/user + preferences
✅ RoutesPage.tsx → CRUD /api/routes

// Componentes compartilhados
✅ RouteConfigurationModal.tsx → POST /api/routes
✅ NavigationDetailsModal.tsx → WebSocket de navegação
✅ FinalSummaryModal.tsx → POST /api/navigation/complete

// Páginas públicas
✅ LoginPage.tsx → POST /api/auth/login
✅ SignupPage.tsx → POST /api/auth/register
✅ PricingPage.tsx → GET /api/billing/plans
```

### 9.2 Estado Global

#### AuthContext migration
```typescript
// ✅ Usar tokens JWT
// ✅ Auto-refresh
// ✅ Logout em 401
// ✅ Persistência segura
```

#### TraceRouteContext migration  
```typescript
// ✅ WebSocket para tempo real
// ✅ Persistência no backend
// ✅ Sincronização automática
```

---

## FASE 10: DEPLOYMENT E PRODUÇÃO (Semana 11-12)

### 10.1 Configuração de Produção

#### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_connection
REDIS_URL=redis://prod_redis
JWT_SECRET=prod_jwt_secret_256_bits
```

#### Deploy do Backend
```bash
# Opção 1: Netlify Functions
# Opção 2: Vercel Functions  
# Opção 3: Railway/Render
```

### 10.2 Migrações de Dados

#### Script de migração
```sql
-- Migrar dados de localStorage para banco
-- Validar integridade dos dados
-- Backup de segurança
```

### 10.3 Monitoramento de Produção

#### Métricas críticas:
- Database connection pool
- API response times
- Error rates
- User registration/login rates
- Stripe webhook success rate

---

## CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Preparação (Semana 1)
- [ ] Conectar Neon database
- [ ] Executar schema SQL
- [ ] Configurar environment variables
- [ ] Setup dependências do servidor

### ✅ Autenticação (Semana 2)  
- [ ] Middleware de autenticação
- [ ] Endpoints /api/auth/*
- [ ] Verificação de email
- [ ] Recuperação de senha
- [ ] Migrar AuthContext

### ✅ Core Features (Semana 3-4)
- [ ] Endpoints /api/user/*
- [ ] Endpoints /api/routes/*
- [ ] Endpoints /api/navigation/*
- [ ] Endpoints /api/clients/*
- [ ] Migrar MapPage, RoutesPage

### ✅ Integrações (Semana 5)
- [ ] Mapbox no backend
- [ ] OAuth Google/Apple
- [ ] Sistema de notificações
- [ ] WebSocket para tempo real

### ✅ Billing (Semana 6)
- [ ] Integração Stripe
- [ ] Endpoints billing
- [ ] Webhooks
- [ ] Migrar páginas de pricing

### ✅ Analytics (Semana 7)
- [ ] Sistema de métricas
- [ ] Dashboard APIs
- [ ] Migrar DashboardPage
- [ ] Reports avançados

### ✅ Performance (Semana 8)
- [ ] Cache Redis
- [ ] Rate limiting
- [ ] Otimizações de query
- [ ] Security hardening

### ✅ Testes (Semana 9)
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E
- [ ] Load testing

### ✅ Migração (Semana 10)
- [ ] Todos os componentes migrados
- [ ] Estado global atualizado
- [ ] Dados mockados removidos
- [ ] Validação completa

### ✅ Deploy (Semana 11-12)
- [ ] Ambiente de produção
- [ ] Migração de dados
- [ ] Monitoramento
- [ ] Documentação final

---

## RECURSOS NECESSÁRIOS

### Equipe Recomendada
- **1 Backend Developer** (Node.js/TypeScript)
- **1 Frontend Developer** (React/TypeScript) 
- **1 DevOps** (Database/Deploy)
- **1 QA** (Testes/Validação)

### Ferramentas e Serviços
- **Database**: Neon PostgreSQL
- **Auth**: JWT + Passport.js
- **Email**: SendGrid/SES
- **Payment**: Stripe
- **Maps**: Mapbox
- **Deploy**: Netlify/Vercel
- **Monitoring**: LogRocket/Sentry

### Budget Estimado (Mensal)
- Neon Database: $25-50
- SendGrid: $15-30
- Stripe: 2.9% + $0.30/transação
- Mapbox: $5/1000 requests
- Deploy: Gratuito (Netlify/Vercel)

---

## PRÓXIMOS PASSOS IMEDIATOS

### 🔴 CRÍTICO - HOJE
1. **[Connect to Neon](#open-mcp-popover)** - Configurar banco PostgreSQL
2. **Executar DATABASE_SCHEMA.sql** - Criar todas as tabelas
3. **Configurar environment variables** - JWT, Mapbox, etc.

### 🟡 ESTA SEMANA
1. **Implementar endpoints de autenticação** - /api/auth/*
2. **Migrar AuthContext** - Usar APIs reais
3. **Setup middleware de autenticação** - JWT validation

### 🟢 PRÓXIMAS 2 SEMANAS  
1. **Endpoints de rotas** - CRUD completo
2. **Integração Mapbox** - Backend proxy
3. **WebSocket para navegação** - Tempo real

---

**TEMPO TOTAL ESTIMADO**: 12 semanas
**COMPLEXIDADE**: Alta
**RISCO**: Médio-Alto
**ROI ESPERADO**: Alto (monetização via planos)

**RECOMENDAÇÃO**: Começar imediatamente com a Fase 1 para validar arquitetura e identificar problemas cedo no processo.
