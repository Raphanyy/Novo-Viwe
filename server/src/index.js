const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Importar utils
const { healthCheck } = require("./utils/database");

// Importar rotas
const authRoutes = require("./routes/auth");
const routeRoutes = require("./routes/routes");
const mapboxRoutes = require("./routes/mapbox");
const navigationRoutes = require("./routes/navigation");
const userRoutes = require("./routes/users");
const clientRoutes = require("./routes/clients");
const { router: notificationRoutes } = require("./routes/notifications");
const billingRoutes = require("./routes/billing");
const dashboardRoutes = require("./routes/dashboard");
const poisRoutes = require("./routes/pois");

const app = express();
const PORT = process.env.PORT || 3001;

// CONFIGURAÇÃO IMPORTANTE PARA PROXIES (Fly.dev, Vercel, Netlify, etc.)
app.set("trust proxy", 1); // Trust first proxy

// Middleware de segurança
app.use(
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
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    error: "Muitas requisições de este IP, tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Importante para funcionar atrás de proxy
});
app.use(limiter);

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: "Muitas tentativas de login, tente novamente em 15 minutos.",
  },
  skipSuccessfulRequests: true,
  trustProxy: true,
});

// Health check avançado
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      database: dbHealth,
      services: {
        database: dbHealth.status === "healthy",
        jwt: !!process.env.JWT_SECRET,
        mapbox: !!(
          process.env.VITE_MAPBOX_ACCESS_TOKEN ||
          process.env.MAPBOX_ACCESS_TOKEN
        ),
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
    });
  }
});

// API Info
app.get("/api", (req, res) => {
  res.json({
    name: "Viwe Backend API",
    version: "1.0.0",
    description: "API para otimização e navegação de rotas",
    endpoints: {
      health: "/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
        test: "GET /api/auth/test",
      },
      routes: {
        list: "GET /api/routes",
        create: "POST /api/routes",
        get: "GET /api/routes/:id",
        update: "PATCH /api/routes/:id",
        delete: "DELETE /api/routes/:id",
        stats: "GET /api/routes/stats",
      },
      mapbox: {
        geocoding: "GET /api/mapbox/geocoding",
        reverse: "GET /api/mapbox/reverse",
        directions: "POST /api/mapbox/directions",
        optimization: "POST /api/mapbox/optimization",
        matrix: "POST /api/mapbox/matrix",
        isochrone: "GET /api/mapbox/isochrone",
        health: "GET /api/mapbox/health",
      },
      navigation: {
        start: "POST /api/navigation/start",
        update: "PATCH /api/navigation/:id",
        pause: "POST /api/navigation/:id/pause",
        resume: "POST /api/navigation/:id/resume",
        completeStop: "POST /api/navigation/:id/complete-stop",
        stop: "POST /api/navigation/:id/stop",
        get: "GET /api/navigation/:id",
        cancel: "DELETE /api/navigation/:id",
      },
      users: {
        profile: "GET /api/user",
        updateProfile: "PATCH /api/user",
        updatePreferences: "PATCH /api/user/preferences",
        uploadAvatar: "POST /api/user/avatar",
        changePassword: "POST /api/user/change-password",
        deleteAccount: "DELETE /api/user",
        sessions: "GET /api/user/sessions",
        revokeSession: "DELETE /api/user/sessions/:id",
      },
      clients: {
        list: "GET /api/clients",
        create: "POST /api/clients",
        get: "GET /api/clients/:id",
        update: "PATCH /api/clients/:id",
        delete: "DELETE /api/clients/:id",
        activate: "POST /api/clients/:id/activate",
        stats: "GET /api/clients/stats",
        nearby: "GET /api/clients/:id/nearby",
      },
      notifications: {
        list: "GET /api/notifications",
        markRead: "POST /api/notifications/:id/read",
        markAllRead: "POST /api/notifications/mark-all-read",
        archive: "POST /api/notifications/:id/archive",
        delete: "DELETE /api/notifications/:id",
        create: "POST /api/notifications/create",
        stats: "GET /api/notifications/stats",
      },
      billing: {
        plans: "GET /api/billing/plans",
        subscription: "GET /api/billing/subscription",
        subscribe: "POST /api/billing/subscribe",
        cancel: "POST /api/billing/cancel",
        history: "GET /api/billing/history",
        usage: "GET /api/billing/usage",
        webhook: "POST /api/billing/webhooks/stripe",
      },
    },
    documentation: "Ver documentação completa em /Implementação BackEnd/",
    features: {
      authentication: "JWT com refresh tokens",
      authorization: "Role-based access control",
      database: "PostgreSQL com 19 tabelas",
      geocoding: "Mapbox Geocoding API",
      routing: "Mapbox Directions & Optimization",
      rateLimit: "Proteção contra spam",
      security: "Helmet, CORS, sanitização",
    },
  });
});

// Teste básico
app.get("/api/test", (req, res) => {
  res.json({
    message: "Servidor funcionando!",
    timestamp: new Date().toISOString(),
    services: {
      database: process.env.DATABASE_URL
        ? "✅ configurado"
        : "❌ não configurado",
      jwt: process.env.JWT_SECRET ? "✅ configurado" : "❌ não configurado",
      mapbox:
        process.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN
          ? "✅ configurado"
          : "❌ não configurado",
    },
    environment: {
      node_env: process.env.NODE_ENV || "development",
      port: PORT,
      frontend_url: process.env.FRONTEND_URL || "http://localhost:8080",
    },
    proxy: {
      trust_proxy: app.get("trust proxy"),
      x_forwarded_for: req.headers["x-forwarded-for"] || "not set",
      real_ip: req.ip,
      remote_address: req.connection?.remoteAddress,
    },
  });
});

// ROTAS
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/mapbox", mapboxRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/billing", billingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token inválido" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expirado" });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Database errors
  if (err.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({ error: "Dados já existem" });
  }

  if (err.code === "ECONNREFUSED") {
    return res
      .status(503)
      .json({ error: "Falha na conexão com banco de dados" });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res
      .status(429)
      .json({ error: "Muitas requisições, tente novamente mais tarde" });
  }

  // Default error
  res.status(500).json({
    error: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint não encontrado",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: "GET /health",
      api_info: "GET /api",
      auth: "GET /api/auth/*",
      routes: "GET /api/routes",
      mapbox: "GET /api/mapbox/*",
    },
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Recebido SIGTERM, encerrando graciosamente...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Recebido SIGINT, encerrando graciosamente...");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Viwe rodando na porta ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`🗺️ Routes: http://localhost:${PORT}/api/routes`);
  console.log(`🌐 Mapbox: http://localhost:${PORT}/api/mapbox/*`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 Trust Proxy: ${app.get("trust proxy")}`);

  // Log de configurações (sem mostrar secrets)
  console.log("📋 Configurações:");
  console.log(
    `   - Database: ${process.env.DATABASE_URL ? "✅ Configurado" : "❌ Não configurado"}`,
  );
  console.log(
    `   - JWT: ${process.env.JWT_SECRET ? "✅ Configurado" : "❌ Não configurado"}`,
  );
  console.log(
    `   - Mapbox: ${process.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN ? "✅ Configurado" : "❌ Não configurado"}`,
  );

  // Testar conexão com banco na inicialização
  if (process.env.DATABASE_URL) {
    healthCheck()
      .then((health) => {
        console.log(`💾 Database: ${health.status}`);
        console.log(`📊 Tabelas: ${health.tables?.total || "N/A"}`);

        // Teste rápido do Mapbox se configurado
        const mapboxToken =
          process.env.VITE_MAPBOX_ACCESS_TOKEN ||
          process.env.MAPBOX_ACCESS_TOKEN;
        if (mapboxToken) {
          console.log("🗺️ Mapbox: Token configurado - serviços disponíveis");
        } else {
          console.log(
            "🗺️ Mapbox: Token não configurado - algumas funcionalidades limitadas",
          );
        }
      })
      .catch((err) => {
        console.error("❌ Erro na conexão inicial com banco:", err.message);
      });
  }
});

module.exports = app;
