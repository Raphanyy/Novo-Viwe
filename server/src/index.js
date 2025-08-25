const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "*.mapbox.com"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    error: 'Muitas requisições de este IP, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Viwe Backend API',
    version: '1.0.0',
    description: 'API para otimização e navegação de rotas',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      routes: '/api/routes/*',
      navigation: '/api/navigation/*',
      users: '/api/users/*',
      mapbox: '/api/mapbox/*'
    },
    documentation: 'Ver arquivo README.md'
  });
});

// Teste básico
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando!', 
    database: process.env.DATABASE_URL ? 'configurado' : 'não configurado',
    jwt: process.env.JWT_SECRET ? 'configurado' : 'não configurado',
    mapbox: process.env.VITE_MAPBOX_ACCESS_TOKEN ? 'configurado' : 'não configurado'
  });
});

// TODO: Importar e usar rotas quando criadas
// const authRoutes = require('./routes/auth');
// const routeRoutes = require('./routes/routes');
// const navigationRoutes = require('./routes/navigation');
// const userRoutes = require('./routes/users');
// const mapboxRoutes = require('./routes/mapbox');

// app.use('/api/auth', authLimiter, authRoutes);
// app.use('/api/routes', routeRoutes);
// app.use('/api/navigation', navigationRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/mapbox', mapboxRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({ error: 'Dados já existem' });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando graciosamente...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Viwe rodando na porta ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log de configurações (sem mostrar secrets)
  console.log('📋 Configurações:');
  console.log(`   - Database: ${process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - JWT: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - Mapbox: ${process.env.VITE_MAPBOX_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
});

module.exports = app;
