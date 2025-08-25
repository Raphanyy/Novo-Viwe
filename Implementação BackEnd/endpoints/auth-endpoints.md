# 🔐 ENDPOINTS DE AUTENTICAÇÃO

## Visão Geral

Todos os endpoints de autenticação estão sob `/api/auth/` e implementam:

- Validação de entrada
- Rate limiting
- Hashing seguro de senhas
- JWT tokens
- Auditoria de ações

---

## POST /api/auth/register

### Descrição

Registra um novo usuário no sistema.

### Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "MinhaSenh@123"
}
```

### Validações

- `name`: obrigatório, 2-255 caracteres
- `email`: obrigatório, formato válido, único
- `password`: obrigatório, 8+ caracteres, 1 maiúscula, 1 número, 1 especial

### Response - Sucesso (201)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-15T10:15:00.000Z"
  }
}
```

### Response - Erro (400)

```json
{
  "error": "Email já está em uso"
}
```

### Implementação

```typescript
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validações
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  // Verificar email único
  const existing = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: "Email já está em uso" });
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash(password, 12);

  // Criar usuário + preferências
  const user = await query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, passwordHash],
  );

  // Gerar tokens e responder
});
```

---

## POST /api/auth/login

### Descrição

Autentica um usuário existente.

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "MinhaSenh@123"
}
```

### Validações

- `email`: obrigatório, formato válido
- `password`: obrigatório

### Response - Sucesso (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-15T10:15:00.000Z"
  }
}
```

### Response - Erro (401)

```json
{
  "error": "Email ou senha inválidos"
}
```

### Rate Limiting

- 5 tentativas por IP a cada 15 minutos
- Após 3 falhas: delay progressivo

---

## POST /api/auth/refresh

### Descrição

Renova um access token usando refresh token.

### Request

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response - Sucesso (200)

```json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response - Erro (401)

```json
{
  "error": "Refresh token inválido ou expirado"
}
```

---

## POST /api/auth/logout

### Descrição

Invalida tokens e encerra sessão.

### Request

```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "allDevices": false
}
```

### Response - Sucesso (200)

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## POST /api/auth/forgot-password

### Descrição

Inicia processo de recuperação de senha.

### Request

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "joao@example.com"
}
```

### Response - Sucesso (200)

```json
{
  "message": "Se o email existir, você receberá instruções para redefinir a senha"
}
```

### Processo

1. Verificar se email existe
2. Gerar token seguro (6 dígitos ou UUID)
3. Salvar token com expiração (1 hora)
4. Enviar email com token
5. Sempre retornar sucesso (segurança)

---

## POST /api/auth/reset-password

### Descrição

Redefine senha usando token recebido por email.

### Request

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456",
  "newPassword": "NovaSenha@456"
}
```

### Response - Sucesso (200)

```json
{
  "message": "Senha redefinida com sucesso"
}
```

---

## POST /api/auth/verify-email

### Descrição

Verifica email usando token enviado no registro.

### Request

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-here"
}
```

### Response - Sucesso (200)

```json
{
  "message": "Email verificado com sucesso"
}
```

---

## GET /api/auth/me

### Descrição

Retorna dados do usuário autenticado.

### Request

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response - Sucesso (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=joao@example.com",
    "isEmailVerified": true,
    "plan": "premium",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## GET /api/auth/oauth/google

### Descrição

Inicia processo de autenticação com Google.

### Request

```http
GET /api/auth/oauth/google
```

### Response

Redirect para Google OAuth com parâmetros corretos.

---

## GET /api/auth/oauth/google/callback

### Descrição

Callback do Google OAuth.

### Process

1. Receber code do Google
2. Trocar code por token
3. Obter dados do usuário
4. Criar/buscar usuário no banco
5. Gerar JWT tokens
6. Redirect para frontend com tokens

---

## Middleware de Autenticação

### authenticateToken

```typescript
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
```

### Uso

```typescript
// Aplicar em rotas protegidas
router.use("/api/routes", authenticateToken);
router.use("/api/user", authenticateToken);
```

---

## Rate Limiting

### Configuração

```typescript
// Auth endpoints - mais restritivo
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
```

---

## Segurança

### Password Hashing

```typescript
// Registro/alteração
const hash = await bcrypt.hash(password, 12);

// Login
const isValid = await bcrypt.compare(password, storedHash);
```

### JWT Tokens

```typescript
// Access token - curta duração
const accessToken = jwt.sign(payload, secret, { expiresIn: "15m" });

// Refresh token - longa duração
const refreshToken = jwt.sign({}, secret, { expiresIn: "30d" });
```

### Headers de Segurança

```typescript
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

---

## Auditoria

### Log de Eventos

```sql
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
VALUES ($1, 'login', 'User', $1, $2, $3);
```

### Eventos Auditados

- `register` - Registro de usuário
- `login` - Login bem-sucedido
- `login_failed` - Tentativa de login falhada
- `logout` - Logout
- `password_reset` - Redefinição de senha
- `email_verified` - Verificação de email

---

## Testes

### Exemplo de Teste

```bash
# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!@#"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'

# Usar token
TOKEN="obtained_access_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
```

---

## Próximos Passos

1. ✅ Implementar endpoints básicos
2. ✅ Adicionar OAuth (Google/Apple)
3. ✅ Sistema de email
4. ✅ Rate limiting avançado
5. ✅ 2FA/MFA (futuro)
