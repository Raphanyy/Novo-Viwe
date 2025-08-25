const http = require('http');
const url = require('url');
require("dotenv").config();

// Importar utils do Neon
const { healthCheck, testConnection } = require("./src/utils/neon-database");

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  res.setHeader('Content-Type', 'application/json');

  try {
    if (path === '/health') {
      const dbHealth = await healthCheck();
      res.writeHead(200);
      res.end(JSON.stringify({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
        database: dbHealth,
        services: {
          database: dbHealth.status === "healthy",
          neon: true,
        },
      }));
    } else if (path === '/api/test-neon') {
      const connectionOk = await testConnection();
      res.writeHead(connectionOk ? 200 : 500);
      res.end(JSON.stringify({
        message: connectionOk ? "✅ Conexão com Neon estabelecida com sucesso!" : "❌ Falha na conexão com Neon",
        timestamp: new Date().toISOString(),
        database_url: process.env.DATABASE_URL ? "✅ configurado" : "❌ não configurado",
      }));
    } else if (path === '/api/ping') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: "pong",
        timestamp: new Date().toISOString(),
      }));
    } else if (path === '/api') {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: "Viwe Backend API - Neon Edition",
        version: "1.0.0",
        description: "API minimalista para testar integração com Neon",
        endpoints: {
          health: "/health",
          testNeon: "/api/test-neon",
          ping: "/api/ping",
        },
        database: {
          type: "Neon PostgreSQL",
          driver: "neon-serverless",
          status: process.env.DATABASE_URL ? "configured" : "not_configured",
        },
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: "Endpoint não encontrado",
        path: path,
        method: req.method,
      }));
    }
  } catch (error) {
    console.error("Error:", error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor minimal rodando na porta ${PORT}`);
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

module.exports = server;
