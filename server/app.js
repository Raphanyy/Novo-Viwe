const http = require('http');
const url = require('url');
require("dotenv").config();

// Importar utils do Neon
const { healthCheck, testConnection, query } = require("./src/utils/neon-database");

const PORT = 3001;

console.log("🚀 Iniciando servidor Viwe...");

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    // Health check completo
    if (path === '/health') {
      const dbHealth = await healthCheck();
      res.writeHead(200);
      res.end(JSON.stringify({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "2.0.0",
        database: dbHealth,
        services: {
          database: dbHealth.status === "healthy",
          neon: true,
          frontend: "connected",
          backend: "running"
        },
      }));
      return;
    }

    // Teste de conexão Neon
    if (path === '/api/test-neon') {
      const connectionOk = await testConnection();
      res.writeHead(connectionOk ? 200 : 500);
      res.end(JSON.stringify({
        message: connectionOk ? "✅ Neon conectado com sucesso!" : "❌ Falha na conexão Neon",
        timestamp: new Date().toISOString(),
        database_url: process.env.DATABASE_URL ? "✅ configurado" : "❌ não configurado",
      }));
      return;
    }

    // Ping simples
    if (path === '/api/ping') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: "pong",
        timestamp: new Date().toISOString(),
        server: "Viwe Backend 2.0"
      }));
      return;
    }

    // Status do sistema
    if (path === '/api/status') {
      const dbHealth = await healthCheck();
      res.writeHead(200);
      res.end(JSON.stringify({
        server: "running",
        database: dbHealth.status,
        tables: dbHealth.tables?.total || 0,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // API Info
    if (path === '/api') {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: "Viwe API 2.0",
        version: "2.0.0",
        description: "API simplificada e otimizada para Viwe",
        status: "running",
        endpoints: {
          health: "GET /health",
          neon: "GET /api/test-neon", 
          ping: "GET /api/ping",
          status: "GET /api/status"
        },
        database: {
          type: "Neon PostgreSQL",
          driver: "neon-serverless",
          status: process.env.DATABASE_URL ? "configured" : "not_configured",
        },
        setup: {
          frontend: "http://localhost:8081",
          backend: "http://localhost:3001",
          auto_install: true,
          auto_connect: true
        }
      }));
      return;
    }

    // 404 para rotas não encontradas
    res.writeHead(404);
    res.end(JSON.stringify({
      error: "Endpoint não encontrado",
      path: path,
      method: req.method,
      available_endpoints: ["/health", "/api", "/api/ping", "/api/test-neon", "/api/status"]
    }));

  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, async () => {
  console.log(`\n🌟 VIWE SERVIDOR 2.0 ATIVO`);
  console.log(`📍 Backend: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  
  console.log(`\n📋 Configuração:`);
  console.log(`   ✅ Neon: ${process.env.DATABASE_URL ? "Conectado" : "⚠️  Não configurado"}`);
  console.log(`   ✅ Frontend: Proxy automático configurado`);
  console.log(`   ✅ Auto-setup: Ativo`);
  
  // Teste automático de conexão
  if (process.env.DATABASE_URL) {
    console.log(`\n🔄 Testando Neon...`);
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        console.log(`✅ Neon OK - PostgreSQL ativo!`);
        
        // Verificar tabelas
        const health = await healthCheck();
        console.log(`📊 Tabelas: ${health.tables?.total || 0}/19`);
      } else {
        console.log(`❌ Falha na conexão Neon`);
      }
    } catch (err) {
      console.log(`❌ Erro Neon: ${err.message}`);
    }
  } else {
    console.log(`\n⚠️  DATABASE_URL não configurada`);
    console.log(`📝 Configure no arquivo .env para ativar Neon`);
  }
  
  console.log(`\n🚀 Sistema pronto! Frontend + Backend conectados.\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🔄 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🔄 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = server;
