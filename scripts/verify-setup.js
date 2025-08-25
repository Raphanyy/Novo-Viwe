#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICAÇÃO DE SETUP
 * Verifica se todas as configurações estão corretas
 * Usage: node scripts/verify-setup.js [database|jwt|mapbox|all]
 */

require("dotenv").config();
const https = require("https");

const args = process.argv.slice(2);
const testType = args[0] || "all";

// Cores para terminal
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, "✅", message);
}
function error(message) {
  log(colors.red, "❌", message);
}
function warning(message) {
  log(colors.yellow, "⚠️ ", message);
}
function info(message) {
  log(colors.blue, "ℹ️ ", message);
}

async function testDatabase() {
  console.log("\n🗃️  TESTANDO CONEXÃO COM BANCO DE DADOS...\n");

  if (!process.env.DATABASE_URL) {
    error("DATABASE_URL não está definida no .env");
    return false;
  }

  try {
    // Verificar se pg está instalado
    const { Pool } = require("pg");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    // Testar conexão
    const client = await pool.connect();
    success("Conexão com banco estabelecida");

    // Testar versão do PostgreSQL
    const versionResult = await client.query("SELECT version()");
    const version = versionResult.rows[0].version;
    info(`PostgreSQL: ${version.split(" ")[1]}`);

    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);

    if (tableCount >= 20) {
      success(`${tableCount} tabelas encontradas (esperado: 20+)`);
    } else {
      warning(`Apenas ${tableCount} tabelas encontradas (esperado: 20+)`);
      info("Execute: node scripts/setup-database.js");
    }

    // Verificar dados iniciais
    try {
      const plansResult = await client.query(
        "SELECT COUNT(*) as count FROM plans",
      );
      const plansCount = parseInt(plansResult.rows[0].count);

      if (plansCount >= 3) {
        success(`${plansCount} planos iniciais encontrados`);
      } else {
        warning(`Apenas ${plansCount} planos encontrados (esperado: 3)`);
      }
    } catch (err) {
      warning('Tabela "plans" não encontrada - execute setup do banco');
    }

    client.release();
    await pool.end();

    return true;
  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND" && err.message.includes("pg")) {
      error('Dependência "pg" não encontrada');
      info("Execute: npm install pg");
    } else {
      error(`Erro na conexão: ${err.message}`);
      if (err.message.includes("password authentication failed")) {
        warning("Verifique suas credenciais no .env");
      } else if (err.message.includes("does not exist")) {
        warning("Banco de dados não existe ou nome incorreto");
      }
    }
    return false;
  }
}

async function testJWT() {
  console.log("\n🔐 TESTANDO JWT...\n");

  if (!process.env.JWT_SECRET) {
    error("JWT_SECRET não está definida no .env");
    info("Execute: node scripts/generate-jwt-secret.js");
    return false;
  }

  const secret = process.env.JWT_SECRET;

  // Verificar tamanho do secret
  if (secret.length < 32) {
    warning("JWT_SECRET parece muito curto (recomendado: 64+ caracteres)");
  } else {
    success(`JWT_SECRET tem ${secret.length} caracteres`);
  }

  try {
    // Verificar se jsonwebtoken está instalado
    const jwt = require("jsonwebtoken");

    // Testar geração de token
    const testPayload = {
      sub: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    };

    const token = jwt.sign(testPayload, secret, { expiresIn: "15m" });
    success("Token JWT gerado com sucesso");

    // Testar verificação
    const decoded = jwt.verify(token, secret);
    if (decoded.sub === testPayload.sub) {
      success("Token JWT verificado com sucesso");
    } else {
      error("Falha na verificação do token JWT");
      return false;
    }

    return true;
  } catch (err) {
    if (
      err.code === "MODULE_NOT_FOUND" &&
      err.message.includes("jsonwebtoken")
    ) {
      error('Dependência "jsonwebtoken" não encontrada');
      info("Execute: npm install jsonwebtoken");
    } else {
      error(`Erro no JWT: ${err.message}`);
    }
    return false;
  }
}

async function testMapbox() {
  console.log("\n🗺️  TESTANDO MAPBOX...\n");

  const publicToken = process.env.VITE_MAPBOX_ACCESS_TOKEN;
  const secretToken = process.env.MAPBOX_ACCESS_TOKEN;

  if (!publicToken) {
    error("VITE_MAPBOX_ACCESS_TOKEN não está definida");
    warning(
      "Token público atual: pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA",
    );
    return false;
  }

  success("Token público Mapbox encontrado");
  info(`Token: ${publicToken.substring(0, 20)}...`);

  if (secretToken) {
    success("Token secreto Mapbox encontrado");
    info(`Secret: ${secretToken.substring(0, 20)}...`);
  } else {
    warning("MAPBOX_ACCESS_TOKEN (secreto) não definido");
    info("Use o mesmo token ou configure um token secreto");
  }

  // Testar API do Mapbox
  return new Promise((resolve) => {
    const testUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/sao%20paulo.json?access_token=${publicToken}&limit=1`;

    https
      .get(testUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode === 200 && parsed.features) {
              success("API Mapbox funcionando");
              info(
                `Teste: São Paulo → ${parsed.features[0]?.place_name || "Resultado encontrado"}`,
              );
              resolve(true);
            } else {
              error(`API Mapbox erro: ${parsed.message || "Desconhecido"}`);
              resolve(false);
            }
          } catch (err) {
            error(`Erro ao parsear resposta Mapbox: ${err.message}`);
            resolve(false);
          }
        });
      })
      .on("error", (err) => {
        error(`Erro na requisição Mapbox: ${err.message}`);
        resolve(false);
      });
  });
}

async function testEnvironment() {
  console.log("\n⚙️  TESTANDO ENVIRONMENT...\n");

  const required = ["DATABASE_URL", "JWT_SECRET"];
  const optional = [
    "MAPBOX_ACCESS_TOKEN",
    "STRIPE_SECRET_KEY",
    "GOOGLE_CLIENT_ID",
    "SMTP_HOST",
  ];

  let allRequired = true;

  // Verificar obrigatórias
  for (const env of required) {
    if (process.env[env]) {
      success(`${env} configurada`);
    } else {
      error(`${env} não configurada (OBRIGATÓRIA)`);
      allRequired = false;
    }
  }

  // Verificar opcionais
  for (const env of optional) {
    if (process.env[env]) {
      success(`${env} configurada`);
    } else {
      warning(`${env} não configurada (opcional)`);
    }
  }

  return allRequired;
}

async function main() {
  console.log(
    `${colors.bold}🔍 VERIFICAÇÃO DE SETUP - VIWE BACKEND${colors.reset}`,
  );
  console.log("========================================");

  let allPassed = true;

  if (testType === "all" || testType === "env") {
    allPassed = (await testEnvironment()) && allPassed;
  }

  if (testType === "all" || testType === "database") {
    allPassed = (await testDatabase()) && allPassed;
  }

  if (testType === "all" || testType === "jwt") {
    allPassed = (await testJWT()) && allPassed;
  }

  if (testType === "all" || testType === "mapbox") {
    allPassed = (await testMapbox()) && allPassed;
  }

  console.log("\n========================================");

  if (allPassed) {
    success("TODOS OS TESTES PASSARAM! 🎉");
    console.log("\n🚀 PRÓXIMOS PASSOS:");
    console.log("   1. cd server/");
    console.log("   2. npm install");
    console.log("   3. npm run dev");
    console.log("   4. Testar: curl http://localhost:3001/health");
  } else {
    error("ALGUNS TESTES FALHARAM ❌");
    console.log("\n🔧 SOLUÇÕES:");
    console.log("   - Verifique o arquivo .env");
    console.log("   - Execute: node scripts/setup-database.js");
    console.log("   - Execute: node scripts/generate-jwt-secret.js");
    console.log("   - Instale: npm install pg jsonwebtoken");
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  error(`Erro fatal: ${err.message}`);
  process.exit(1);
});
