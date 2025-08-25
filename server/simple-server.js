const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importar utils do Neon
const { healthCheck, testConnection } = require("./src/utils/neon-database");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());

// Health check avançado com Neon
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
        neon: true,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
      details: error.message,
    });
  }
});

// Teste da conexão Neon
app.get("/api/test-neon", async (req, res) => {
  try {
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      res.json({
        message: "✅ Conexão com Neon estabelecida com sucesso!",
        timestamp: new Date().toISOString(),
        database_url: process.env.DATABASE_URL ? "✅ configurado" : "❌ não configurado",
      });
    } else {
      res.status(500).json({
        message: "❌ Falha na conexão com Neon",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "❌ Erro ao testar conexão com Neon",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Info básica
app.get("/api", (req, res) => {
  res.json({
    name: "Viwe Backend API - Neon Edition",
    version: "1.0.0",
    description: "API simplificada para testar integração com Neon",
    endpoints: {
      health: "/health",
      testNeon: "/api/test-neon",
    },
    database: {
      type: "Neon PostgreSQL",
      driver: "neon-serverless",
      status: process.env.DATABASE_URL ? "configured" : "not_configured",
    },
  });
});

// Ping simples
app.get("/api/ping", (req, res) => {
  res.json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint não encontrado",
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Teste Neon: http://localhost:${PORT}/api/test-neon`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  
  // Log de configurações
  console.log("📋 Configurações:");
  console.log(`   - Database (Neon): ${process.env.DATABASE_URL ? "✅ Configurado" : "❌ Não configurado"}`);
  
  // Testar conexão na inicialização
  if (process.env.DATABASE_URL) {
    console.log("🔄 Testando conexão com Neon...");
    testConnection()
      .then(() => {
        console.log("✅ Conexão com Neon OK!");
      })
      .catch((err) => {
        console.error("❌ Erro na conexão com Neon:", err.message);
      });
  } else {
    console.log("⚠️  DATABASE_URL não configurada");
  }
});

module.exports = app;
