# ANÁLISE COMPLETA DO SISTEMA DE AUTENTICAÇÃO E GERENCIAMENTO DE USUÁRIOS

## SITUAÇÃO ATUAL DO SISTEMA DE AUTENTICAÇÃO

### 1. IMPLEMENTAÇÃO EXISTENTE (SIMULADA)

#### AuthContext (client/contexts/AuthContext.tsx)
O sistema atual é completamente simulado:

```typescript
// Estado atual do AuthContext
interface User {
  id: string;        // Hard-coded como "1"
  name: string;      // Derivado do email (parte antes do @)
  email: string;     // Email fornecido no login
  avatar?: string;   // Gerado via DiceBear API
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;  // !!user
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateAvatar: (avatarUrl: string) => void;
  isLoading: boolean;
}
```

#### Comportamento Atual do Login
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  // Simula API call com setTimeout de 1s
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // ACEITA QUALQUER EMAIL/SENHA
  if (email && password) {
    const newUser: User = {
      id: "1",  // ID fixo
      name: email.split("@")[0],  // Nome do email
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    setUser(newUser);
    localStorage.setItem("viwe_user", JSON.stringify(newUser));
    return true;
  }
  return false;
};
```

#### Persistência Atual
- **Método**: localStorage com chave "viwe_user"
- **Dados armazenados**: User object completo (inseguro)
- **Recuperação**: useEffect no mount do AuthProvider
- **Expiração**: Nunca expira

### 2. PÁGINAS DE AUTENTICAÇÃO ANALISADAS

#### LoginPage.tsx
- **Campos**: email (required), password (required)
- **Validações**: HTML5 básico (required, type="email")
- **Estados locais**: email, password, showPassword, isLoading, error
- **Fluxo**: handleSubmit → useAuth().login() → navigate("/app")
- **Recursos**: botão "Esqueceu senha" (não funcional), Google Fonts
- **Observação**: "Para demonstração, use qualquer email e senha"

#### EmailLoginPage.tsx  
- **Similar ao LoginPage** mas com UI mais compacta
- **Mesma simulação** de autenticação

#### SignupPage.tsx
- **Campos**: name, email, password, confirmPassword
- **Validações locais**:
  - Senhas coincidem
  - Senha mínima 6 caracteres
- **Estados**: name, email, password, confirmPassword, showPassword, showConfirmPassword, isLoading, error
- **Fluxo anômalo**: Cadastro chama login() ao invés de register
- **Observação**: "Em um app real, deveria chamar API de registro"

#### MobileLoginPage.tsx
- **OAuth Simulado**: Google e Apple
- **Implementação**: handleGoogleLogin/handleAppleLogin chamam login() com emails fixos
- **Não há integração real** com OAuth providers

### 3. PROBLEMAS CRÍTICOS IDENTIFICADOS

#### Segurança
- ❌ **Sem validação de credenciais**
- ❌ **Dados sensíveis em localStorage**
- ��� **ID de usuário fixo ("1")**
- ❌ **Sem tokens JWT ou sessões**
- ❌ **Sem hash de senhas**
- ❌ **Sem proteção CSRF**
- ❌ **Sem rate limiting**

#### Funcionalidades Ausentes
- ❌ **Verificação de email**
- ❌ **Recuperação de senha**
- ❌ **OAuth real (Google/Apple)**
- ❌ **2FA/MFA**
- ❌ **Gestão de sessões**
- ❌ **Logout de todas as sessões**
- ❌ **Auditoria de logins**

#### UX/UI
- ❌ **Formulário de recuperação de senha**
- ❌ **Feedback de força de senha**
- ❌ **Verificação de email duplicado**
- ❌ **Onboarding pós-cadastro**

## SISTEMA DE AUTENTICAÇÃO RECOMENDADO

### 1. ARQUITETURA DE SEGURANÇA

#### Tokens JWT
```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;
  name: string;
  plan?: string;
  permissions: string[];
  iat: number;           // Issued at
  exp: number;           // Expires at
  iss: string;           // Issuer
}

interface AuthTokens {
  accessToken: string;   // JWT de curta duração (15min)
  refreshToken: string;  // Token de longa duração (30 dias)
  expiresAt: Date;
}
```

#### Sessões Seguras
```typescript
interface AuthSession {
  id: string;
  userId: string;
  refreshToken: string;
  device?: string;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}
```

### 2. ENDPOINTS DE AUTENTICAÇÃO NECESSÁRIOS

#### Registro
```typescript
POST /api/auth/register
{
  name: string;
  email: string;
  password: string;
}

Response: {
  user: User;
  tokens: AuthTokens;
  requiresEmailVerification: boolean;
}
```

#### Login
```typescript
POST /api/auth/login
{
  email: string;
  password: string;
  rememberMe?: boolean;
}

Response: {
  user: User;
  tokens: AuthTokens;
}
```

#### Refresh Token
```typescript
POST /api/auth/refresh
{
  refreshToken: string;
}

Response: {
  tokens: AuthTokens;
}
```

#### Verificação de Email
```typescript
POST /api/auth/verify-email
{
  token: string;
}

GET /api/auth/resend-verification
```

#### Recuperação de Senha
```typescript
POST /api/auth/forgot-password
{
  email: string;
}

POST /api/auth/reset-password
{
  token: string;
  newPassword: string;
}
```

#### OAuth
```typescript
GET /api/auth/oauth/google
GET /api/auth/oauth/apple
GET /api/auth/oauth/callback/:provider
```

### 3. VALIDAÇÕES E REGRAS DE NEGÓCIO

#### Senha
```typescript
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
  preventCommonPasswords: true;
  preventUserDataInPassword: true;
}
```

#### Email
- Validação de formato
- Verificação de domínio existente
- Prevenção de emails temporários
- Verificação obrigatória

#### Rate Limiting
- Login: 5 tentativas por IP/15min
- Registro: 3 tentativas por IP/hora  
- Recuperação: 1 tentativa por email/5min
- Verificação: 1 envio por email/1min

### 4. IMPLEMENTAÇÃO DO AUTHCONTEXT ATUALIZADO

```typescript
interface AuthContextType {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  
  // Autenticação
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: (allDevices?: boolean) => Promise<void>;
  
  // OAuth
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  
  // Verificação
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  
  // Recuperação de senha
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  
  // Perfil
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateAvatar: (file: File) => Promise<string>;
  
  // Sessões
  getSessions: () => Promise<AuthSession[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: () => Promise<boolean>;
}
```

### 5. SEGURANÇA E PROTEÇÕES

#### Headers de Segurança
```typescript
// Configurações necessárias no servidor
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

#### Interceptors HTTP
```typescript
// Automatizar refresh de tokens
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await refreshToken();
        return axios.request(error.config);
      } catch (refreshError) {
        logout();
        throw refreshError;
      }
    }
    throw error;
  }
);
```

### 6. PLANO DE MIGRAÇÃO

#### Fase 1: Backend de Autenticação
1. **Criar endpoints básicos**: /auth/login, /auth/register
2. **Implementar JWT**: geração e validação
3. **Setup de database**: users, auth_sessions
4. **Middleware de autenticação**

#### Fase 2: Frontend Integration  
1. **Atualizar AuthContext**: usar APIs reais
2. **Implementar token refresh**: interceptors automáticos
3. **Adicionar loading states**: melhor UX
4. **Tratamento de erros**: messages user-friendly

#### Fase 3: Funcionalidades Avançadas
1. **Verificação de email**: templates + envio
2. **Recuperação de senha**: fluxo completo  
3. **OAuth integration**: Google + Apple
4. **2FA/MFA**: TOTP ou SMS

#### Fase 4: Segurança Avançada
1. **Rate limiting**: Redis + middleware
2. **Auditoria**: logs de tentativas
3. **Device fingerprinting**: detecção de dispositivos
4. **Sessões múltiplas**: gestão completa

### 7. COMPONENTES DE UI NECESSÁRIOS

#### Novos Componentes
```typescript
// Verificação de email
<EmailVerificationPage />
<ResendVerificationButton />

// Recuperação de senha
<ForgotPasswordPage />
<ResetPasswordPage />

// Força de senha
<PasswordStrengthIndicator />
<PasswordRequirements />

// OAuth
<GoogleLoginButton />
<AppleLoginButton />

// Sessões
<ActiveSessionsList />
<DeviceManagement />

// 2FA
<TwoFactorSetup />
<TOTPInput />
```

#### Melhorias nos Existentes
```typescript
// LoginPage.tsx
- Adicionar "Lembrar-me"
- Implementar loading states
- Melhor tratamento de erros
- Link funcional "Esqueceu senha"

// SignupPage.tsx  
- Verificação de email duplicado
- Indicador de força de senha
- Termos de uso e política
- Validações em tempo real

// ProfilePage.tsx
- Seção de segurança
- Gestão de sessões
- Configuração 2FA
```

### 8. CONFIGURAÇÕES DE ENVIRONMENT

```env
# JWT
JWT_SECRET=seu_jwt_secret_super_forte
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
APPLE_CLIENT_ID=seu_apple_client_id
APPLE_PRIVATE_KEY=caminho_para_apple_key

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua_sendgrid_api_key
FROM_EMAIL=noreply@viwe.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
```

### 9. TESTES NECESSÁRIOS

#### Unitários
- Validação de senha
- Geração de JWT
- Hash de senhas
- Rate limiting

#### Integração
- Fluxo de login completo
- Refresh de tokens
- OAuth callbacks
- Envio de emails

#### E2E
- Registro → verificação → login
- Recuperação de senha
- Login com OAuth
- Logout de múltiplas sessões

### 10. MONITORAMENTO E MÉTRICAS

#### Logs de Segurança
- Tentativas de login (sucesso/falha)
- Criação de contas
- Alterações de senha
- Atividade OAuth
- Tentativas de rate limit

#### Métricas de Negócio
- Taxa de conversão signup → verificação
- Taxa de abandono no login
- Uso de OAuth vs senha
- Tempo de sessão médio

## PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### 🔴 CRÍTICO (Semana 1-2)
1. ✅ **Endpoints básicos**: login, register, refresh
2. ✅ **JWT implementation**: geração e validação
3. ✅ **AuthContext migration**: usar APIs reais
4. ✅ **Validações básicas**: senha, email

### 🟡 IMPORTANTE (Semana 3-4)  
1. ✅ **Verificação de email**: envio + validação
2. ✅ **Recuperação de senha**: fluxo completo
3. ✅ **Rate limiting**: proteção básica
4. ✅ **Error handling**: UX melhorado

### 🟢 DESEJÁVEL (Semana 5-8)
1. ✅ **OAuth integration**: Google + Apple
2. ✅ **Gestão de sessões**: múltiplos dispositivos  
3. ✅ **2FA/MFA**: TOTP básico
4. ✅ **Auditoria**: logs completos

---

**PRÓXIMO PASSO RECOMENDADO**: [Connect to Neon](#open-mcp-popover) para configurar banco de dados PostgreSQL e começar implementação dos endpoints de autenticação.
