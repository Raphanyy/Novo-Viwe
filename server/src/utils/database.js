const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de 20 conexões
  idleTimeoutMillis: 30000, // 30 segundos
  connectionTimeoutMillis: 10000, // 10 segundos
});

// Event listeners para debugging
pool.on('connect', (client) => {
  console.log('📊 Nova conexão com banco estabelecida');
});

pool.on('error', (err, client) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

/**
 * Executa uma query no banco de dados
 * @param {string} text - SQL query
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Query executada:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: res.rowCount
      });
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Erro na query:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém um cliente do pool para transações
 * @returns {Promise<Object>} Cliente PostgreSQL
 */
const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Erro ao obter cliente do pool:', error);
    throw error;
  }
};

/**
 * Executa uma transação
 * @param {Function} callback - Função que executa as queries
 * @returns {Promise<any>} Resultado da transação
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Testa a conexão com o banco
 * @returns {Promise<boolean>} True se conectou com sucesso
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as timestamp, version()');
    console.log('✅ Conexão com banco testada com sucesso');
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
    console.log(`   Timestamp: ${result.rows[0].timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error.message);
    return false;
  }
};

/**
 * Verifica se as tabelas necessárias existem
 * @returns {Promise<Object>} Status das tabelas
 */
const checkTables = async () => {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    const expectedTables = [
      'users', 'user_preferences', 'auth_sessions',
      'routes', 'route_stops', 'route_sets',
      'navigation_sessions', 'route_metrics', 'user_stats',
      'clients', 'client_stops',
      'notifications', 'plans', 'subscriptions', 'payment_history',
      'search_results', 'pois', 'system_config', 'audit_logs'
    ];
    
    const missing = expectedTables.filter(table => !tables.includes(table));
    
    return {
      total: tables.length,
      expected: expectedTables.length,
      missing,
      tables,
      isComplete: missing.length === 0
    };
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return { error: error.message };
  }
};

/**
 * Executa health check completo do banco
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
    const performanceTest = await query('SELECT COUNT(*) FROM information_schema.tables');
    const duration = Date.now() - start;
    
    return {
      status: 'healthy',
      duration: `${duration}ms`,
      connection: 'ok',
      tables: tableStatus,
      performance: duration < 1000 ? 'good' : 'slow'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      duration: `${Date.now() - start}ms`
    };
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔄 Encerrando pool de conexões...');
  await pool.end();
  console.log('✅ Pool de conexões encerrado');
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = {
  query,
  getClient,
  transaction,
  testConnection,
  checkTables,
  healthCheck,
  pool
};
