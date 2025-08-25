const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_kzROdeiQfu72@ep-patient-river-acfkp8do-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
  });

  try {
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão com Neon estabelecida');
    
    // Testar tabelas
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log(`✅ ${tables.rows.length} tabelas encontradas:`, tables.rows.map(r => r.tablename).join(', '));
    
    // Testar planos
    const plans = await client.query("SELECT name, price_cents FROM plans");
    console.log(`✅ ${plans.rows.length} planos configurados:`, plans.rows.map(p => `${p.name} (R$ ${p.price_cents/100})`).join(', '));
    
    client.release();
    console.log('\n🎉 BACKEND PRONTO PARA USO!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
