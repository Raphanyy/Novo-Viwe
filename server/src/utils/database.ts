import { Pool, PoolClient } from 'pg';

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada', { 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration, 
      rows: res.rowCount 
    });
    return res;
  } finally {
    client.release();
  }
};

// Função para obter um client específico (para transações)
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Função para testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
};

export default pool;
