# 🗺️ ENDPOINTS DE ROTAS

## Visão Geral

Endpoints para gerenciamento completo de rotas, incluindo:

- CRUD de rotas
- Gerenciamento de paradas
- Sistema de navegação
- Otimização via Mapbox
- Métricas e estatísticas

Todos os endpoints requerem autenticação: `Authorization: Bearer <token>`

---

## GET /api/routes

### Descrição

Lista rotas do usuário autenticado com filtros e paginação.

### Request

```http
GET /api/routes?status=active&limit=20&offset=0&search=trabalho
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Query Parameters

- `status` (opcional): `all`, `active`, `scheduled`, `draft`, `completed`, `paused`
- `limit` (opcional): número de itens (padrão: 20, máximo: 100)
- `offset` (opcional): paginação (padrão: 0)
- `search` (opcional): busca por nome ou descrição
- `routeSetId` (opcional): filtrar por conjunto de rotas

### Response - Sucesso (200)

```json
{
  "routes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rota Centro - Trabalho",
      "description": "Rota diária para o trabalho",
      "status": "active",
      "priority": "alta",
      "responsible": "João Silva",
      "estimatedDuration": 3600,
      "estimatedDistance": 15000,
      "estimatedCredits": 8,
      "scheduledDate": "2024-01-15T08:00:00.000Z",
      "stopCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-14T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1,
    "hasMore": false
  }
}
```

---

## POST /api/routes

### Descrição

Cria uma nova rota com paradas.

### Request

```http
POST /api/routes
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Rota de Entregas Zona Sul",
  "description": "Entregas da manhã na zona sul",
  "responsible": "Carlos Santos",
  "priority": "media",
  "routeSetId": "550e8400-e29b-41d4-a716-446655440001",
  "scheduling": {
    "type": "imediata",
    "date": "2024-01-15T08:00:00.000Z"
  },
  "stops": [
    {
      "name": "Cliente A",
      "coordinates": [-46.6333, -23.5505],
      "address": "Rua Augusta, 123 - São Paulo, SP",
      "notes": "Entregar no portão principal",
      "clientId": "client-uuid-here"
    },
    {
      "name": "Cliente B",
      "coordinates": [-46.6400, -23.5600],
      "address": "Av. Paulista, 456 - São Paulo, SP"
    }
  ],
  "clients": [
    {
      "name": "João Silva",
      "phone": "(11) 99999-9999"
    }
  ]
}
```

### Validações

- `name`: obrigatório, 3-255 caracteres
- `responsible`: obrigatório, 2-255 caracteres
- `priority`: enum (`baixa`, `media`, `alta`)
- `stops`: array obrigatório, mínimo 1 parada
- `stops[].coordinates`: array [longitude, latitude] obrigatório
- `scheduling.type`: enum (`permanente`, `imediata`)

### Response - Sucesso (201)

```json
{
  "route": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Rota de Entregas Zona Sul",
    "description": "Entregas da manhã na zona sul",
    "status": "draft",
    "priority": "media",
    "responsible": "Carlos Santos",
    "estimatedDuration": 5400,
    "estimatedDistance": 25000,
    "estimatedCredits": 10,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "stops": [
    {
      "id": "stop-uuid-1",
      "routeId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Cliente A",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "address": "Rua Augusta, 123 - São Paulo, SP",
      "stopOrder": 1,
      "notes": "Entregar no portão principal"
    }
  ]
}
```

### Processamento Automático

1. Calcular estimativas de duração e distância
2. Criar paradas na ordem fornecida
3. Associar clientes existentes ou criar novos
4. Gerar métricas iniciais
5. Criar entrada no audit_log

---

## GET /api/routes/:id

### Descrição

Retorna detalhes completos de uma rota específica.

### Request

```http
GET /api/routes/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer token
```

### Response - Sucesso (200)

```json
{
  "route": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Rota Centro - Trabalho",
    "description": "Rota diária para o trabalho",
    "status": "active",
    "priority": "alta",
    "responsible": "João Silva",
    "estimatedDuration": 3600,
    "estimatedDistance": 15000,
    "estimatedCredits": 8,
    "actualDuration": 3240,
    "actualDistance": 14500,
    "scheduledDate": "2024-01-15T08:00:00.000Z",
    "startedAt": "2024-01-15T08:05:00.000Z",
    "completedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T08:05:00.000Z"
  },
  "stops": [
    {
      "id": "stop-uuid-1",
      "name": "Casa",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "address": "Rua A, 123",
      "stopOrder": 1,
      "isCompleted": true,
      "completedAt": "2024-01-15T08:05:00.000Z",
      "timeSpentAtStop": 300
    },
    {
      "id": "stop-uuid-2",
      "name": "Trabalho",
      "latitude": -23.56,
      "longitude": -46.64,
      "address": "Av. B, 456",
      "stopOrder": 2,
      "isCompleted": false
    }
  ],
  "metrics": {
    "efficiency": 85,
    "fuelSaved": 2.5,
    "moneySaved": 15.5,
    "timeImprovement": 360
  },
  "navigation": {
    "isActive": true,
    "currentStopIndex": 1,
    "completedStops": 1,
    "remainingDistance": 7500
  }
}
```

---

## PATCH /api/routes/:id

### Descrição

Atualiza dados de uma rota existente.

### Request

```http
PATCH /api/routes/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Nova Rota Trabalho",
  "description": "Descrição atualizada",
  "priority": "alta",
  "status": "scheduled",
  "scheduledDate": "2024-01-16T08:00:00.000Z"
}
```

### Campos Atualizáveis

- `name`
- `description`
- `priority`
- `status` (com validações)
- `scheduledDate`
- `responsible`

### Response - Sucesso (200)

```json
{
  "route": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nova Rota Trabalho",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Validações de Status

- `draft` → `active`, `scheduled`
- `scheduled` → `active`, `cancelled`
- `active` → `paused`, `completed`, `cancelled`
- `paused` → `active`, `cancelled`
- `completed` → Não pode alterar
- `cancelled` → Não pode alterar

---

## DELETE /api/routes/:id

### Descrição

Remove uma rota (soft delete).

### Request

```http
DELETE /api/routes/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer token
```

### Validações

- Rota deve pertencer ao usuário
- Não pode deletar rota em navegação ativa
- Rota com status `completed` requer confirmação

### Response - Sucesso (200)

```json
{
  "message": "Rota removida com sucesso"
}
```

---

## POST /api/routes/:id/duplicate

### Descrição

Duplica uma rota existente com todas as paradas.

### Request

```http
POST /api/routes/550e8400-e29b-41d4-a716-446655440000/duplicate
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Cópia da Rota Centro - Trabalho",
  "scheduledDate": "2024-01-16T08:00:00.000Z"
}
```

### Response - Sucesso (201)

```json
{
  "route": {
    "id": "new-route-uuid",
    "name": "Cópia da Rota Centro - Trabalho",
    "status": "draft"
  }
}
```

---

## POST /api/routes/:id/optimize

### Descrição

Otimiza ordem das paradas usando Mapbox Optimization API.

### Request

```http
POST /api/routes/550e8400-e29b-41d4-a716-446655440000/optimize
Authorization: Bearer token
Content-Type: application/json

{
  "preserveFirst": true,
  "preserveLast": true
}
```

### Response - Sucesso (200)

```json
{
  "optimization": {
    "originalDistance": 25000,
    "optimizedDistance": 22000,
    "distanceSaved": 3000,
    "timeSaved": 900
  },
  "route": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estimatedDistance": 22000,
    "estimatedDuration": 4500
  },
  "stops": [
    {
      "id": "stop-uuid-2",
      "stopOrder": 1,
      "name": "Parada otimizada 1"
    },
    {
      "id": "stop-uuid-1",
      "stopOrder": 2,
      "name": "Parada otimizada 2"
    }
  ]
}
```

### Validações

- Rota não pode estar em navegação ativa
- Mínimo 3 paradas para otimização
- Rate limit: 10 otimizações por hora

---

## GET /api/routes/:id/metrics

### Descrição

Retorna métricas detalhadas de uma rota completada.

### Request

```http
GET /api/routes/550e8400-e29b-41d4-a716-446655440000/metrics
Authorization: Bearer token
```

### Response - Sucesso (200)

```json
{
  "route": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Rota Centro - Trabalho"
  },
  "performance": {
    "totalTime": 3240,
    "totalDistance": 14500,
    "averageSpeed": 16.1,
    "efficiency": 85
  },
  "stops": {
    "total": 5,
    "completed": 5,
    "averageStopTime": 480
  },
  "optimization": {
    "count": 2,
    "timeImprovement": 360,
    "distanceImprovement": 500
  },
  "savings": {
    "fuelUsed": 1.2,
    "fuelSaved": 2.5,
    "moneySaved": 15.5,
    "co2Saved": 5.8
  },
  "traffic": {
    "conditions": "normal",
    "delays": 120
  }
}
```

---

## GET /api/routes/:id/stops

### Descrição

Lista paradas de uma rota específica.

### Request

```http
GET /api/routes/550e8400-e29b-41d4-a716-446655440000/stops
Authorization: Bearer token
```

### Response - Sucesso (200)

```json
{
  "stops": [
    {
      "id": "stop-uuid-1",
      "name": "Casa",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "address": "Rua A, 123",
      "stopOrder": 1,
      "isCompleted": true,
      "completedAt": "2024-01-15T08:05:00.000Z",
      "timeSpentAtStop": 300,
      "notes": "Ponto de partida",
      "client": {
        "id": "client-uuid",
        "name": "João Silva",
        "phone": "(11) 99999-9999"
      }
    }
  ]
}
```

---

## POST /api/routes/:id/stops

### Descrição

Adiciona nova parada a uma rota existente.

### Request

```http
POST /api/routes/550e8400-e29b-41d4-a716-446655440000/stops
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Nova Parada",
  "coordinates": [-46.6500, -23.5700],
  "address": "Rua Nova, 789",
  "notes": "Observações da parada",
  "insertAt": 2
}
```

### Response - Sucesso (201)

```json
{
  "stop": {
    "id": "new-stop-uuid",
    "name": "Nova Parada",
    "stopOrder": 2
  },
  "route": {
    "estimatedDistance": 18000,
    "estimatedDuration": 4200
  }
}
```

---

## PATCH /api/routes/:id/stops/:stopId

### Descrição

Atualiza dados de uma parada específica.

### Request

```http
PATCH /api/routes/route-id/stops/stop-id
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "notes": "Novas observações",
  "stopOrder": 3
}
```

---

## DELETE /api/routes/:id/stops/:stopId

### Descrição

Remove uma parada da rota.

### Request

```http
DELETE /api/routes/route-id/stops/stop-id
Authorization: Bearer token
```

### Validações

- Rota não pode estar em navegação ativa
- Deve manter pelo menos 1 parada
- Reordena paradas automaticamente

---

## Middleware e Validações

### Middleware de Autorização

```typescript
const routeOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const routeId = req.params.id;
  const userId = req.user!.id;

  const route = await query("SELECT user_id FROM routes WHERE id = $1", [
    routeId,
  ]);

  if (route.rows.length === 0) {
    return res.status(404).json({ error: "Rota não encontrada" });
  }

  if (route.rows[0].user_id !== userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  next();
};
```

### Validação de Plano

```typescript
const validatePlanLimits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;

  // Verificar limites do plano do usuário
  const user = await query("SELECT plan_type FROM users WHERE id = $1", [
    userId,
  ]);
  const plan = await query("SELECT * FROM plans WHERE name = $1", [
    user.rows[0].plan_type,
  ]);

  if (plan.rows[0].max_routes !== -1) {
    const routeCount = await query(
      "SELECT COUNT(*) FROM routes WHERE user_id = $1",
      [userId],
    );

    if (routeCount.rows[0].count >= plan.rows[0].max_routes) {
      return res.status(403).json({
        error: "Limite de rotas atingido para seu plano",
        limit: plan.rows[0].max_routes,
      });
    }
  }

  next();
};
```

---

## Rate Limiting

### Configuração por Endpoint

```typescript
// Rotas básicas
const routesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
});

// Otimização (mais restritivo)
const optimizationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 otimizações por hora
});

router.use("/optimize", optimizationLimiter);
```

---

## Cálculo de Estimativas

### Distância e Duração

```typescript
const calculateEstimates = (stops: RouteStop[]) => {
  let totalDistance = 0;
  let totalDuration = 0;

  // Cálculo simples entre paradas
  for (let i = 0; i < stops.length - 1; i++) {
    const distance = haversineDistance(
      stops[i].coordinates,
      stops[i + 1].coordinates,
    );
    totalDistance += distance;
  }

  // Estimativas baseadas em médias
  totalDuration = (totalDistance / 15) * 60; // 15 km/h médio em cidade
  const estimatedCredits = Math.min(stops.length * 2, 20);

  return { totalDistance, totalDuration, estimatedCredits };
};
```

---

## Próximos Passos

1. ✅ Implementar CRUD básico
2. ✅ Integração com Mapbox Optimization
3. ✅ Sistema de métricas
4. ✅ WebSocket para updates em tempo real
5. ✅ Export/share de rotas
6. ✅ Templates de rotas
