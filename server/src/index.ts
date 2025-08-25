import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { testConnection } from "./utils/database";

// Importar rotas
import authRoutes from "./routes/auth";
import routeRoutes from "./routes/routes";
import navigationRoutes from "./routes/navigation";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// CORS configurado para desenvolvimento
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parser de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: "Muitas requisições deste IP, tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: "Muitas tentativas de login, tente novamente em 15 minutos.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  skipSuccessfulRequests: true,
});

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

// Rota de teste básica
app.get("/api/test", (req, res) => {
  res.json({
    message: "Servidor Viwe funcionando!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Rotas da API
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/navigation", navigationRoutes);

// Middleware de erro global
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Erro não tratado:", err);

    res.status(err.status || 500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : err.message,
      code: "INTERNAL_ERROR",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  },
);

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint não encontrado",
    code: "NOT_FOUND",
    path: req.originalUrl,
  });
});

// Inicializar servidor
app.listen(PORT, async () => {
  console.log("🚀 Servidor Viwe iniciado!");
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  // Testar conexão com banco
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log("✅ Banco de dados conectado");
  } else {
    console.log("❌ Falha na conexão com banco de dados");
    console.log(
      "💡 Certifique-se de ter conectado ao Neon e configurado DATABASE_URL",
    );
  }

  console.log("\n📡 Endpoints disponíveis:");
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/test - Teste básico`);
  console.log(`   POST /api/auth/register - Registrar usuário`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`   GET  /api/auth/me - Dados do usuário`);
  console.log(`   GET  /api/routes - Listar rotas`);
  console.log(`   POST /api/routes - Criar rota`);
  console.log(`   POST /api/navigation/start - Iniciar navegação`);
  console.log("\n🔗 Acesse: http://localhost:" + PORT);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 Recebido SIGTERM, encerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📴 Recebido SIGINT, encerrando servidor...");
  process.exit(0);
});

export default app;
