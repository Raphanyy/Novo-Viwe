# 📡 TODOS OS ENDPOINTS - ESPECIFICAÇÃO COMPLETA

## 🎯 Visão Geral

Esta é a especificação completa de **TODOS** os 34+ endpoints necessários para o backend da plataforma Viwe, organizados por categoria.

### 📊 Estatísticas
- **🔐 Autenticação**: 9 endpoints
- **👤 Usuários**: 6 endpoints
- **🗺️ Rotas**: 12 endpoints
- **🧭 Navegação**: 7 endpoints
- **👥 Clientes**: 5 endpoints
- **🔔 Notificações**: 5 endpoints
- **🌍 Mapas**: 4 endpoints
- **💳 Billing**: 6 endpoints
- **📊 Analytics**: 4 endpoints

### 🌐 Base URL
```
Desenvolvimento: http://localhost:3001/api
Produção: https://sua-api.viwe.com/api
```

---

## 🔐 AUTENTICAÇÃO (/api/auth)

### Endpoints Básicos
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar usuário | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/refresh` | Renovar token | ❌ |
| POST | `/auth/logout` | Logout | ✅ |
| GET | `/auth/me` | Dados do usuário | ✅ |

### Recuperação de Senha
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/forgot-password` | Solicitar reset | ❌ |
| POST | `/auth/reset-password` | Redefinir senha | ❌ |

### OAuth
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/auth/oauth/google` | Login Google | ❌ |
| GET | `/auth/oauth/google/callback` | Callback Google | ❌ |

### Verificação
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/verify-email` | Verificar email | ❌ |

---

## 👤 USUÁRIOS (/api/user)

### Perfil
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/user` | Dados do perfil | ✅ |
| PATCH | `/user` | Atualizar perfil | ✅ |
| DELETE | `/user` | Deletar conta | ✅ |

### Configurações
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/user/preferences` | Preferências | ✅ |
| PATCH | `/user/preferences` | Atualizar preferências | ✅ |

### Avatar
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/user/avatar` | Upload avatar | ✅ |

---

## 🗺️ ROTAS (/api/routes)

### CRUD Básico
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/routes` | Listar rotas | ✅ |
| POST | `/routes` | Criar rota | ✅ |
| GET | `/routes/:id` | Detalhes da rota | ✅ |
| PATCH | `/routes/:id` | Atualizar rota | ✅ |
| DELETE | `/routes/:id` | Deletar rota | ✅ |

### Operações Especiais
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/routes/:id/duplicate` | Duplicar rota | ✅ |
| POST | `/routes/:id/optimize` | Otimizar rota | ✅ |
| GET | `/routes/:id/metrics` | Métricas da rota | ✅ |

### Paradas
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/routes/:id/stops` | Listar paradas | ✅ |
| POST | `/routes/:id/stops` | Adicionar parada | ✅ |
| PATCH | `/routes/:id/stops/:stopId` | Atualizar parada | ✅ |
| DELETE | `/routes/:id/stops/:stopId` | Remover parada | ✅ |

---

## 🧭 NAVEGAÇÃO (/api/navigation)

### Controle de Sessão
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/navigation/start` | Iniciar navegação | ✅ |
| PATCH | `/navigation/:id` | Atualizar navegação | ✅ |
| POST | `/navigation/:id/stop` | Parar navegação | ✅ |
| DELETE | `/navigation/:id` | Cancelar navegação | ✅ |

### Controles Durante Navegação
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/navigation/:id/pause` | Pausar navegação | ✅ |
| POST | `/navigation/:id/resume` | Retomar navegação | ✅ |
| POST | `/navigation/:id/complete-stop` | Completar parada | ✅ |

---

## 👥 CLIENTES (/api/clients)

### CRUD de Clientes
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/clients` | Listar clientes | ✅ |
| POST | `/clients` | Criar cliente | ✅ |
| GET | `/clients/:id` | Detalhes do cliente | ✅ |
| PATCH | `/clients/:id` | Atualizar cliente | ✅ |
| DELETE | `/clients/:id` | Deletar cliente | ✅ |

---

## 🔔 NOTIFICAÇÕES (/api/notifications)

### Gerenciamento
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/notifications` | Listar notificações | ✅ |
| POST | `/notifications/:id/read` | Marcar como lida | ✅ |
| POST | `/notifications/:id/archive` | Arquivar | ✅ |
| DELETE | `/notifications/:id` | Deletar | ✅ |
| POST | `/notifications/mark-all-read` | Marcar todas como lidas | ✅ |

---

## 🌍 MAPAS (/api/mapbox)

### Geocoding e Direções
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/mapbox/geocoding` | Buscar endereços | ✅ |
| GET | `/mapbox/reverse-geocoding` | Geocoding reverso | ✅ |
| POST | `/mapbox/directions` | Calcular rota | ✅ |
| POST | `/mapbox/optimization` | Otimizar múltiplas paradas | ✅ |

---

## 💳 BILLING (/api/billing)

### Planos e Assinaturas
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/billing/plans` | Listar planos | ✅ |
| POST | `/billing/subscribe` | Assinar plano | ✅ |
| POST | `/billing/cancel` | Cancelar assinatura | ✅ |
| GET | `/billing/history` | Histórico de pagamentos | ✅ |

### Webhooks
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/billing/webhooks/stripe` | Webhook Stripe | ❌ |
| POST | `/billing/webhooks/paypal` | Webhook PayPal | ❌ |

---

## 📊 ANALYTICS (/api/analytics)

### Estatísticas
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/analytics/dashboard` | Stats do dashboard | ✅ |
| GET | `/analytics/routes` | Estatísticas de rotas | ✅ |
| GET | `/analytics/performance` | Métricas de performance | ✅ |
| GET | `/analytics/export` | Exportar dados | ✅ |

---

## 📋 ESPECIFICAÇÕES DETALHADAS

### Rate Limiting

#### Por Categoria
```typescript
// Autenticação - mais restritivo
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 tentativas
});

// Mapbox - controlado
const mapboxLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100, // 100 requests
});

// Geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests
});
```

### Headers Obrigatórios

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <access_token>
User-Agent: Viwe-App/1.0.0
```

#### Response Headers
```http
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642691400
```

### Códigos de Status HTTP

#### Sucesso (2xx)
- `200 OK` - Operação bem-sucedida
- `201 Created` - Recurso criado
- `204 No Content` - Operação sem retorno

#### Cliente (4xx)
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token ausente/inválido
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito de dados
- `422 Unprocessable Entity` - Validação falhou
- `429 Too Many Requests` - Rate limit

#### Servidor (5xx)
- `500 Internal Server Error` - Erro interno
- `502 Bad Gateway` - Erro de proxy
- `503 Service Unavailable` - Serviço indisponível

### Estrutura de Erro Padrão

```json
{
  "error": "Mensagem amigável para o usuário",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Email já está em uso"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

### Estrutura de Paginação

```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true,
    "nextOffset": 20,
    "prevOffset": null
  }
}
```

---

## 🔒 AUTENTICAÇÃO E AUTORIZAÇÃO

### JWT Tokens

#### Access Token
- **Duração**: 15 minutos
- **Uso**: Todas as chamadas autenticadas
- **Storage**: Memória (não localStorage)

#### Refresh Token
- **Duração**: 30 dias
- **Uso**: Renovar access token
- **Storage**: httpOnly cookie ou secure storage

### Headers de Autenticação

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware de Autorização

```typescript
// Verificar ownership de recurso
const checkResourceOwnership = (resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user!.id;
    
    const resource = await query(
      `SELECT user_id FROM ${resourceType} WHERE id = $1`,
      [resourceId]
    );
    
    if (resource.rows[0]?.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    next();
  };
};
```

---

## 🧪 TESTES DE ENDPOINT

### Scripts de Teste

#### Setup de Teste
```bash
# Registrar usuário de teste
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test123!@#"}'

# Fazer login e obter token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}' \
  | jq -r '.tokens.accessToken')
```

#### Testar Endpoints Principais
```bash
# Listar rotas
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/routes

# Criar rota
curl -X POST http://localhost:3001/api/routes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rota Teste",
    "responsible": "Test User",
    "stops": [
      {"name": "Origem", "coordinates": [-46.6333, -23.5505]},
      {"name": "Destino", "coordinates": [-46.6400, -23.5600]}
    ],
    "scheduling": {"type": "imediata"}
  }'

# Obter dados do usuário
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/me
```

---

## 📚 PRÓXIMOS PASSOS DE IMPLEMENTAÇÃO

### Fase 1: Endpoints Críticos (Semana 2)
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me
- ✅ GET /api/routes
- ✅ POST /api/routes

### Fase 2: CRUD Completo (Semana 3)
- ✅ PATCH /api/routes/:id
- ✅ DELETE /api/routes/:id
- ✅ GET /api/user
- ✅ PATCH /api/user
- ✅ POST /api/navigation/start

### Fase 3: Funcionalidades Avançadas (Semana 4)
- ✅ POST /api/routes/:id/optimize
- ✅ Endpoints de Mapbox
- ✅ Sistema de notificações
- ✅ Métricas e analytics

### Fase 4: Integrações (Semana 5)
- ✅ OAuth endpoints
- ✅ Billing/Stripe
- ✅ Email/SMTP
- ✅ WebSocket para tempo real

### Fase 5: Produção (Semana 6)
- ✅ Rate limiting avançado
- ✅ Monitoring endpoints
- ✅ Health checks
- ✅ Error tracking

---

## 📖 DOCUMENTAÇÃO ADICIONAL

### Arquivos de Referência
- `auth-endpoints.md` - Especificação detalhada de autenticação
- `routes-endpoints.md` - Especificação detalhada de rotas
- `DATABASE_SCHEMA.sql` - Schema completo do banco
- `STEP_BY_STEP.md` - Guia de implementação

### Links Úteis
- [Mapbox API Docs](https://docs.mapbox.com/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [JWT.io](https://jwt.io/) - Debug JWT tokens
- [Postman Collection](./postman-collection.json) - Coleção para testes

---

**✅ TODOS OS 34+ ENDPOINTS ESPECIFICADOS E PRONTOS PARA IMPLEMENTAÇÃO!**

Este documento serve como referência completa para implementar toda a API do backend da plataforma Viwe.
