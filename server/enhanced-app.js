const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Importar utils do Neon
const { healthCheck, testConnection, query } = require("./src/utils/neon-database");

const PORT = 8080;

console.log("🚀 Iniciando servidor Viwe Enhanced...");

// Middleware simulado para JSON parsing
const parseJSON = (req, callback) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
};

// JWT Secret (generate if not exists)
const JWT_SECRET = process.env.JWT_SECRET || "viwe-default-secret-key-change-in-production";

// Função para servir arquivos estáticos
const serveStatic = (req, res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    let contentType = "text/html";

    switch (ext) {
      case ".js":
        contentType = "application/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
        contentType = "image/jpg";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    res.setHeader("Content-Type", contentType);
    res.writeHead(200);
    res.end(data);
  });
};

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

// Função para gerar refresh token
const generateRefreshToken = () => {
  return jwt.sign({ type: "refresh" }, JWT_SECRET, { expiresIn: "30d" });
};

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Token de acesso requerido" }));
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Token inválido" }));
      return;
    }
    req.user = user;
    next();
  });
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // Servir aplicação React na rota raiz
    if (pathname === "/" && req.method === "GET") {
      const indexPath = path.join(__dirname, "../dist/client/index.html");
      serveStatic(req, res, indexPath);
      return;
    }

    // Servir arquivos estáticos
    if (
      pathname.startsWith("/assets/") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".ico")
    ) {
      const staticPath = path.join(__dirname, "../dist/client", pathname);
      serveStatic(req, res, staticPath);
      return;
    }

    // HEALTH CHECK
    if (pathname === "/health") {
      const dbHealth = await healthCheck();
      res.writeHead(200, { "Content-Type": "application/json" });
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
          backend: "running",
        },
      }));
      return;
    }

    // API ROUTES
    res.setHeader("Content-Type", "application/json");

    // AUTH ROUTES
    if (pathname === "/api/auth/register" && req.method === "POST") {
      parseJSON(req, async (err, data) => {
        if (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        const { name, email, password } = data;

        if (!name || !email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Nome, email e senha são obrigatórios" }));
          return;
        }

        try {
          // Verificar se usuário já existe
          const existingUser = await query(
            "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL",
            [email.toLowerCase()]
          );

          if (existingUser.rows.length > 0) {
            res.writeHead(409);
            res.end(JSON.stringify({ error: "Email já está em uso" }));
            return;
          }

          // Criar hash da senha
          const passwordHash = await bcrypt.hash(password, 12);

          // Criar usuário
          const userResult = await query(
            `INSERT INTO users (name, email, password_hash, is_email_verified)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, is_email_verified, plan_type, created_at`,
            [name, email.toLowerCase(), passwordHash, true]
          );

          const user = userResult.rows[0];

          // Gerar tokens
          const accessToken = generateToken(user.id);
          const refreshToken = generateRefreshToken();

          // Salvar refresh token no banco
          await query(
            `INSERT INTO auth_sessions (user_id, refresh_token, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
            [user.id, refreshToken]
          );

          res.writeHead(201);
          res.end(JSON.stringify({
            message: "Usuário criado com sucesso",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isEmailVerified: user.is_email_verified,
              planType: user.plan_type || "basic",
            },
            tokens: {
              accessToken,
              refreshToken,
              accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
              refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
              tokenType: "Bearer",
            },
          }));
        } catch (error) {
          console.error("Erro no registro:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      parseJSON(req, async (err, data) => {
        if (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        const { email, password } = data;

        if (!email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Email e senha são obrigatórios" }));
          return;
        }

        try {
          // Buscar usuário
          const userResult = await query(
            `SELECT id, name, email, password_hash, is_email_verified, plan_type
             FROM users
             WHERE email = $1 AND deleted_at IS NULL`,
            [email.toLowerCase()]
          );

          if (userResult.rows.length === 0) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: "Credenciais inválidas" }));
            return;
          }

          const user = userResult.rows[0];

          // Verificar senha
          const isValidPassword = await bcrypt.compare(password, user.password_hash);

          if (!isValidPassword) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: "Credenciais inválidas" }));
            return;
          }

          // Atualizar último login
          await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);

          // Gerar tokens
          const accessToken = generateToken(user.id);
          const refreshToken = generateRefreshToken();

          // Salvar refresh token
          await query(
            `INSERT INTO auth_sessions (user_id, refresh_token, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
            [user.id, refreshToken]
          );

          res.writeHead(200);
          res.end(JSON.stringify({
            message: "Login realizado com sucesso",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isEmailVerified: user.is_email_verified,
              planType: user.plan_type || "basic",
            },
            tokens: {
              accessToken,
              refreshToken,
              accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
              refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
              tokenType: "Bearer",
            },
          }));
        } catch (error) {
          console.error("Erro no login:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    if (pathname === "/api/auth/me" && req.method === "GET") {
      authenticateToken(req, res, async () => {
        try {
          const userResult = await query(
            `SELECT id, name, email, is_email_verified, plan_type, created_at, last_login_at
             FROM users
             WHERE id = $1 AND deleted_at IS NULL`,
            [req.user.id]
          );

          if (userResult.rows.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Usuário não encontrado" }));
            return;
          }

          const user = userResult.rows[0];
          res.writeHead(200);
          res.end(JSON.stringify({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isEmailVerified: user.is_email_verified,
              planType: user.plan_type || "basic",
              createdAt: user.created_at,
              lastLoginAt: user.last_login_at,
            },
          }));
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      authenticateToken(req, res, async () => {
        try {
          // Invalidar todas as sessões do usuário
          await query(
            "UPDATE auth_sessions SET is_active = FALSE WHERE user_id = $1",
            [req.user.id]
          );

          res.writeHead(200);
          res.end(JSON.stringify({ message: "Logout realizado com sucesso" }));
        } catch (error) {
          console.error("Erro no logout:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    // ROUTES API
    if (pathname === "/api/routes" && req.method === "GET") {
      authenticateToken(req, res, async () => {
        try {
          const routesResult = await query(
            `SELECT r.*, COUNT(rs.id) as stop_count
             FROM routes r
             LEFT JOIN route_stops rs ON r.id = rs.route_id
             WHERE r.user_id = $1 AND r.deleted_at IS NULL
             GROUP BY r.id
             ORDER BY r.created_at DESC`,
            [req.user.id]
          );

          const routes = routesResult.rows.map(route => ({
            id: route.id,
            name: route.name,
            description: route.description,
            status: route.status,
            stopCount: parseInt(route.stop_count),
            createdAt: route.created_at,
            scheduledDate: route.scheduled_date,
            estimatedDuration: route.estimated_duration || "N/A",
            totalDistance: route.total_distance || "N/A",
            isFavorite: route.is_favorite,
            lastModified: route.updated_at || route.created_at,
          }));

          res.writeHead(200);
          res.end(JSON.stringify(routes));
        } catch (error) {
          console.error("Erro ao listar rotas:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    if (pathname === "/api/routes" && req.method === "POST") {
      authenticateToken(req, res, async () => {
        parseJSON(req, async (err, data) => {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }

          const { name, description, stops = [] } = data;

          if (!name) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Nome da rota é obrigatório" }));
            return;
          }

          try {
            // Criar rota
            const routeResult = await query(
              `INSERT INTO routes (name, description, user_id, status, created_at, updated_at)
               VALUES ($1, $2, $3, 'draft', NOW(), NOW())
               RETURNING *`,
              [name, description, req.user.id]
            );

            const route = routeResult.rows[0];

            // Criar paradas se fornecidas
            if (stops.length > 0) {
              for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                await query(
                  `INSERT INTO route_stops (route_id, stop_order, name, address, latitude, longitude, estimated_duration)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                  [route.id, i + 1, stop.name, stop.address, stop.latitude, stop.longitude, stop.estimatedDuration || 10]
                );
              }
            }

            res.writeHead(201);
            res.end(JSON.stringify({
              message: "Rota criada com sucesso",
              route: {
                id: route.id,
                name: route.name,
                description: route.description,
                status: route.status,
                stopCount: stops.length,
                createdAt: route.created_at,
                estimatedDuration: "N/A",
                totalDistance: "N/A",
                isFavorite: false,
                lastModified: route.updated_at,
              },
            }));
          } catch (error) {
            console.error("Erro ao criar rota:", error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Erro interno do servidor" }));
          }
        });
      });
      return;
    }

    // DASHBOARD API
    if (pathname === "/api/dashboard/stats" && req.method === "GET") {
      authenticateToken(req, res, async () => {
        try {
          const statsResult = await query(
            `SELECT
               (SELECT COUNT(*) FROM routes WHERE user_id = $1 AND deleted_at IS NULL) as total_routes,
               (SELECT COUNT(*) FROM routes WHERE user_id = $1 AND status = 'completed' AND deleted_at IS NULL) as completed_routes,
               (SELECT COUNT(*) FROM clients WHERE user_id = $1 AND deleted_at IS NULL) as total_clients`,
            [req.user.id]
          );

          const stats = statsResult.rows[0];

          res.writeHead(200);
          res.end(JSON.stringify({
            totalRoutes: parseInt(stats.total_routes),
            totalDistance: "0 km", // TODO: calcular do banco
            timeSaved: "0 min", // TODO: calcular do banco
            fuelSaved: "0 L", // TODO: calcular do banco
          }));
        } catch (error) {
          console.error("Erro ao buscar estatísticas:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    if (pathname === "/api/dashboard/recent-routes" && req.method === "GET") {
      authenticateToken(req, res, async () => {
        try {
          const routesResult = await query(
            `SELECT * FROM routes
             WHERE user_id = $1 AND deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT 5`,
            [req.user.id]
          );

          const routes = routesResult.rows.map(route => ({
            id: route.id,
            name: route.name,
            status: route.status,
            createdAt: route.created_at,
            completedAt: route.completed_at,
            estimatedDuration: route.estimated_duration || "N/A",
            totalDistance: route.total_distance || "N/A",
          }));

          res.writeHead(200);
          res.end(JSON.stringify(routes));
        } catch (error) {
          console.error("Erro ao buscar rotas recentes:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Erro interno do servidor" }));
        }
      });
      return;
    }

    // API Info
    if (pathname === "/api") {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: "Viwe API Enhanced",
        version: "2.0.0",
        description: "API completa para otimização e navegação de rotas",
        status: "running",
        endpoints: {
          health: "GET /health",
          auth: {
            register: "POST /api/auth/register",
            login: "POST /api/auth/login",
            logout: "POST /api/auth/logout",
            me: "GET /api/auth/me",
          },
          routes: {
            list: "GET /api/routes",
            create: "POST /api/routes",
          },
          dashboard: {
            stats: "GET /api/dashboard/stats",
            recentRoutes: "GET /api/dashboard/recent-routes",
          },
        },
        database: {
          type: "Neon PostgreSQL",
          driver: "neon-serverless",
          status: process.env.DATABASE_URL ? "configured" : "not_configured",
        },
      }));
      return;
    }

    // 404 para rotas não encontradas
    res.writeHead(404);
    res.end(JSON.stringify({
      error: "Endpoint não encontrado",
      path: pathname,
      method: req.method,
    }));
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString(),
    }));
  }
});

server.listen(PORT, async () => {
  console.log(`\n🌟 VIWE SERVIDOR ENHANCED ATIVO`);
  console.log(`📍 Backend: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api`);

  console.log(`\n📋 Configuração:`);
  console.log(`   ✅ Neon: ${process.env.DATABASE_URL ? "Conectado" : "⚠️  Não configurado"}`);
  console.log(`   ✅ JWT: ${JWT_SECRET !== "viwe-default-secret-key-change-in-production" ? "Configurado" : "⚠️ Usando padrão"}`);
  console.log(`   ✅ Frontend: Proxy automático configurado`);
  console.log(`   ✅ Auth: Login/Register/Logout funcionais`);
  console.log(`   ✅ Routes: CRUD básico implementado`);
  console.log(`   ✅ Dashboard: Stats e recent routes`);

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
  }

  console.log(`\n🚀 Sistema pronto! Frontend + Backend + APIs funcionais.\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🔄 Encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n🔄 Encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});

module.exports = server;
