#!/usr/bin/env node

/**
 * SCRIPT DE SETUP DO BANCO DE DADOS
 * Execute após conectar ao Neon: [Connect to Neon](#open-mcp-popover)
 */

require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function success(message) { log(colors.green, '✅', message); }
function error(message) { log(colors.red, '❌', message); }
function warning(message) { log(colors.yellow, '⚠️ ', message); }
function info(message) { log(colors.blue, 'ℹ️ ', message); }

async function main() {
  console.log(`${colors.bold}🚀 SETUP DO BANCO DE DADOS - VIWE${colors.reset}`);
  console.log('========================================\n');

  // Verificar DATABASE_URL
  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL não está definida no .env');
    console.log('\n📝 SOLUÇÕES:');
    console.log('   1. [Connect to Neon](#open-mcp-popover)');
    console.log('   2. Copie a connection string para DATABASE_URL no .env');
    console.log('   3. Execute novamente este script');
    process.exit(1);
  }

  success('DATABASE_URL encontrada');

  // Verificar schema SQL
  const schemaPath = 'Implementação BackEnd/DATABASE_SCHEMA.sql';
  if (!fs.existsSync(schemaPath)) {
    error('Arquivo DATABASE_SCHEMA.sql não encontrado');
    console.log(`   Esperado em: ${schemaPath}`);
    process.exit(1);
  }

  success('Arquivo de schema encontrado');

  try {
    // Conectar ao banco
    info('Conectando ao banco...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    success('Conexão estabelecida');

    // Verificar PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;
    info(`PostgreSQL: ${version.split(' ')[1]}`);

    // Verificar tabelas existentes
    const existingTablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = parseInt(existingTablesResult.rows[0].count);

    if (existingTables > 0) {
      warning(`${existingTables} tabela(s) já existente(s)`);
      warning('Executar schema pode sobrescrever dados existentes');
    }

    // Ler e executar schema
    info('Executando schema SQL...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    success('Schema executado com sucesso!');

    // Verificar resultados
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);

    if (tableCount >= 20) {
      success(`${tableCount} tabelas criadas`);
    } else {
      warning(`Apenas ${tableCount} tabelas criadas (esperado: 20+)`);
    }

    // Verificar índices
    const indexResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    const indexCount = parseInt(indexResult.rows[0].count);
    success(`${indexCount} índices criados`);

    // Verificar triggers
    const triggerResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.triggers
    `);
    const triggerCount = parseInt(triggerResult.rows[0].count);
    success(`${triggerCount} triggers criados`);

    // Verificar dados iniciais
    const plansResult = await client.query('SELECT COUNT(*) as count FROM plans');
    const plansCount = parseInt(plansResult.rows[0].count);
    
    if (plansCount >= 3) {
      success(`${plansCount} planos iniciais carregados`);
    } else {
      warning(`Apenas ${plansCount} planos carregados`);
    }

    const configResult = await client.query('SELECT COUNT(*) as count FROM system_config');
    const configCount = parseInt(configResult.rows[0].count);
    
    if (configCount >= 5) {
      success(`${configCount} configurações iniciais carregadas`);
    } else {
      warning(`Apenas ${configCount} configurações carregadas`);
    }

    // Cleanup
    client.release();
    await pool.end();

    console.log('\n🎉 SETUP CONCLUÍDO COM SUCESSO!');
    console.log('\n📊 RESUMO:');
    console.log(`   - Tabelas: ${tableCount}`);
    console.log(`   - Índices: ${indexCount}`);
    console.log(`   - Triggers: ${triggerCount}`);
    console.log(`   - Planos: ${plansCount}`);
    console.log(`   - Configurações: ${configCount}`);
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('   1. node scripts/generate-jwt-secret.js');
    console.log('   2. Configure .env com suas credenciais');
    console.log('   3. node scripts/verify-setup.js');
    console.log('   4. cd server && npm install && npm run dev');

  } catch (err) {
    error(`Erro: ${err.message}`);
    
    if (err.message.includes('password authentication failed')) {
      warning('Credenciais incorretas - verifique DATABASE_URL');
    } else if (err.message.includes('does not exist')) {
      warning('Banco não existe - verifique o nome do database');
    }
    
    process.exit(1);
  }
}

// Verificar dependências
try {
  require('pg');
} catch (err) {
  error('Dependência "pg" não encontrada');
  console.log('Execute: npm install pg');
  process.exit(1);
}

main().catch(err => {
  error(`Erro fatal: ${err.message}`);
  process.exit(1);
});
