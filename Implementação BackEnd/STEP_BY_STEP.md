# 📝 PASSO A PASSO DETALHADO - IMPLEMENTAÇÃO BACKEND

## 🎯 GUIA COMPLETO DE IMPLEMENTAÇÃO

Este documento detalha **EXATAMENTE** cada passo necessário para implementar o backend completo da plataforma Viwe.

---

## 🚀 FASE 1: PREPARAÇÃO E SETUP (Semana 1)

### 📅 DIA 1: Configuração do Banco de Dados

#### ⏰ Tempo Estimado: 2-3 horas

#### 🔴 Passo 1.1: Conectar Neon Database (OBRIGATÓRIO)
```bash
# 1. Acessar Neon
# Clique: [Connect to Neon](#open-mcp-popover)

# 2. Obter credenciais
# Host: xxxxx.neon.tech
# Port: 5432
# Database: main (ou nome escolhido)
# User: xxxxx
# Password: xxxxx

# 3. Testar conexão
psql "postgresql://user:password@host:5432/database" -c "SELECT version();"
```

#### 🔴 Passo 1.2: Executar Schema SQL
```bash
# 1. Navegar para pasta
cd "Implementação BackEnd"

# 2. Executar schema completo
psql "postgresql://user:password@host:5432/database" -f DATABASE_SCHEMA.sql

# 3. Verificar criação das tabelas
psql "postgresql://user:password@host:5432/database" -c "\dt"

# Deve mostrar 20 tabelas:
# - users
# - user_preferences  
# - auth_sessions
# - routes
# - route_stops
# - navigation_sessions
# - clients
# - notifications
# - plans
# - subscriptions
# - payment_history
# - route_metrics
# - user_stats
# - pois
# - search_results
# - system_config
# - audit_logs
# - route_sets
# - client_stops
```

#### ✅ Passo 1.3: Verificar Índices e Triggers
```bash
# 1. Verificar índices criados
psql "postgresql://user:password@host:5432/database" -c "\di"

# 2. Verificar triggers
psql "postgresql://user:password@host:5432/database" -c "SELECT trigger_name, event_object_table FROM information_schema.triggers;"

# 3. Verificar dados iniciais
psql "postgresql://user:password@host:5432/database" -c "SELECT * FROM plans;"
```

### 📅 DIA 2: Configuração Environment Variables

#### ⏰ Tempo Estimado: 1-2 horas

#### 🔴 Passo 2.1: Configurar .env
```bash
# 1. Copiar template
cp configs/environment.env.example .env

# 2. Gerar JWT secret
node scripts/generate-jwt-secret.js

# 3. Editar .env com SUAS credenciais
nano .env

# Preencher:
# DATABASE_URL=postgresql://user:pass@host:port/db
# JWT_SECRET=generated_secret_256_bits
# MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA
# STRIPE_SECRET_KEY=sk_test_...
# SMTP_HOST=smtp.sendgrid.net
# SMTP_USER=apikey
# SMTP_PASS=SG.xxxxx
```

#### ✅ Passo 2.2: Validar Configuração
```bash
# 1. Testar database connection
node scripts/verify-setup.js database

# 2. Testar JWT generation
node scripts/verify-setup.js jwt

# 3. Testar Mapbox token
node scripts/verify-setup.js mapbox
```

### 📅 DIA 3: Setup do Servidor

#### ⏰ Tempo Estimado: 2-3 horas

#### 🔴 Passo 3.1: Instalar Dependências
```bash
# 1. Navegar para pasta do servidor
cd server/

# 2. Inicializar package.json (se não existir)
npm init -y

# 3. Instalar dependências principais
npm install express cors helmet
npm install bcryptjs jsonwebtoken
npm install express-rate-limit
npm install winston
npm install nodemailer
npm install stripe
npm install passport passport-local passport-google-oauth20

# 4. Instalar dev dependencies
npm install --save-dev @types/node @types/express @types/bcryptjs @types/jsonwebtoken
npm install --save-dev typescript ts-node nodemon
npm install --save-dev @types/cors @types/passport

# 5. Criar tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

#### 🔴 Passo 3.2: Estrutura Básica do Servidor
```bash
# 1. Criar estrutura de pastas
mkdir -p src/{routes,middleware,utils,services,types}

# 2. Criar server principal
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', database: 'conectado' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
EOF

# 3. Atualizar package.json scripts
npm pkg set scripts.dev="nodemon src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
```

#### ✅ Passo 3.3: Testar Servidor
```bash
# 1. Iniciar servidor
npm run dev

# 2. Em outro terminal, testar
curl http://localhost:3001/health
curl http://localhost:3001/api/test

# Deve retornar JSON com status OK
```

---

## 🔐 FASE 2: SISTEMA DE AUTENTICAÇÃO (Semana 2)

### 📅 DIA 4-5: JWT e Middleware

#### ⏰ Tempo Estimado: 4-6 horas

#### 🔴 Passo 4.1: Implementar JWT Utils
```bash
# 1. Criar utils/jwt.ts
cat > src/utils/jwt.ts << 'EOF'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export const generateAccessToken = (user: { id: string; email: string; name: string }): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (): string => {
  return jwt.sign({}, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): boolean => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};
EOF

# 2. Criar middleware/auth.ts
cat > src/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
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
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
EOF
```

#### 🔴 Passo 4.2: Database Connection
```bash
# 1. Instalar pg (PostgreSQL client)
npm install pg @types/pg

# 2. Criar utils/database.ts
cat > src/utils/database.ts << 'EOF'
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
EOF
```

### 📅 DIA 6-7: Endpoints de Autenticação

#### ⏰ Tempo Estimado: 6-8 horas

#### 🔴 Passo 6.1: POST /api/auth/register
```bash
# 1. Instalar bcrypt
npm install bcryptjs @types/bcryptjs

# 2. Criar routes/auth.ts
cat > src/routes/auth.ts << 'EOF'
import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../utils/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 8 caracteres' });
    }

    // Verificar se email já existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const userResult = await query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = userResult.rows[0];

    // Criar preferências padrão
    await query(
      `INSERT INTO user_preferences (user_id) VALUES ($1)`,
      [user.id]
    );

    // Gerar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Salvar refresh token
    await query(
      `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken, await bcrypt.hash(refreshToken, 10)]
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
EOF
```

#### 🔴 Passo 6.2: POST /api/auth/login
```bash
# 1. Adicionar login ao routes/auth.ts
cat >> src/routes/auth.ts << 'EOF'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const userResult = await query(
      'SELECT id, name, email, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Atualizar último login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Gerar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Salvar refresh token
    await query(
      `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken, await bcrypt.hash(refreshToken, 10)]
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) 
       VALUES ($1, 'login', 'User', $1, $2)`,
      [user.id, req.ip]
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
EOF
```

#### 🔴 Passo 6.3: Integrar Rotas no Servidor
```bash
# 1. Atualizar src/index.ts
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// Rate limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
});

// Rotas
app.use('/api/auth', authLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
EOF
```

#### ✅ Passo 6.4: Testar Autenticação
```bash
# 1. Reiniciar servidor
npm run dev

# 2. Testar registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!@#"}'

# 3. Testar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Deve retornar user + tokens
```

---

## 🗺️ FASE 3: ROTAS E NAVEGAÇÃO (Semana 3-4)

### 📅 DIA 8-10: Endpoints de Rotas

#### ⏰ Tempo Estimado: 8-12 horas

#### 🔴 Passo 8.1: GET /api/routes
```bash
# 1. Criar routes/routes.ts
cat > src/routes/routes.ts << 'EOF'
import express from 'express';
import { query } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/routes
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, limit = 20, offset = 0, search } = req.query;
    const userId = req.user!.id;

    let queryText = `
      SELECT 
        r.id, r.name, r.description, r.status, r.priority,
        r.estimated_duration, r.estimated_distance, r.estimated_credits,
        r.created_at, r.updated_at, r.scheduled_date,
        COUNT(rs.id) as stop_count
      FROM routes r
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    // Filtro por status
    if (status && status !== 'all') {
      queryText += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Filtro por busca
    if (search) {
      queryText += ` AND (r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` 
      GROUP BY r.id, r.name, r.description, r.status, r.priority,
               r.estimated_duration, r.estimated_distance, r.estimated_credits,
               r.created_at, r.updated_at, r.scheduled_date
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      routes: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.rowCount,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar rotas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
EOF
```

#### 🔴 Passo 8.2: POST /api/routes
```bash
# 1. Adicionar criação de rota
cat >> src/routes/routes.ts << 'EOF'

// POST /api/routes
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { 
      name, 
      description, 
      responsible, 
      priority = 'media',
      stops,
      clients,
      routeSet,
      scheduling 
    } = req.body;

    // Validações
    if (!name || !responsible) {
      return res.status(400).json({ error: 'Nome e responsável são obrigatórios' });
    }

    if (!stops || stops.length === 0) {
      return res.status(400).json({ error: 'Pelo menos uma parada é obrigatória' });
    }

    // Calcular estimativas básicas
    const estimatedDistance = stops.length * 5000; // 5km por parada (estimativa)
    const estimatedDuration = stops.length * 1800; // 30 min por parada
    const estimatedCredits = Math.min(stops.length * 2, 20);

    // Criar rota
    const routeResult = await query(
      `INSERT INTO routes (
        user_id, name, description, responsible, priority,
        estimated_duration, estimated_distance, estimated_credits,
        scheduling_type, scheduled_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId, name, description, responsible, priority,
        estimatedDuration, estimatedDistance, estimatedCredits,
        scheduling.type, scheduling.date || null
      ]
    );

    const route = routeResult.rows[0];

    // Criar paradas
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      await query(
        `INSERT INTO route_stops (
          route_id, name, latitude, longitude, address, stop_order
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          route.id,
          stop.name,
          stop.coordinates[1], // latitude
          stop.coordinates[0], // longitude  
          stop.address,
          i + 1
        ]
      );
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) 
       VALUES ($1, 'create_route', 'Route', $2, $3)`,
      [userId, route.id, JSON.stringify({ name, stops: stops.length })]
    );

    res.status(201).json({ route });

  } catch (error) {
    console.error('Erro ao criar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
EOF
```

#### 🔴 Passo 8.3: Integrar Rotas no Servidor
```bash
# 1. Atualizar src/index.ts para incluir rotas
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import routeRoutes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Rate limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Rate limiting para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

// Rotas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/routes', routeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
EOF
```

### 📅 DIA 11-12: Sistema de Navegação

#### ⏰ Tempo Estimado: 6-8 horas

#### 🔴 Passo 11.1: POST /api/navigation/start
```bash
# 1. Criar routes/navigation.ts
cat > src/routes/navigation.ts << 'EOF'
import express from 'express';
import { query } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação
router.use(authenticateToken);

// POST /api/navigation/start
router.post('/start', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({ error: 'ID da rota é obrigatório' });
    }

    // Verificar se rota existe e pertence ao usuário
    const routeResult = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [routeId, userId]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }

    const route = routeResult.rows[0];

    // Verificar se não há navegação ativa
    const activeNavigation = await query(
      'SELECT id FROM navigation_sessions WHERE route_id = $1 AND status = $2',
      [routeId, 'active']
    );

    if (activeNavigation.rows.length > 0) {
      return res.status(400).json({ error: 'Navegação já está ativa para esta rota' });
    }

    // Buscar paradas da rota
    const stopsResult = await query(
      'SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order',
      [routeId]
    );

    const stops = stopsResult.rows;

    // Calcular distância total estimada
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      // Cálculo simples de distância (Haversine seria melhor)
      const lat1 = stops[i].latitude;
      const lng1 = stops[i].longitude;
      const lat2 = stops[i + 1].latitude;
      const lng2 = stops[i + 1].longitude;
      
      const distance = Math.sqrt(
        Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
      ) * 111000; // Aproximação em metros
      
      totalDistance += distance;
    }

    // Criar sessão de navegação
    const navigationResult = await query(
      `INSERT INTO navigation_sessions (
        route_id, user_id, status, navigation_mode, start_time,
        total_distance, remaining_distance, estimated_fuel_consumption
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $5, $6)
      RETURNING *`,
      [
        routeId, userId, 'active', 'active',
        totalDistance, totalDistance / 10000 // Estimativa: 1L por 10km
      ]
    );

    const session = navigationResult.rows[0];

    // Atualizar status da rota
    await query(
      'UPDATE routes SET status = $1, started_at = NOW() WHERE id = $2',
      ['active', routeId]
    );

    res.status(201).json({
      navigationSession: session,
      route,
      stops,
    });

  } catch (error) {
    console.error('Erro ao iniciar navegação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
EOF

# 2. Adicionar rota de navegação ao servidor principal
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import routeRoutes from './routes/routes';
import navigationRoutes from './routes/navigation';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

// Rotas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/navigation', navigationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
EOF
```

#### ✅ Passo 11.2: Testar Endpoints
```bash
# 1. Reiniciar servidor
npm run dev

# 2. Fazer login para obter token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  | jq -r '.tokens.accessToken')

# 3. Criar uma rota
ROUTE_ID=$(curl -s -X POST http://localhost:3001/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Rota Teste",
    "responsible": "João Silva", 
    "stops": [
      {"name": "Parada 1", "coordinates": [-46.6333, -23.5505], "address": "São Paulo, SP"},
      {"name": "Parada 2", "coordinates": [-46.6400, -23.5600], "address": "São Paulo, SP"}
    ],
    "scheduling": {"type": "imediata"}
  }' | jq -r '.route.id')

# 4. Iniciar navegação
curl -X POST http://localhost:3001/api/navigation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"routeId\": \"$ROUTE_ID\"}"

# 5. Listar rotas
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/routes
```

---

## 🌐 FASE 4: INTEGRAÇÕES EXTERNAS (Semana 5)

### 📅 DIA 13-14: Mapbox Backend

#### ⏰ Tempo Estimado: 4-6 horas

#### 🔴 Passo 13.1: Proxy Mapbox
```bash
# 1. Criar services/mapbox.ts
cat > src/services/mapbox.ts << 'EOF'
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export interface SearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
  properties: any;
}

export const geocoding = async (query: string): Promise<SearchResult[]> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Token do Mapbox não configurado');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=BR&language=pt&limit=8`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro no Mapbox: ${response.statusText}`);
  }

  const data = await response.json();
  return data.features.map((feature: any) => ({
    id: feature.id,
    place_name: feature.place_name,
    text: feature.text,
    center: feature.center,
    place_type: feature.place_type,
    properties: feature.properties,
  }));
};

export const directions = async (coordinates: number[][]): Promise<any> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Token do Mapbox não configurado');
  }

  const coordinatesString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?access_token=${MAPBOX_ACCESS_TOKEN}&steps=true&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro no Mapbox Directions: ${response.statusText}`);
  }

  return response.json();
};
EOF

# 2. Criar routes/mapbox.ts
cat > src/routes/mapbox.ts << 'EOF'
import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { geocoding, directions } from '../services/mapbox';

const router = express.Router();

// Rate limiting específico para Mapbox
const mapboxLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
});

router.use(mapboxLimiter);
router.use(authenticateToken);

// GET /api/mapbox/geocoding
router.get('/geocoding', async (req: AuthRequest, res) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    const results = await geocoding(query);
    res.json({ results });

  } catch (error) {
    console.error('Erro no geocoding:', error);
    res.status(500).json({ error: 'Erro ao buscar endereços' });
  }
});

// POST /api/mapbox/directions
router.post('/directions', async (req: AuthRequest, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({ error: 'Pelo menos 2 coordenadas são necessárias' });
    }

    const result = await directions(coordinates);
    res.json(result);

  } catch (error) {
    console.error('Erro no directions:', error);
    res.status(500).json({ error: 'Erro ao calcular rota' });
  }
});

export default router;
EOF

# 3. Adicionar ao servidor principal
# Atualizar src/index.ts para incluir rotas do Mapbox
```

### 📅 DIA 15: OAuth Setup

#### ⏰ Tempo Estimado: 4-5 horas

#### 🔴 Passo 15.1: Google OAuth
```bash
# 1. Instalar passport
npm install passport passport-google-oauth20
npm install --save-dev @types/passport @types/passport-google-oauth20

# 2. Configurar Google OAuth
cat > src/config/passport.ts << 'EOF'
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from '../utils/database';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;

      if (!email) {
        return done(new Error('Email não fornecido pelo Google'));
      }

      // Verificar se usuário já existe
      let userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (userResult.rows.length === 0) {
        // Criar novo usuário
        userResult = await query(
          'INSERT INTO users (name, email, is_email_verified) VALUES ($1, $2, true) RETURNING *',
          [name, email]
        );

        // Criar preferências padrão
        await query('INSERT INTO user_preferences (user_id) VALUES ($1)', [userResult.rows[0].id]);
      }

      return done(null, userResult.rows[0]);
    } catch (error) {
      return done(error);
    }
  }));
}

export default passport;
EOF

# 3. Adicionar rotas OAuth ao auth.ts
cat >> src/routes/auth.ts << 'EOF'

import passport from '../config/passport';

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      // Gerar tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();

      // Salvar refresh token
      await query(
        `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at) 
         VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
        [user.id, refreshToken, await bcrypt.hash(refreshToken, 10)]
      );

      // Redirect para frontend com tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
      
    } catch (error) {
      console.error('Erro no callback do Google:', error);
      res.redirect('/login?error=oauth_error');
    }
  }
);
EOF
```

---

## 💳 FASE 5: BILLING E STRIPE (Semana 6)

### 📅 DIA 16-17: Integração Stripe

#### ⏰ Tempo Estimado: 6-8 horas

#### 🔴 Passo 16.1: Setup Stripe
```bash
# 1. Instalar Stripe
npm install stripe

# 2. Criar services/stripe.ts
cat > src/services/stripe.ts << 'EOF'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createCustomer = async (user: any): Promise<string> => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  });

  return customer.id;
};

export const createSubscription = async (customerId: string, priceId: string): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
};

export const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export default stripe;
EOF

# 3. Criar routes/billing.ts
cat > src/routes/billing.ts << 'EOF'
import express from 'express';
import { query } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createCustomer, createSubscription } from '../services/stripe';

const router = express.Router();
router.use(authenticateToken);

// GET /api/billing/plans
router.get('/plans', async (req: AuthRequest, res) => {
  try {
    const plansResult = await query('SELECT * FROM plans WHERE is_active = true ORDER BY price_cents');
    res.json({ plans: plansResult.rows });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/billing/subscribe
router.post('/subscribe', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { planId } = req.body;

    // Buscar plano
    const planResult = await query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    const plan = planResult.rows[0];

    // Verificar se usuário já tem assinatura ativa
    const existingSubscription = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já possui assinatura ativa' });
    }

    // Buscar ou criar customer no Stripe
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    const customerId = await createCustomer(user);

    // Criar assinatura
    const subscriptionResult = await query(
      `INSERT INTO subscriptions (
        user_id, plan_id, status, start_date, end_date,
        amount_cents, currency, billing_period
      ) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month', $4, $5, $6)
      RETURNING *`,
      [userId, planId, 'active', plan.price_cents, plan.currency, plan.billing_period]
    );

    res.json({ subscription: subscriptionResult.rows[0] });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
EOF
```

---

## 🔄 FASE 6-10: FINALIZAÇÃO E MIGRAÇÃO

### 📅 Semana 7-8: Performance e Analytics

#### Implementar cache Redis (opcional)
#### Adicionar sistema de métricas
#### Otimizar queries do banco

### 📅 Semana 9: Testes Automatizados

#### Unit tests para utils e services
#### Integration tests para endpoints
#### E2E tests para fluxos principais

### 📅 Semana 10: Migração Frontend

#### Migrar AuthContext para usar APIs reais
#### Substituir dados mockados por chamadas HTTP
#### Implementar auto-refresh de tokens

### 📅 Semana 11-12: Deploy e Produção

#### Setup ambiente de produção
#### Configurar monitoramento
#### Migração de dados
#### Documentação final

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Banco de Dados
- [ ] Todas as 20 tabelas criadas
- [ ] Índices aplicados corretamente
- [ ] Triggers funcionando
- [ ] Dados iniciais carregados

### Autenticação
- [ ] JWT generation/validation
- [ ] Password hashing com bcrypt
- [ ] Refresh tokens funcionando
- [ ] Rate limiting ativo

### APIs
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/routes
- [ ] POST /api/routes
- [ ] POST /api/navigation/start

### Integrações
- [ ] Mapbox geocoding
- [ ] Mapbox directions
- [ ] Google OAuth
- [ ] Stripe basics

### Security
- [ ] CORS configurado
- [ ] Helmet ativo
- [ ] Rate limiting
- [ ] Input validation

---

**🎯 PRÓXIMO PASSO CRÍTICO:**
**[Connect to Neon](#open-mcp-popover)** ← Clique aqui para começar AGORA!

Depois execute: `psql $DATABASE_URL -f DATABASE_SCHEMA.sql`
