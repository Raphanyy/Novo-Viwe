const { neon, Pool } = require("@neondatabase/serverless");

// Configuração para ambientes serverless
let sql;
let pool;

/**
 * Inicializa a conexão com Neon usando o driver serverless
 */
const initializeNeon = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está configurada. Configure sua connection string do Neon.");
  }

  // Função SQL para queries simples (usa fetch, mais rápida)
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }

  // Pool para transações e queries complexas
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Event listeners para debugging
    pool.on("connect", () => {
      console.log("📊 Nova conexão Neon estabelecida");
    });

    pool.on("error", (err) => {
      console.error("❌ Erro inesperado no pool Neon:", err);
    });
  }

  return { sql, pool };
};

/**
 * Executa uma query simples usando a função neon (mais rápida)
 * @param {string} query - Template string da query
 * @param {...any} params - Parâmetros da query
 * @returns {Promise<Array>} Resultado da query
 */
const query = async (queryText, params = []) => {
  const start = Date.now();
  
  try {
    const { sql } = initializeNeon();
    
    // Se não há parâmetros, use o template literal
    if (params.length === 0) {
      const result = await sql([queryText]);
      logQuery(queryText, Date.now() - start, result.length);
      return { rows: result };
    }
    
    // Para queries com parâmetros, use o pool
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      logQuery(queryText, Date.now() - start, result.rowCount);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Erro na query Neon:", {
      query: queryText.substring(0, 100) + (queryText.length > 100 ? "..." : ""),
      duration: `${Date.now() - start}ms`,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Executa múltiplas queries em uma transação
 * @param {Array} queries - Array de queries para executar
 * @returns {Promise<Array>} Resultados das queries
 */
const transaction = async (queries) => {
  const { sql } = initializeNeon();
  
  try {
    const results = await sql.transaction(queries.map(q => 
      Array.isArray(q) ? sql(q[0], ...q.slice(1)) : sql([q])
    ));
    
    console.log("✅ Transação Neon executada com sucesso");
    return results;
  } catch (error) {
    console.error("❌ Erro na transação Neon:", error.message);
    throw error;
  }
};

/**
 * Obtém um cliente do pool para operações complexas
 * @returns {Promise<Object>} Cliente PostgreSQL
 */
const getClient = async () => {
  const { pool } = initializeNeon();
  return await pool.connect();
};

/**
 * Executa uma transação manual com controle total
 * @param {Function} callback - Função que executa as queries
 * @returns {Promise<any>} Resultado da transação
 */
const manualTransaction = async (callback) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Testa a conexão com Neon
 * @returns {Promise<boolean>} True se conectou com sucesso
 */
const testConnection = async () => {
  try {
    const { sql } = initializeNeon();
    const [result] = await sql`SELECT NOW() as timestamp, version()`;
    
    console.log("✅ Conexão Neon testada com sucesso");
    console.log(`   PostgreSQL: ${result.version.split(" ")[1]}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    return true;
  } catch (error) {
    console.error("❌ Falha no teste de conexão Neon:", error.message);
    return false;
  }
};

/**
 * Verifica se as tabelas necessárias existem
 * @returns {Promise<Object>} Status das tabelas
 */
const checkTables = async () => {
  try {
    const { sql } = initializeNeon();
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    const tableNames = tables.map(row => row.table_name);
    const expectedTables = [
      "users",
      "user_preferences", 
      "auth_sessions",
      "routes",
      "route_stops",
      "route_sets",
      "navigation_sessions",
      "route_metrics",
      "user_stats",
      "clients",
      "client_stops",
      "notifications",
      "plans",
      "subscriptions",
      "payment_history",
      "search_results",
      "pois",
      "system_config",
      "audit_logs",
    ];

    const missing = expectedTables.filter(table => !tableNames.includes(table));

    return {
      total: tableNames.length,
      expected: expectedTables.length,
      missing,
      tables: tableNames,
      isComplete: missing.length === 0,
    };
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas:", error.message);
    return { error: error.message };
  }
};

/**
 * Executa health check completo do Neon
 * @returns {Promise<Object>} Status de saúde do banco
 */
const healthCheck = async () => {
  const start = Date.now();

  try {
    // Testar conexão básica
    await testConnection();

    // Verificar tabelas
    const tableStatus = await checkTables();

    // Testar performance
    const { sql } = initializeNeon();
    await sql`SELECT COUNT(*) FROM information_schema.tables`;
    const duration = Date.now() - start;

    return {
      status: "healthy",
      duration: `${duration}ms`,
      connection: "ok",
      tables: tableStatus,
      performance: duration < 1000 ? "good" : "slow",
      driver: "neon-serverless",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      duration: `${Date.now() - start}ms`,
      driver: "neon-serverless",
    };
  }
};

/**
 * Log de queries para desenvolvimento
 */
const logQuery = (queryText, duration, rowCount) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Query Neon executada:", {
      text: queryText.substring(0, 100) + (queryText.length > 100 ? "..." : ""),
      duration: `${duration}ms`,
      rows: rowCount,
    });
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  console.log("🔄 Encerrando conexões Neon...");
  if (pool) {
    await pool.end();
    console.log("✅ Pool Neon encerrado");
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = {
  query,
  transaction,
  manualTransaction,
  getClient,
  testConnection,
  checkTables,
  healthCheck,
  sql: () => initializeNeon().sql,
  pool: () => initializeNeon().pool,
};
