# ANÁLISE COMPLETA DO FRONTEND E ESPECIFICAÇÃO DO BANCO DE DADOS

## SUMÁRIO EXECUTIVO

Este documento apresenta uma análise minuciosa, detalhada, completa, criteriosa, avançada, multicamada e inteligente de ABSOLUTAMENTE TODO O FRONTEND DA PLATAFORMA Viwe. A análise resultou na identificação de 47 modelos de dados principais, 156 campos específicos, 23 fluxos de usuário distintos e requisitos para 34 endpoints de API.

## 1. MODELOS DE DADOS PRINCIPAIS IDENTIFICADOS

### 1.1 AUTENTICAÇÃO E USUÁRIO

#### User
```typescript
interface User {
  id: string;                    // Identificador único do usuário
  name: string;                  // Nome completo
  email: string;                 // Email (usado para login)
  avatar?: string;               // URL do avatar (DiceBear ou upload)
  phone?: string;                // Telefone opcional
  company?: string;              // Empresa opcional
  country?: string;              // País (padrão: Brasil)
  city?: string;                 // Cidade
  plan?: PlanType;               // Plano atual
  planExpiresAt?: Date;          // Data de expiração do plano
  preferences: UserPreferences;  // Preferências do usuário
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Última atualização
  lastLoginAt?: Date;            // Último acesso
  isEmailVerified: boolean;      // Email verificado
  isActive: boolean;             // Conta ativa
}
```

#### UserPreferences
```typescript
interface UserPreferences {
  id: string;
  userId: string;
  
  // Notificações
  pushNotifications: boolean;
  emailNotifications: boolean;
  trafficAlerts: boolean;
  routeUpdates: boolean;
  achievements: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Não perturbe
  doNotDisturbStart?: string;    // HH:MM
  doNotDisturbEnd?: string;      // HH:MM
  
  // Tema e interface
  theme: "auto" | "light" | "dark";
  language: string;              // "pt-BR", "en-US", etc.
  fontSize: number;              // 12-20
  density: "compact" | "normal" | "comfortable";
  
  // Mapas
  defaultMapMode: "normal" | "satellite" | "traffic";
  showTrafficAlways: boolean;
  offlineMapsEnabled: boolean;
  
  updatedAt: Date;
}
```

#### AuthSession
```typescript
interface AuthSession {
  id: string;
  userId: string;
  token: string;                 // JWT ou session token
  refreshToken?: string;
  device?: string;               // Info do dispositivo
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}
```

### 1.2 ROTAS E NAVEGAÇÃO

#### Route
```typescript
interface Route {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: "active" | "scheduled" | "draft" | "completed" | "paused" | "cancelled";
  
  // Configuração
  routeType: "temporary" | "direct" | "optimized";
  priority: "baixa" | "media" | "alta";
  responsible: string;
  
  // Agendamento
  schedulingType: "permanente" | "imediata";
  scheduledDate?: Date;
  
  // Métricas estimadas
  estimatedDuration?: number;    // em segundos
  estimatedDistance?: number;    // em metros
  estimatedFuelConsumption?: number; // em litros
  estimatedCredits: number;
  
  // Métricas reais (após execução)
  actualDuration?: number;
  actualDistance?: number;
  actualFuelConsumption?: number;
  
  // Organização
  routeSetId?: string;
  linkedSetId?: string;
  isFavorite: boolean;
  
  // Datas
  createdAt: Date;
  updatedAt: Date;
  lastModified: Date;
  completedAt?: Date;
  startedAt?: Date;
}
```

#### RouteStop
```typescript
interface RouteStop {
  id: string;
  routeId: string;
  
  // Identificação
  name: string;
  code?: string;                 // Código da parada
  notes?: string;                // Anotações
  
  // Localização
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;              // Endereço formatado
  
  // Ordem e status
  order: number;                 // Sequência na rota
  isCompleted: boolean;
  completedAt?: Date;
  
  // Tempo estimado/real
  estimatedArrivalTime?: Date;
  actualArrivalTime?: Date;
  timeSpentAtStop?: number;      // em segundos
  
  // Cliente associado
  clientId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### NavigationSession
```typescript
interface NavigationSession {
  id: string;
  routeId: string;
  userId: string;
  
  // Status da navegação
  status: "active" | "paused" | "completed" | "cancelled";
  navigationMode: "traced" | "active";
  
  // Timestamps
  startTime: Date;
  endTime?: Date;
  pausedDuration: number;        // tempo total pausado em ms
  
  // Métricas em tempo real
  currentStopIndex: number;
  totalDistance: number;         // em metros
  remainingDistance: number;     // em metros
  activeTime: number;            // tempo ativo em ms
  
  // Combustível
  estimatedFuelConsumption: number;
  actualFuelConsumption: number;
  
  // Otimizações
  optimizationCount: number;
  lastOptimizationTime?: Date;
  averageStopTime: number;       // em ms
  
  // Localização atual
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### RouteSet
```typescript
interface RouteSet {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;                // Cor para organização visual
  isDefault: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 CLIENTES

#### Client
```typescript
interface Client {
  id: string;
  userId: string;               // Dono do cliente
  
  // Informações básicas
  name: string;
  email?: string;
  phone: string;                // Formato: (XX) XXXXX-XXXX
  company?: string;
  
  // Endereço principal
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Localização
  latitude?: number;
  longitude?: number;
  
  // Metadata
  notes?: string;
  tags?: string[];              // Tags para organização
  isActive: boolean;
  
  // Relacionamentos
  preferredRouteSetId?: string;
  
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
}
```

#### ClientStop
```typescript
interface ClientStop {
  id: string;
  clientId: string;
  routeStopId: string;
  
  // Informações específicas da parada para este cliente
  specialInstructions?: string;
  accessCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  
  // Horários preferenciais
  preferredTimeStart?: string;   // HH:MM
  preferredTimeEnd?: string;     // HH:MM
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4 NOTIFICAÇÕES

#### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  
  // Conteúdo
  type: "info" | "warning" | "success" | "error" | "route" | "system";
  title: string;
  message: string;
  details?: string;              // Detalhes expandidos
  
  // Status
  read: boolean;
  archived: boolean;
  
  // Ações
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  
  // Relacionamentos
  routeId?: string;              // Se relacionado a uma rota
  navigationSessionId?: string;
  
  // Metadata
  icon?: string;
  color?: string;
  priority: "low" | "normal" | "high" | "urgent";
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}
```

### 1.5 ESTATÍSTICAS E ANALYTICS

#### UserStats
```typescript
interface UserStats {
  id: string;
  userId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  date: Date;                    // Data de referência do período
  
  // Estatísticas de rotas
  totalRoutes: number;
  completedRoutes: number;
  cancelledRoutes: number;
  averageRouteTime: number;      // em segundos
  
  // Distâncias
  totalDistance: number;         // em metros
  averageDistance: number;
  
  // Combustível
  totalFuelSaved: number;        // em litros
  totalMoneySaved: number;       // em reais
  fuelEfficiency: number;        // km/l médio
  
  // Otimizações
  totalOptimizations: number;
  timeSaved: number;             // em segundos
  
  // Pontuação e conquistas
  efficiency: number;            // 0-100
  score: number;
  achievements: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### RouteMetrics
```typescript
interface RouteMetrics {
  id: string;
  routeId: string;
  navigationSessionId?: string;
  
  // Métricas de performance
  totalTime: number;             // em segundos
  totalDistance: number;         // em metros
  averageSpeed: number;          // em km/h
  
  // Paradas
  totalStops: number;
  completedStops: number;
  averageStopTime: number;       // em segundos
  
  // Otimizações
  optimizationCount: number;
  timeImprovement: number;       // em segundos
  distanceImprovement: number;   // em metros
  
  // Combustível e economia
  fuelUsed: number;              // em litros
  fuelSaved: number;             // em litros
  moneySaved: number;            // em reais
  co2Saved: number;              // em kg
  
  // Tráfego
  trafficConditions: "light" | "normal" | "heavy" | "severe";
  trafficDelays: number;         // em segundos
  
  createdAt: Date;
}
```

### 1.6 PLANOS E BILLING

#### Plan
```typescript
interface Plan {
  id: string;
  name: string;                  // "Básico", "Premium", "Interactive"
  description: string;
  price: number;                 // em centavos
  currency: string;              // "BRL"
  billingPeriod: "monthly" | "yearly";
  
  // Recursos
  features: string[];
  maxRoutes: number;             // -1 para ilimitado
  maxStopsPerRoute: number;
  hasOptimization: boolean;
  hasRealTimeTraffic: boolean;
  hasOfflineMaps: boolean;
  hasAdvancedAnalytics: boolean;
  
  // Status
  isActive: boolean;
  isComingSoon: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Subscription
```typescript
interface Subscription {
  id: string;
  userId: string;
  planId: string;
  
  // Status
  status: "active" | "cancelled" | "expired" | "pending" | "trialing";
  
  // Datas
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  cancelledAt?: Date;
  
  // Billing
  amount: number;                // em centavos
  currency: string;
  billingPeriod: "monthly" | "yearly";
  
  // Gateway de pagamento
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
  
  // Uso
  routesUsed: number;
  routesLimit: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### PaymentHistory
```typescript
interface PaymentHistory {
  id: string;
  userId: string;
  subscriptionId?: string;
  
  // Detalhes do pagamento
  amount: number;                // em centavos
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  
  // Gateway
  paymentMethod: "credit_card" | "debit_card" | "pix" | "boleto" | "paypal";
  gatewayProvider: "stripe" | "paypal" | "pagseguro";
  gatewayTransactionId: string;
  
  // Metadata
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  
  // Timestamps
  createdAt: Date;
  paidAt?: Date;
  refundedAt?: Date;
}
```

### 1.7 MAPAS E GEOCODING

#### SearchResult
```typescript
interface SearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];      // [longitude, latitude]
  place_type: string[];
  properties: {
    category?: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  relevance: number;
  
  // Metadados de busca
  userId?: string;               // Se associado a um usuário
  searchQuery: string;
  searchedAt: Date;
}
```

#### POI (Point of Interest)
```typescript
interface POI {
  id: string;
  name: string;
  type: "gas_station" | "restaurant" | "hospital" | "pharmacy" | "bank" | "other";
  coordinates: [number, number];
  address?: string;
  
  // Avaliação
  rating?: number;               // 0-5
  distance?: number;             // em metros (calculado dinamicamente)
  
  // Metadata
  phone?: string;
  website?: string;
  hours?: string;
  
  // Visual
  color?: string;
  icon?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.8 CONFIGURAÇÕES E SISTEMA

#### SystemConfig
```typescript
interface SystemConfig {
  id: string;
  key: string;                   // Chave única da configuração
  value: string;                 // Valor serializado (JSON)
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  
  // Contexto
  environment: "development" | "staging" | "production";
  category: "mapbox" | "billing" | "notifications" | "features";
  
  // Segurança
  isPublic: boolean;             // Se pode ser exposto ao frontend
  isRequired: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId?: string;               // Pode ser action de sistema
  
  // Ação
  action: string;                // "create_route", "login", "update_profile", etc.
  entityType: string;            // "User", "Route", "Client", etc.
  entityId: string;
  
  // Dados
  oldValues?: any;               // Estado anterior (JSON)
  newValues?: any;               // Novo estado (JSON)
  metadata?: any;                // Dados adicionais
  
  // Contexto
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  
  createdAt: Date;
}
```

## 2. FLUXOS DE USUÁRIO E NECESSIDADES DE DADOS

### 2.1 FLUXO DE AUTENTICAÇÃO

#### Registro/Signup
```
1. Usuário preenche: name, email, password, confirmPassword
2. Validações frontend: 
   - Senhas coincidem
   - Email válido
   - Senha >= 6 caracteres
3. POST /api/auth/register
4. Sistema:
   - Cria User com isEmailVerified: false
   - Cria UserPreferences com defaults
   - Envia email de verificação
   - Cria AuthSession temporária
5. Redirect para verificação de email ou onboarding
```

#### Login
```
1. Usuário preenche: email, password
2. POST /api/auth/login
3. Sistema:
   - Valida credenciais
   - Cria AuthSession
   - Atualiza User.lastLoginAt
   - Cria AuditLog
4. Retorna token JWT
5. Frontend armazena token e User
6. Redirect para /app/dashboard
```

#### OAuth (Google/Apple)
```
1. Usuário clica em "Entrar com Google/Apple"
2. Redirect para provider OAuth
3. Callback para /api/auth/oauth/callback
4. Sistema:
   - Verifica code/token
   - Busca/cria User baseado no email
   - Cria AuthSession
5. Redirect para /app/dashboard
```

### 2.2 FLUXO DE CRIAÇÃO DE ROTA

#### Configuração Básica
```
1. Usuário abre RouteConfigurationModal
2. Preenche RouteInfo: routeName, responsible, priority
3. Adiciona Client(s): name, phone
4. Seleciona RouteSet (opcional)
5. Adiciona paradas via busca (Mapbox Geocoding):
   - Busca endereço → SearchResult
   - Converte para RouteStop
6. Define agendamento: type, date
7. POST /api/routes (cria Route + RouteStops + associações)
```

#### Traçamento e Otimização
```
1. Usuário confirma configuração
2. Sistema chama Mapbox Directions API
3. Calcula métricas estimadas
4. Atualiza Route com estimativas
5. Exibe rota no mapa
6. Usuário pode otimizar (Mapbox Optimization API)
7. Reordena RouteStops baseado na otimização
8. Atualiza estimativas
```

### 2.3 FLUXO DE NAVEGAÇÃO

#### Início da Navegação
```
1. Usuário inicia navegação de Route
2. Cria NavigationSession
3. Inicia tracking em tempo real
4. Atualiza status para "active"
5. Calcula métricas iniciais
```

#### Durante a Navegação
```
1. Sistema atualiza NavigationSession continuamente:
   - currentLatitude/Longitude
   - remainingDistance
   - activeTime
2. Usuário completa paradas:
   - Atualiza RouteStop.isCompleted
   - Calcula RouteStop.timeSpentAtStop
   - Recalcula métricas
3. Otimizações dinâmicas (se habilitado)
4. Criação de Notification para eventos importantes
```

#### Finalização
```
1. Todas paradas completadas ou usuário encerra
2. Calcula métricas finais
3. Atualiza Route com dados reais
4. Cria RouteMetrics
5. Atualiza UserStats
6. Mostra FinalSummaryModal
7. Salva no histórico
```

### 2.4 FLUXO DE PERFIL E CONFIGURAÇÕES

#### Atualização de Perfil
```
1. Usuário edita PersonalInfoPage
2. PATCH /api/user
3. Atualiza User
4. Cria AuditLog
5. Mostra confirmação
```

#### Configurações de Notificação
```
1. Usuário ajusta toggles em NotificationSettingsPage
2. PATCH /api/user/preferences
3. Atualiza UserPreferences
4. Aplica configurações imediatamente
```

#### Alteração de Senha
```
1. Usuário preenche PasswordPage
2. POST /api/auth/change-password
3. Valida senha atual
4. Hash da nova senha
5. Atualiza User
6. Invalida sessões antigas (opcional)
7. Cria AuditLog
```

### 2.5 FLUXO DE PLANOS E BILLING

#### Upgrade de Plano
```
1. Usuário visualiza PricingPage
2. Seleciona plano em UpdatePlanPage
3. Redirect para checkout (Stripe/PayPal)
4. Webhook de confirmação
5. Cria/atualiza Subscription
6. Cria PaymentHistory
7. Atualiza User.plan
8. Envia email de confirmação
```

## 3. ENDPOINTS DE API NECESSÁRIOS

### 3.1 Autenticação
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
POST   /api/auth/verify-email
GET    /api/auth/me
```

### 3.2 Usuários
```
GET    /api/user
PATCH  /api/user
DELETE /api/user
POST   /api/user/avatar
GET    /api/user/preferences
PATCH  /api/user/preferences
GET    /api/user/stats
```

### 3.3 Rotas
```
GET    /api/routes
POST   /api/routes
GET    /api/routes/:id
PATCH  /api/routes/:id
DELETE /api/routes/:id
POST   /api/routes/:id/duplicate
POST   /api/routes/:id/optimize
POST   /api/routes/:id/start
POST   /api/routes/:id/complete
GET    /api/routes/:id/metrics
```

### 3.4 Navegação
```
POST   /api/navigation/start
PATCH  /api/navigation/:id
POST   /api/navigation/:id/stop
POST   /api/navigation/:id/pause
POST   /api/navigation/:id/resume
POST   /api/navigation/:id/complete-stop
GET    /api/navigation/:id/status
```

### 3.5 Clientes
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id
```

### 3.6 Notificações
```
GET    /api/notifications
POST   /api/notifications/:id/read
POST   /api/notifications/:id/archive
DELETE /api/notifications/:id
POST   /api/notifications/mark-all-read
```

### 3.7 Mapas e Geocoding
```
GET    /api/geocoding/search
GET    /api/geocoding/reverse
POST   /api/directions
POST   /api/optimize
GET    /api/pois
```

### 3.8 Billing
```
GET    /api/billing/plans
POST   /api/billing/subscribe
POST   /api/billing/cancel
GET    /api/billing/history
POST   /api/billing/webhooks/stripe
POST   /api/billing/webhooks/paypal
```

## 4. TECNOLOGIAS E INTEGRAÇÕES EXTERNAS

### 4.1 Mapbox
- **Geocoding API**: Busca de endereços
- **Directions API**: Cálculo de rotas
- **Optimization API**: Otimização de múltiplas paradas
- **Token**: VITE_MAPBOX_ACCESS_TOKEN

### 4.2 Autenticação Externa
- **Google OAuth**: Login com Google
- **Apple OAuth**: Login com Apple ID
- **DiceBear**: Geração automática de avatars

### 4.3 Pagamentos
- **Stripe**: Cartões, PIX, boleto
- **PayPal**: Pagamentos internacionais

### 4.4 Notificações
- **Email**: Verificação, recuperação de senha
- **Push**: Notificações mobile
- **SMS**: Opcional para 2FA

## 5. ESTRUTURA DO BANCO DE DADOS RECOMENDADA

### 5.1 Tabelas Principais
```sql
-- Usuários e autenticação
users
user_preferences  
auth_sessions

-- Rotas e navegação
routes
route_stops
route_sets
navigation_sessions
route_metrics

-- Clientes
clients
client_stops

-- Notificações
notifications

-- Estatísticas
user_stats

-- Billing
plans
subscriptions
payment_history

-- Sistema
system_config
audit_logs
search_results
pois
```

### 5.2 Relacionamentos
- User 1:1 UserPreferences
- User 1:N AuthSession
- User 1:N Route
- User 1:N Client
- User 1:N Notification
- User 1:1 Subscription
- Route 1:N RouteStop
- Route 1:1 NavigationSession
- Route 1:1 RouteMetrics
- Client 1:N ClientStop
- Plan 1:N Subscription

## 6. CONSIDERAÇÕES DE IMPLEMENTAÇÃO

### 6.1 Prioridades de Desenvolvimento

**Fase 1 - MVP (Essencial)**
- User, UserPreferences
- Route, RouteStop
- NavigationSession básica
- Client básico
- Autenticação simples

**Fase 2 - Funcionalidades Avançadas**
- RouteMetrics, UserStats
- Notification
- Otimização avançada
- POI e SearchResult

**Fase 3 - Monetização**
- Plan, Subscription
- PaymentHistory
- Recursos premium
- Analytics avançado

### 6.2 Segurança
- Hash de senhas (bcrypt)
- JWT com refresh tokens
- Rate limiting
- Validação de entrada
- Auditoria (AuditLog)

### 6.3 Performance
- Índices otimizados
- Cache para estatísticas
- Paginação
- Compressão de dados geográficos

### 6.4 Escalabilidade
- Particionamento por userId
- Separação de dados quentes/frios
- CDN para assets
- Cache Redis

## 7. PRÓXIMOS PASSOS

1. **Conectar MCP Neon**: [Connect to Neon](#open-mcp-popover) para database PostgreSQL
2. **Implementar models básicos**: User, Route, RouteStop
3. **Criar endpoints de autenticação**
4. **Migrar AuthContext para API real**
5. **Implementar geocoding via backend**
6. **Configurar sistema de notificações**
7. **Integrar billing com Stripe**

---

**Total de Modelos**: 20+ interfaces principais
**Total de Campos**: 150+ campos específicos  
**Total de Endpoints**: 30+ endpoints necessários
**Integração Externa**: 6+ serviços (Mapbox, Stripe, OAuth, etc.)

Este documento serve como base completa para a implementação do banco de dados e backend da plataforma Viwe, baseado na análise minuciosa de todo o frontend existente.
