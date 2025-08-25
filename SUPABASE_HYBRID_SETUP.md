# Implementação Híbrida Express + Supabase

Este projeto implementa uma arquitetura híbrida que combina Express.js no backend com Supabase como BaaS (Backend-as-a-Service).

## 🏗️ Arquitetura

### Fluxo de Dados

```
Frontend ──┐
           ├── Supabase (CRUD direto, Auth, Realtime)
           └── Express ──── Supabase (Lógica de negócio, Admin)
```

### Componentes

1. **Frontend → Supabase Direto**: Para operações simples (CRUD, autenticação, subscriptions)
2. **Frontend → Express → Supabase**: Para lógica complexa, validações e operações administrativas

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_URL=https://your-project-id.supabase.co

SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Configuração do Supabase

No painel do Supabase:

1. Crie um novo projeto
2. Copie a URL e as chaves da aba "Settings > API"
3. Configure RLS (Row Level Security) nas tabelas necessárias

### 3. Schema Exemplo

```sql
-- Tabela de perfis (opcional)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

## 🚀 Como Usar

### Frontend - Autenticação

```typescript
import { useAuth } from '@/contexts/SupabaseAuthContext';

const { user, signIn, signOut, loading } = useAuth();

// Login
await signIn('user@example.com', 'password');

// Logout
await signOut();
```

### Frontend - Dados Diretos

```typescript
import { db } from '@/lib/supabase';

// Consulta direta ao Supabase
const { data, error } = await db.from('profiles').select('*');
```

### Frontend - Chamadas para Express

```typescript
import { authenticatedFetch } from '@/lib/supabase';

// Chamada autenticada para o Express
const response = await authenticatedFetch('/api/users/profile');
const data = await response.json();
```

### Backend - Middleware de Auth

```typescript
import { authMiddleware, requireAuth } from '@/middleware/auth';

// Aplicar em todas as rotas
app.use(authMiddleware);

// Rota protegida
app.get('/api/protected', requireAuth, (req, res) => {
  const user = req.user; // Dados do usuário autenticado
  res.json({ message: `Hello ${user.email}` });
});
```

### Backend - Operações no Supabase

```typescript
import { supabasePublic, supabaseAdmin } from '@/lib/supabase';

// Cliente público (respeitando RLS)
const { data } = await supabasePublic
  .from('profiles')
  .select('*')
  .eq('id', userId);

// Cliente admin (ignora RLS)
const { data } = await supabaseAdmin
  .from('profiles')
  .select('*');
```

## 🔧 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Status de autenticação

### Usuários
- `GET /api/users/profile` - Perfil do usuário atual
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/analytics` - Analytics do usuário

### Admin
- `GET /api/admin/users` - Listar usuários (admin only)

### Utilitários
- `GET /api/health` - Health check do sistema
- `GET /api/ping` - Ping simples

## 🧪 Teste

Acesse `/supabase-demo` para testar a integração completa.

## 🔒 Segurança

### Boas Práticas Implementadas

1. **RLS (Row Level Security)**: Configurado no Supabase
2. **Middleware de Auth**: Verificação de tokens JWT
3. **Separação de Chaves**: 
   - `ANON_KEY`: Frontend (segura para exposição)
   - `SERVICE_ROLE_KEY`: Backend (nunca expor)
4. **Validação no Express**: Para lógica de negócio crítica

### Quando Usar Cada Abordagem

**Frontend → Supabase Direto:**
- ✅ CRUD simples de dados do usuário
- ✅ Autenticação (login/logout)
- ✅ Realtime subscriptions
- ✅ Upload de arquivos

**Frontend → Express → Supabase:**
- ✅ Validações complexas de negócio
- ✅ Operações administrativas
- ✅ Integração com APIs externas
- ✅ Processamento de dados complexo
- ✅ Logs e auditoria

## 🚧 Próximos Passos

1. **Configurar tabelas no Supabase**: Adicione as tabelas necessárias para seu projeto
2. **Configurar RLS**: Implemente políticas de segurança apropriadas
3. **Customizar rotas**: Adapte as APIs para suas necessidades específicas
4. **Configurar Realtime**: Para funcionalidades em tempo real
5. **Deploy**: Configure variáveis de ambiente na produção

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [APIs REST Auto-geradas](https://supabase.com/docs/guides/api)
- [Realtime](https://supabase.com/docs/guides/realtime)
