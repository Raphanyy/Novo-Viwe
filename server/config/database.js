import { neon, Pool } from "@neondatabase/serverless";

// Função para queries simples (recomendada para a maioria dos casos)
export const sql = neon(process.env.DATABASE_URL);

// Pool para transações complexas e compatibilidade com bibliotecas
export const createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

// Função para executar transações
export const withTransaction = async (queries) => {
  return sql.transaction(queries);
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log("✅ Neon database connected:", result[0].current_time);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};
