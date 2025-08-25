# 🔗 VIWE - COMPILADO COMPLETO

**Data de Compilação:** 2025-01-25  
**Versão da API:** 1.0.0  
**Status do Banco:** 19/19 tabelas ativas  
**Ambiente:** Desenvolvimento/Produção

---

## 📋 ÍNDICE

1. [🚀 **APIS E ENDPOINTS**](#apis-e-endpoints)
2. [🗄️ **QUERIES SQL COMPLETAS**](#queries-sql-completas)
3. [🏗️ **ESTRUTURA DO BANCO DE DADOS**](#estrutura-do-banco-de-dados)
4. [🔧 **CONFIGURAÇÕES E VARIÁVEIS**](#configurações-e-variáveis)
5. [📁 **ARQUITETURA DO PROJETO**](#arquitetura-do-projeto)
6. [🔑 **MIDDLEWARES E SEGURANÇA**](#middlewares-e-segurança)
7. [⚡ **SERVIÇOS INTEGRADOS**](#serviços-integrados)

---

# 🚀 APIS E ENDPOINTS

## **Base URL:** `http://localhost:8080`

### 🔐 **AUTENTICAÇÃO** `/api/auth`

| Método | Endpoint             | Parâmetros                  | Descrição                 |
| ------ | -------------------- | --------------------------- | ------------------------- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | Registrar novo usuário    |
| `POST` | `/api/auth/login`    | `{ email, password }`       | Autenticar usuário        |
| `POST` | `/api/auth/refresh`  | `{ refreshToken }`          | Renovar access token      |
| `POST` | `/api/auth/logout`   | Headers: `Authorization`    | Invalida sessões (logout) |
| `GET`  | `/api/auth/me`       | Headers: `Authorization`    | Dados do usuário atual    |
| `GET`  | `/api/auth/test`     | Headers: `Authorization`    | Teste de autenticação     |

### 🗺️ **ROTAS** `/api/routes`

| Método   | Endpoint            | Parâmetros                                        | Descrição                  |
| -------- | ------------------- | ------------------------------------------------- | -------------------------- |
| `GET`    | `/api/routes`       | `?status&limit&offset&search&orderBy&order`       | Listar rotas do usuário    |
| `GET`    | `/api/routes/:id`   | Path: `id`                                        | Obter rota específica      |
| `POST`   | `/api/routes`       | `{ name, description, stops, clients, routeSet }` | Criar nova rota            |
| `PATCH`  | `/api/routes/:id`   | `{ name, description, status, scheduledDate }`    | Atualizar rota             |
| `DELETE` | `/api/routes/:id`   | Path: `id`                                        | Deletar rota (soft delete) |
| `GET`    | `/api/routes/stats` | -                                                 | Estatísticas das rotas     |

### 🧭 **NAVEGAÇÃO** `/api/navigation`

| Método   | Endpoint                            | Parâmetros                                                | Descrição                   |
| -------- | ----------------------------------- | --------------------------------------------------------- | --------------------------- |
| `POST`   | `/api/navigation/start`             | `{ routeId }`                                             | Iniciar sessão de navegação |
| `PATCH`  | `/api/navigation/:id`               | `{ currentStopIndex, currentLatitude, currentLongitude }` | Atualizar posição           |
| `POST`   | `/api/navigation/:id/pause`         | Path: `id`                                                | Pausar navegação            |
| `POST`   | `/api/navigation/:id/resume`        | Path: `id`                                                | Retomar navegação           |
| `POST`   | `/api/navigation/:id/complete-stop` | `{ stopId, timeSpent, notes }`                            | Completar parada            |
| `POST`   | `/api/navigation/:id/stop`          | `{ reason }`                                              | Finalizar navegação         |
| `DELETE` | `/api/navigation/:id`               | Path: `id`                                                | Cancelar navegação          |
| `GET`    | `/api/navigation/:id`               | Path: `id`                                                | Detalhes da sessão          |

### 🌍 **MAPBOX** `/api/mapbox`

| Método | Endpoint                   | Parâmetros                                          | Descrição                     |
| ------ | -------------------------- | --------------------------------------------------- | ----------------------------- |
| `GET`  | `/api/mapbox/geocoding`    | `?q&limit&country&types&proximity`                  | Geocoding (endereço → coords) |
| `GET`  | `/api/mapbox/reverse`      | `?lat&lng&country&types`                            | Reverse geocoding             |
| `POST` | `/api/mapbox/directions`   | `{ coordinates[], profile, overview, steps }`       | Calcular rota                 |
| `POST` | `/api/mapbox/optimization` | `{ coordinates[], profile, roundtrip }`             | Otimização de rotas           |
| `POST` | `/api/mapbox/matrix`       | `{ coordinates[], profile, sources, destinations }` | Matriz de distâncias          |
| `GET`  | `/api/mapbox/isochrone`    | `?lat&lng&minutes&profile`                          | Calcular isocronas            |
| `GET`  | `/api/mapbox/health`       | -                                                   | Status dos serviços Mapbox    |

### 👤 **USUÁRIOS** `/api/user`

| Método   | Endpoint                        | Parâmetros                                         | Descrição                  |
| -------- | ------------------------------- | -------------------------------------------------- | -------------------------- |
| `GET`    | `/api/user`                     | -                                                  | Dados completos do usuário |
| `PATCH`  | `/api/user`                     | `{ name, phone, company, country, city }`          | Atualizar perfil           |
| `PATCH`  | `/api/user/preferences`         | `{ theme, language, pushNotifications, fontSize }` | Atualizar preferências     |
| `POST`   | `/api/user/avatar`              | `{ avatarUrl }`                                    | Atualizar avatar           |
| `POST`   | `/api/user/change-password`     | `{ currentPassword, newPassword }`                 | Alterar senha              |
| `DELETE` | `/api/user`                     | `{ password, reason }`                             | Excluir conta              |
| `GET`    | `/api/user/sessions`            | -                                                  | Listar sessões ativas      |
| `DELETE` | `/api/user/sessions/:sessionId` | Path: `sessionId`                                  | Revogar sessão             |

### 🏢 **CLIENTES** `/api/clients`

| Método   | Endpoint                    | Parâmetros                                              | Descrição                |
| -------- | --------------------------- | ------------------------------------------------------- | ------------------------ |
| `GET`    | `/api/clients`              | `?search&isActive&limit&offset&orderBy`                 | Listar clientes          |
| `GET`    | `/api/clients/:id`          | Path: `id`                                              | Obter cliente específico |
| `POST`   | `/api/clients`              | `{ name, email, phone, company, address, coordinates }` | Criar cliente            |
| `PATCH`  | `/api/clients/:id`          | `{ name, email, phone, address }`                       | Atualizar cliente        |
| `DELETE` | `/api/clients/:id`          | Path: `id`                                              | Deletar cliente          |
| `POST`   | `/api/clients/:id/activate` | `{ isActive }`                                          | Ativar/desativar cliente |
| `GET`    | `/api/clients/stats`        | -                                                       | Estatísticas de clientes |
| `GET`    | `/api/clients/:id/nearby`   | `?radius`                                               | Clientes próximos        |

### 🔔 **NOTIFICAÇÕES** `/api/notifications`

| Método   | Endpoint                           | Parâmetros                          | Descrição               |
| -------- | ---------------------------------- | ----------------------------------- | ----------------------- |
| `GET`    | `/api/notifications`               | `?read&type&limit&offset&orderBy`   | Listar notificações     |
| `POST`   | `/api/notifications/:id/read`      | Path: `id`                          | Marcar como lida        |
| `POST`   | `/api/notifications/mark-all-read` | -                                   | Marcar todas como lidas |
| `POST`   | `/api/notifications/:id/archive`   | Path: `id`                          | Arquivar notificação    |
| `DELETE` | `/api/notifications/:id`           | Path: `id`                          | Deletar notificação     |
| `POST`   | `/api/notifications/create`        | `{ type, title, message, details }` | Criar notificação       |
| `GET`    | `/api/notifications/stats`         | -                                   | Estatísticas            |

### 💳 **BILLING** `/api/billing`

| Método | Endpoint                       | Parâmetros                    | Descrição                 |
| ------ | ------------------------------ | ----------------------------- | ------------------------- |
| `GET`  | `/api/billing/plans`           | -                             | Listar planos disponíveis |
| `GET`  | `/api/billing/subscription`    | -                             | Assinatura atual          |
| `POST` | `/api/billing/subscribe`       | `{ planId, paymentMethodId }` | Criar assinatura          |
| `POST` | `/api/billing/cancel`          | `{ reason }`                  | Cancelar assinatura       |
| `GET`  | `/api/billing/history`         | `?limit&offset`               | Histórico de pagamentos   |
| `GET`  | `/api/billing/usage`           | -                             | Uso atual da assinatura   |
| `POST` | `/api/billing/webhooks/stripe` | Stripe payload                | Webhook Stripe            |

### 📊 **DASHBOARD** `/api/dashboard`

| Método | Endpoint                       | Parâmetros | Descrição               |
| ------ | ------------------------------ | ---------- | ----------------------- |
| `GET`  | `/api/dashboard/stats`         | -          | Estatísticas gerais     |
| `GET`  | `/api/dashboard/recent-routes` | `?limit`   | Rotas recentes          |
| `GET`  | `/api/dashboard/consumption`   | -          | Dados de consumo        |
| `GET`  | `/api/dashboard/activity`      | `?limit`   | Atividade recente       |
| `GET`  | `/api/dashboard/insights`      | -          | Insights personalizados |

### 📍 **POIS** `/api/pois`

| Método   | Endpoint                     | Parâmetros                                     | Descrição          |
| -------- | ---------------------------- | ---------------------------------------------- | ------------------ |
| `GET`    | `/api/pois`                  | `?lat&lng&radius&category&search&limit`        | Listar POIs        |
| `GET`    | `/api/pois/categories`       | -                                              | Categorias de POIs |
| `GET`    | `/api/pois/:id`              | Path: `id`                                     | Detalhes do POI    |
| `POST`   | `/api/pois`                  | `{ name, category, description, coordinates }` | Criar POI          |
| `PATCH`  | `/api/pois/:id`              | `{ name, description, coordinates }`           | Atualizar POI      |
| `DELETE` | `/api/pois/:id`              | Path: `id`                                     | Deletar POI        |
| `GET`    | `/api/pois/nearby/:lat/:lng` | `?radius&category&limit`                       | POIs próximos      |

### ⚙️ **SISTEMA**

| Método | Endpoint    | Parâmetros | Descrição             |
| ------ | ----------- | ---------- | --------------------- |
| `GET`  | `/health`   | -          | Health check completo |
| `GET`  | `/api`      | -          | Informações da API    |
| `GET`  | `/api/test` | -          | Teste básico          |

---

# 🗄️ QUERIES SQL COMPLETAS

## 🔐 **AUTENTICAÇÃO E USUÁRIOS**

### **Registro de Usuário**

```sql
-- Verificar se email já existe
SELECT id FROM users WHERE email = $1;

-- Criar novo usuário
INSERT INTO users (name, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, name, email, created_at;

-- Criar preferências padrão
INSERT INTO user_preferences (user_id) VALUES ($1);

-- Criar sessão de autenticação
INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at)
VALUES ($1, $2, $3, NOW() + INTERVAL '30 days');
```

### **Login de Usuário**

```sql
-- Buscar usuário por email
SELECT id, name, email, password_hash, is_active, is_email_verified
FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- Atualizar último login
UPDATE users SET last_login_at = NOW() WHERE id = $1;

-- Validar refresh token
SELECT s.*, u.id, u.name, u.email, u.is_active
FROM auth_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.refresh_token = $1 AND s.is_active = true AND s.expires_at > NOW();
```

### **Gestão de Sessões**

```sql
-- Invalidar todas as sessões (logout)
UPDATE auth_sessions SET is_active = FALSE WHERE user_id = $1;

-- Listar sessões ativas
SELECT id, refresh_token, created_at, expires_at, user_agent, ip_address
FROM auth_sessions
WHERE user_id = $1 AND is_active = true AND expires_at > NOW();

-- Revogar sessão específica
UPDATE auth_sessions SET is_active = FALSE
WHERE id = $1 AND user_id = $2;
```

## 🗺️ **ROTAS E NAVEGAÇÃO**

### **Gestão de Rotas**

```sql
-- Listar rotas do usuário
SELECT r.*,
       COUNT(rs.id) as stop_count,
       rm.total_distance,
       rm.estimated_duration,
       rm.fuel_consumption
FROM routes r
LEFT JOIN route_stops rs ON r.id = rs.route_id
LEFT JOIN route_metrics rm ON r.id = rm.route_id
WHERE r.user_id = $1 AND r.deleted_at IS NULL
GROUP BY r.id, rm.id
ORDER BY r.created_at DESC;

-- Criar nova rota
INSERT INTO routes (name, description, user_id, responsible, priority, status, route_type, created_at)
VALUES ($1, $2, $3, $4, $5, 'draft', $6, NOW())
RETURNING *;

-- Criar paradas da rota
INSERT INTO route_stops (route_id, stop_order, name, address, latitude, longitude, client_id, estimated_duration)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- Atualizar rota
UPDATE routes
SET name = $1, description = $2, status = $3, scheduled_date = $4, updated_at = NOW()
WHERE id = $5 AND user_id = $6
RETURNING *;

-- Soft delete rota
UPDATE routes SET deleted_at = NOW() WHERE id = $1 AND user_id = $2;
```

### **Sessões de Navegação**

```sql
-- Iniciar navegação
INSERT INTO navigation_sessions (route_id, user_id, status, navigation_mode, start_time, total_distance, remaining_distance, estimated_fuel_consumption)
VALUES ($1, $2, 'active', $3, NOW(), $4, $4, $5)
RETURNING *;

-- Atualizar posição da navegação
UPDATE navigation_sessions
SET current_stop_index = $1,
    current_latitude = $2,
    current_longitude = $3,
    active_time = $4,
    remaining_distance = $5,
    updated_at = NOW()
WHERE id = $6 AND user_id = $7
RETURNING *;

-- Completar parada
UPDATE route_stops
SET is_completed = true,
    completed_at = NOW(),
    time_spent_at_stop = $1,
    notes = $2
WHERE id = $3
RETURNING *;

-- Verificar se todas as paradas foram completadas
SELECT COUNT(*)
FROM route_stops
WHERE route_id = $1 AND is_completed = false;

-- Finalizar navegação
UPDATE navigation_sessions
SET status = 'completed', end_time = NOW()
WHERE id = $1;

-- Inserir métricas da rota
INSERT INTO route_metrics (route_id, total_distance, estimated_duration, actual_duration, fuel_consumption, fuel_savings, time_savings)
VALUES ($1, $2, $3, $4, $5, $6, $7);
```

## 🏢 **CLIENTES**

### **Gestão de Clientes**

```sql
-- Listar clientes do usuário
SELECT c.*,
       COUNT(rs.id) as route_count
FROM clients c
LEFT JOIN route_stops rs ON c.id = rs.client_id
WHERE c.user_id = $1 AND c.deleted_at IS NULL
GROUP BY c.id
ORDER BY c.name ASC;

-- Criar cliente
INSERT INTO clients (name, email, phone, company, address, city, state, country, latitude, longitude, notes, tags, user_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING *;

-- Buscar clientes próximos (Haversine)
SELECT c.*,
       ROUND(6371000 * acos(
         cos(radians($2)) * cos(radians(c.latitude)) *
         cos(radians(c.longitude) - radians($3)) +
         sin(radians($2)) * sin(radians(c.latitude))
       )) as distance
FROM clients c
WHERE c.user_id = $1 AND c.deleted_at IS NULL
HAVING distance <= $4
ORDER BY distance ASC
LIMIT 20;
```

## 📍 **PONTOS DE INTERESSE (POIs)**

### **Gestão de POIs**

```sql
-- Listar POIs com distância (quando coordenadas fornecidas)
SELECT p.id, p.name, p.type as category, p.description, p.latitude, p.longitude,
       p.address, p.phone, p.website, p.business_hours, p.rating,
       CASE WHEN p.user_id = $1 THEN true ELSE false END as is_user_poi,
       ROUND(6371000 * acos(
         cos(radians($2)) * cos(radians(p.latitude)) *
         cos(radians(p.longitude) - radians($3)) +
         sin(radians($2)) * sin(radians(p.latitude))
       )) as distance
FROM pois p
WHERE p.deleted_at IS NULL
ORDER BY distance ASC
LIMIT $4 OFFSET $5;

-- Criar POI personalizado
INSERT INTO pois (name, type, description, latitude, longitude, address, phone, website, business_hours, metadata, user_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
RETURNING *;

-- Categorias de POIs
SELECT type as category,
       COUNT(*) as count,
       AVG(rating) as avg_rating
FROM pois
WHERE deleted_at IS NULL AND type IS NOT NULL
GROUP BY type;
```

## 💳 **BILLING E ASSINATURAS**

### **Gestão de Planos**

```sql
-- Listar planos disponíveis
SELECT * FROM plans WHERE is_active = true ORDER BY price_cents ASC;

-- Obter assinatura atual
SELECT s.*, p.name as plan_name, p.description as plan_description,
       p.price_cents, p.routes_limit, p.api_calls_limit
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.user_id = $1 AND s.status IN ('active','trialing')
ORDER BY s.created_at DESC
LIMIT 1;

-- Criar nova assinatura
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, amount_cents, currency, billing_period, routes_limit)
VALUES ($1, $2, 'active', NOW(), $3, $4, 'BRL', 'monthly', $5)
RETURNING *;

-- Histórico de pagamentos
SELECT ph.*, s.id as subscription_id, p.name as plan_name
FROM payment_history ph
LEFT JOIN subscriptions s ON ph.subscription_id = s.id
LEFT JOIN plans p ON s.plan_id = p.id
WHERE ph.user_id = $1
ORDER BY ph.created_at DESC;
```

## 🔔 **NOTIFICAÇÕES**

### **Gestão de Notificações**

```sql
-- Listar notificações do usuário
SELECT * FROM notifications
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- Marcar como lida
UPDATE notifications
SET read_at = NOW(), updated_at = NOW()
WHERE id = $1 AND user_id = $2 AND read_at IS NULL;

-- Marcar todas como lidas
UPDATE notifications
SET read_at = NOW(), updated_at = NOW()
WHERE user_id = $1 AND read_at IS NULL;

-- Criar notificação
INSERT INTO notifications (user_id, type, title, message, details, actionable, action_url, action_label, route_id, navigation_session_id, icon, color, priority, expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
```

## 📊 **DASHBOARD E ESTATÍSTICAS**

### **Estatísticas Gerais**

```sql
-- Stats do dashboard
SELECT
  (SELECT COUNT(*) FROM routes WHERE user_id = $1 AND deleted_at IS NULL) as total_routes,
  (SELECT COUNT(*) FROM routes WHERE user_id = $1 AND status = 'completed' AND deleted_at IS NULL) as completed_routes,
  (SELECT COALESCE(SUM(rm.total_distance), 0) FROM route_metrics rm JOIN routes r ON rm.route_id = r.id WHERE r.user_id = $1) as total_distance,
  (SELECT COALESCE(SUM(rm.time_savings), 0) FROM route_metrics rm JOIN routes r ON rm.route_id = r.id WHERE r.user_id = $1) as time_saved,
  (SELECT COALESCE(SUM(rm.fuel_savings), 0) FROM route_metrics rm JOIN routes r ON rm.route_id = r.id WHERE r.user_id = $1) as fuel_saved;

-- Rotas recentes
SELECT r.id, r.name, r.status, r.created_at, r.completed_at,
       COUNT(rs.id) as stop_count,
       rm.total_distance, rm.estimated_duration
FROM routes r
LEFT JOIN route_stops rs ON r.id = rs.route_id
LEFT JOIN route_metrics rm ON r.id = rm.route_id
WHERE r.user_id = $1 AND r.deleted_at IS NULL
GROUP BY r.id, rm.id
ORDER BY r.created_at DESC
LIMIT $2;

-- Consumo do plano
SELECT COUNT(*) as routes_count
FROM routes
WHERE user_id = $1 AND deleted_at IS NULL
AND created_at >= DATE_TRUNC('month', NOW());
```

## 🔍 **AUDITORIA E LOGS**

### **Logs de Auditoria**

```sql
-- Inserir log de auditoria
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW());

-- Consultar logs
SELECT * FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

---

# 🏗️ ESTRUTURA DO BANCO DE DADOS

## **TABELAS PRINCIPAIS (19 tabelas)**

### 👤 **USUÁRIOS E AUTENTICAÇÃO**

**`users`** - Dados principais dos usuários

- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR, NOT NULL)
- `phone` (VARCHAR)
- `company` (VARCHAR)
- `country` (VARCHAR)
- `city` (VARCHAR)
- `avatar_url` (TEXT)
- `plan_type` (VARCHAR DEFAULT 'basic')
- `plan_expires_at` (TIMESTAMP)
- `is_active` (BOOLEAN DEFAULT true)
- `is_email_verified` (BOOLEAN DEFAULT false)
- `last_login_at` (TIMESTAMP)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())
- `deleted_at` (TIMESTAMP)

**`auth_sessions`** - Sessões de autenticação

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `refresh_token` (VARCHAR)
- `refresh_token_hash` (VARCHAR)
- `is_active` (BOOLEAN DEFAULT true)
- `expires_at` (TIMESTAMP)
- `user_agent` (TEXT)
- `ip_address` (INET)
- `created_at` (TIMESTAMP DEFAULT NOW())

**`user_preferences`** - Preferências do usuário

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `theme` (VARCHAR DEFAULT 'dark')
- `language` (VARCHAR DEFAULT 'pt-BR')
- `push_notifications` (BOOLEAN DEFAULT true)
- `email_notifications` (BOOLEAN DEFAULT true)
- `font_size` (VARCHAR DEFAULT 'medium')
- `density` (VARCHAR DEFAULT 'comfortable')
- `default_map_mode` (VARCHAR DEFAULT 'hybrid')
- `offline_maps_enabled` (BOOLEAN DEFAULT false)
- `auto_night_mode` (BOOLEAN DEFAULT true)
- `voice_guidance` (BOOLEAN DEFAULT true)
- `route_optimization_mode` (VARCHAR DEFAULT 'time')
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`user_stats`** - Estatísticas do usuário

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `total_routes` (INTEGER DEFAULT 0)
- `completed_routes` (INTEGER DEFAULT 0)
- `total_distance` (DECIMAL)
- `total_time_saved` (INTEGER)
- `total_fuel_saved` (DECIMAL)
- `average_rating` (DECIMAL)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

### 🗺️ **ROTAS E NAVEGAÇÃO**

**`routes`** - Rotas criadas pelos usuários

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `responsible` (VARCHAR)
- `priority` (VARCHAR DEFAULT 'medium')
- `status` (VARCHAR DEFAULT 'draft')
- `route_type` (VARCHAR DEFAULT 'logistics')
- `scheduled_date` (TIMESTAMP)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)
- `is_favorite` (BOOLEAN DEFAULT false)
- `route_set_id` (UUID, FK → route_sets.id)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())
- `deleted_at` (TIMESTAMP)

**`route_stops`** - Paradas das rotas

- `id` (UUID, PK)
- `route_id` (UUID, FK → routes.id)
- `stop_order` (INTEGER, NOT NULL)
- `name` (VARCHAR, NOT NULL)
- `address` (TEXT)
- `latitude` (DECIMAL, NOT NULL)
- `longitude` (DECIMAL, NOT NULL)
- `client_id` (UUID, FK → clients.id)
- `estimated_duration` (INTEGER)
- `is_completed` (BOOLEAN DEFAULT false)
- `completed_at` (TIMESTAMP)
- `time_spent_at_stop` (INTEGER)
- `notes` (TEXT)
- `created_at` (TIMESTAMP DEFAULT NOW())

**`route_sets`** - Conjuntos de rotas

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `color` (VARCHAR)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`navigation_sessions`** - Sessões de navegação ativa

- `id` (UUID, PK)
- `route_id` (UUID, FK → routes.id)
- `user_id` (UUID, FK → users.id)
- `status` (VARCHAR DEFAULT 'active')
- `navigation_mode` (VARCHAR DEFAULT 'driving')
- `start_time` (TIMESTAMP)
- `end_time` (TIMESTAMP)
- `current_stop_index` (INTEGER DEFAULT 0)
- `current_latitude` (DECIMAL)
- `current_longitude` (DECIMAL)
- `total_distance` (DECIMAL)
- `remaining_distance` (DECIMAL)
- `active_time` (INTEGER DEFAULT 0)
- `estimated_fuel_consumption` (DECIMAL)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`route_metrics`** - Métricas de performance das rotas

- `id` (UUID, PK)
- `route_id` (UUID, FK → routes.id)
- `total_distance` (DECIMAL)
- `estimated_duration` (INTEGER)
- `actual_duration` (INTEGER)
- `fuel_consumption` (DECIMAL)
- `fuel_savings` (DECIMAL)
- `time_savings` (INTEGER)
- `average_speed` (DECIMAL)
- `created_at` (TIMESTAMP DEFAULT NOW())

### 🏢 **CLIENTES**

**`clients`** - Clientes dos usuários

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `company` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `country` (VARCHAR)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `notes` (TEXT)
- `tags` (TEXT[])
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())
- `deleted_at` (TIMESTAMP)

**`client_stops`** - Histórico de paradas em clientes

- `id` (UUID, PK)
- `client_id` (UUID, FK → clients.id)
- `route_id` (UUID, FK → routes.id)
- `visited_at` (TIMESTAMP)
- `duration` (INTEGER)
- `notes` (TEXT)
- `created_at` (TIMESTAMP DEFAULT NOW())

### 📍 **PONTOS DE INTERESSE**

**`pois`** - Pontos de interesse

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `type` (VARCHAR)
- `description` (TEXT)
- `latitude` (DECIMAL, NOT NULL)
- `longitude` (DECIMAL, NOT NULL)
- `address` (TEXT)
- `phone` (VARCHAR)
- `website` (VARCHAR)
- `business_hours` (JSONB)
- `metadata` (JSONB)
- `rating` (DECIMAL DEFAULT 0)
- `is_verified` (BOOLEAN DEFAULT false)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())
- `deleted_at` (TIMESTAMP)

### 💳 **BILLING E PAGAMENTOS**

**`plans`** - Planos de assinatura

- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `price_cents` (INTEGER, NOT NULL)
- `currency` (VARCHAR DEFAULT 'BRL')
- `billing_period` (VARCHAR DEFAULT 'monthly')
- `routes_limit` (INTEGER)
- `api_calls_limit` (INTEGER)
- `features` (JSONB)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`subscriptions`** - Assinaturas dos usuários

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `plan_id` (UUID, FK → plans.id)
- `stripe_subscription_id` (VARCHAR)
- `status` (VARCHAR, NOT NULL)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `cancelled_at` (TIMESTAMP)
- `amount_cents` (INTEGER)
- `currency` (VARCHAR DEFAULT 'BRL')
- `billing_period` (VARCHAR)
- `routes_limit` (INTEGER)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`payment_history`** - Histórico de pagamentos

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `subscription_id` (UUID, FK → subscriptions.id)
- `stripe_payment_intent_id` (VARCHAR)
- `amount_cents` (INTEGER, NOT NULL)
- `currency` (VARCHAR DEFAULT 'BRL')
- `status` (VARCHAR, NOT NULL)
- `payment_method` (VARCHAR)
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMP DEFAULT NOW())

### 🔔 **NOTIFICAÇÕES**

**`notifications`** - Notificações dos usuários

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `type` (VARCHAR, NOT NULL)
- `title` (VARCHAR, NOT NULL)
- `message` (TEXT, NOT NULL)
- `details` (JSONB)
- `read_at` (TIMESTAMP)
- `archived_at` (TIMESTAMP)
- `actionable` (BOOLEAN DEFAULT false)
- `action_url` (VARCHAR)
- `action_label` (VARCHAR)
- `route_id` (UUID, FK → routes.id)
- `navigation_session_id` (UUID, FK → navigation_sessions.id)
- `icon` (VARCHAR)
- `color` (VARCHAR)
- `priority` (VARCHAR DEFAULT 'normal')
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())
- `deleted_at` (TIMESTAMP)

### 🔍 **SISTEMA E AUDITORIA**

**`search_results`** - Cache de resultados de busca

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `query` (VARCHAR, NOT NULL)
- `results` (JSONB)
- `source` (VARCHAR)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `expires_at` (TIMESTAMP)

**`system_config`** - Configurações do sistema

- `id` (UUID, PK)
- `key` (VARCHAR, UNIQUE, NOT NULL)
- `value` (JSONB)
- `description` (TEXT)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `updated_at` (TIMESTAMP DEFAULT NOW())

**`audit_logs`** - Logs de auditoria

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `action` (VARCHAR, NOT NULL)
- `table_name` (VARCHAR)
- `record_id` (UUID)
- `old_values` (JSONB)
- `new_values` (JSONB)
- `ip_address` (INET)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMP DEFAULT NOW())

---

# 🔧 CONFIGURAÇÕES E VARIÁVEIS

## **VARIÁVEIS DE AMBIENTE**

### **🔑 Obrigatórias**

```bash
# Database
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT
JWT_SECRET=sua_jwt_secret_key_super_segura_aqui

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA
```

### **⚙️ Opcionais**

```bash
# Servidor
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:8080

# Autenticação
BCRYPT_ROUNDS=12
SESSION_SECRET=sua_session_secret_aqui

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX=100           # requests por IP
AUTH_RATE_LIMIT_MAX=5        # tentativas de login

# Mapbox (alternativo)
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA
```

## **🔗 CONFIGURAÇÕES DE SERVIÇOS**

### **Neon Database**

- **Host:** sa-east-1.aws.neon.tech
- **Região:** AWS South America (São Paulo)
- **Versão PostgreSQL:** 17
- **SSL:** Obrigatório
- **Pool de Conexões:** Ativo
- **Backup:** Automático (24h)

### **Mapbox Services**

- **Geocoding API:** ✅ Ativo
- **Directions API:** ✅ Ativo
- **Optimization API:** ✅ Ativo
- **Matrix API:** ✅ Ativo
- **Isochrone API:** ✅ Ativo
- **Rate Limit:** 50,000 requests/mês (free tier)

### **Rate Limiting**

- **Geral:** 100 requests/15min por IP
- **Autenticação:** 5 tentativas/15min por IP
- **Mapbox:** 10 requests/min por usuário
- **Billing:** 20 requests/hour por usuário

---

# 📁 ARQUITETURA DO PROJETO

## **🏗️ ESTRUTURA DE PASTAS**

```
viwe-project/
├── client/                    # Frontend React
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # UI primitivos (buttons, inputs, etc.)
│   │   ├── shared/          # Componentes compartilhados
│   │   ├── desktop/         # Componentes específicos desktop
│   │   ├── mobile/          # Componentes específicos mobile
│   │   └── tablet/          # Componentes específicos tablet
│   ├── pages/               # Páginas da aplicação
│   │   ├── internal/        # Páginas autenticadas
│   │   └── *.tsx            # Páginas públicas
│   ├── contexts/            # Contextos React
│   ├── hooks/               # Custom hooks
│   ├── layouts/             # Layouts responsivos
│   ├── lib/                 # Utilitários e configurações
│   ├── services/            # Serviços de API
│   └── App.tsx              # Entry point
├── server/                   # Backend Express
│   ├── src/                 # Código principal
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares
│   │   ├── utils/           # Utilitários
│   │   └── index.js         # Entry point
│   ├── scripts/             # Scripts auxiliares
│   └── config/              # Configurações
├── shared/                   # Tipos compartilhados
├── scripts/                  # Scripts de setup/deploy
└── docs/                     # Documentação
```

## **🔄 FLUXO DE DADOS**

### **Autenticação**

```
Frontend → POST /api/auth/login → Database → JWT Tokens → Frontend Storage
```

### **Navegação em Tempo Real**

```
Frontend → WebSocket Connection → Backend → Database Updates → Real-time UI
```

### **Criação de Rotas**

```
Frontend → POST /api/routes → Mapbox Optimization → Database → Response
```

---

# 🔑 MIDDLEWARES E SEGURANÇA

## **🛡️ MIDDLEWARES IMPLEMENTADOS**

### **Autenticação (`authenticateToken`)**

```javascript
// Valida JWT token em rotas protegidas
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};
```

### **Rate Limiting**

```javascript
// Rate limiting geral (100 requests/15min)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições, tente novamente em 15 minutos." },
  trustProxy: true,
});

// Rate limiting para autenticação (5 tentativas/15min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login, tente novamente em 15 minutos.",
  },
  skipSuccessfulRequests: true,
  trustProxy: true,
});
```

### **Segurança (`helmet`)**

```javascript
// Configuração de segurança
helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "*.mapbox.com"],
    },
  },
});
```

### **CORS**

```javascript
// Configuração CORS
cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
});
```

## **🔐 POLÍTICAS DE SEGURANÇA**

### **Senhas**

- **Hash:** bcrypt com 12 rounds
- **Validação:** Mínimo 6 caracteres
- **Expiração:** Refresh tokens (30 dias)

### **Sessões**

- **JWT Access Token:** 1 hora de validade
- **Refresh Token:** 30 dias de validade
- **Revogação:** Logout invalida todas as sessões

### **Rate Limits por Endpoint**

- `/api/auth/*`: 5 requests/15min
- `/api/mapbox/*`: 10 requests/min
- `/api/billing/*`: 20 requests/hour
- Geral: 100 requests/15min

---

# ⚡ SERVIÇOS INTEGRADOS

## **🗺️ MAPBOX SERVICES**

### **Configuração**

```javascript
const MAPBOX_BASE_URL = "https://api.mapbox.com";
const MAPBOX_TOKEN = process.env.VITE_MAPBOX_ACCESS_TOKEN;
```

### **Endpoints Utilizados**

- **Geocoding:** `GET /geocoding/v5/mapbox.places/{query}.json`
- **Directions:** `GET /directions/v5/mapbox/{profile}/{coordinates}`
- **Optimization:** `GET /optimized-trips/v1/mapbox/{profile}/{coordinates}`
- **Matrix:** `GET /directions-matrix/v1/mapbox/{profile}/{coordinates}`
- **Isochrone:** `GET /isochrone/v1/mapbox/{profile}/{coordinates}`

### **Rate Limits**

- **Free Tier:** 50,000 requests/mês
- **Paid Tier:** Conforme plano contratado

## **💾 NEON DATABASE**

### **Configuração**

```javascript
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
```

### **Features Utilizadas**

- **Connection Pooling:** ✅ Ativo
- **Auto-scaling:** ✅ Ativo (0.25-2 CU)
- **Backup Automático:** ✅ 24h retention
- **SSL:** ✅ Obrigatório
- **Regiões:** AWS South America (São Paulo)

### **Limites**

- **Free Tier:** 3GB storage, 100 horas compute/mês
- **Pro Tier:** Conforme plano contratado

## **💳 STRIPE BILLING**

### **Configuração**

```javascript
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
```

### **Webhooks Implementados**

- `payment_intent.succeeded`
- `invoice.payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### **Planos Disponíveis**

- **Básico:** R$ 29/mês - 100 rotas
- **Premium:** R$ 79/mês - 500 rotas
- **Enterprise:** R$ 199/mês - Ilimitado

---

# 📊 ESTATÍSTICAS E MÉTRICAS

## **📈 MÉTRICAS COLETADAS**

### **Usuário**

- Total de rotas criadas
- Distância total percorrida
- Tempo economizado
- Combustível economizado
- Taxa de conclusão de rotas

### **Sistema**

- Requests por endpoint
- Tempo de resposta médio
- Erros por tipo
- Uso de recursos (CPU/Memória)
- Taxa de sucesso das operações

### **Mapbox**

- Requests por serviço
- Cache hit rate
- Latência média
- Quota utilizada

---

# 🔄 FLUXOS PRINCIPAIS

## **🚀 FLUXO DE REGISTRO**

1. `POST /api/auth/register` → Validação de dados
2. Hash da senha (bcrypt)
3. Criação do usuário na base
4. Criação de preferências padrão
5. Geração de tokens JWT
6. Resposta com dados do usuário + tokens

## **🔐 FLUXO DE LOGIN**

1. `POST /api/auth/login` → Validação de credenciais
2. Verificação de senha (bcrypt.compare)
3. Atualização de `last_login_at`
4. Criação de sessão de autenticação
5. Geração de access + refresh tokens
6. Resposta com dados do usuário + tokens

## **🗺️ FLUXO DE CRIAÇÃO DE ROTA**

1. `POST /api/routes` → Validação de dados
2. Chamada para Mapbox Optimization API
3. Criação da rota na base (transação)
4. Criação das paradas ordenadas
5. Cálculo de métricas estimadas
6. Log de auditoria
7. Resposta com rota criada

## **🧭 FLUXO DE NAVEGAÇÃO**

1. `POST /api/navigation/start` → Validação de rota
2. Criação de sessão de navegação
3. Atualização de status da rota
4. WebSocket connection (tempo real)
5. Updates de posição (`PATCH /api/navigation/:id`)
6. Completar paradas (`POST /api/navigation/:id/complete-stop`)
7. Finalização e cálculo de métricas

---

# 🎯 PRÓXIMOS PASSOS (ROADMAP)

## **📅 SEMANA 1 - CRÍTICO**

- [ ] ✅ Database schema (19 tabelas) - **CONCLUÍDO**
- [x] ✅ Frontend ↔ Backend integration - **EM PROGRESSO**
- [ ] 🔧 Mapbox validation & fallback
- [ ] 🔐 Auth middleware & refresh tokens

## **📅 SEMANA 2 - ESSENCIAL**

- [ ] 🧭 Real-time navigation
- [ ] 🗺️ Navigation UI components
- [ ] 🛣️ Complete route system
- [ ] 📍 POIs management

## **📅 SEMANA 3 - IMPORTANTE**

- [ ] 💳 Billing & subscription system
- [ ] 🔔 Notifications system
- [ ] 📊 Metrics & analytics
- [ ] ⚡ Route optimization engine

## **📅 SEMANA 4 - POLIMENTO**

- [ ] 🧪 Testing & quality assurance
- [ ] 📱 Mobile responsiveness
- [ ] 🔧 Infrastructure & monitoring
- [ ] 🎨 UX/UI polishing

---

# 📝 NOTAS IMPORTANTES

## **⚠️ LIMITAÇÕES CONHECIDAS**

- Mapbox free tier: 50k requests/mês
- Neon free tier: 3GB storage
- Rate limiting pode afetar UX em picos
- WebSocket ainda não implementado

## **🔧 MELHORIAS PLANEJADAS**

- Cache de rotas otimizadas
- Compressão de responses
- CDN para assets estáticos
- Monitoring & alerting
- Backup strategy

## **📚 DOCUMENTAÇÃO ADICIONAL**

- API Testing: Postman collection
- Database ERD: Lucidchart diagram
- Architecture: System design docs
- Deployment: CI/CD pipeline docs

---

**📞 CONTATO TÉCNICO**  
**Email:** tech@viwe.com.br  
**Slack:** #viwe-development  
**Última Atualização:** 2025-01-25

---

_Este documento é atualizado automaticamente a cada deploy e deve ser a fonte única da verdade para o projeto Viwe._
