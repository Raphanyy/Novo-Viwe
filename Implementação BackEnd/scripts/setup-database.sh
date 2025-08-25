#!/bin/bash

# ========================================
# SCRIPT DE SETUP DO BANCO DE DADOS
# ========================================
# Execute após conectar ao Neon: [Connect to Neon](#open-mcp-popover)

set -e  # Parar em caso de erro

echo "🚀 Iniciando setup do banco de dados..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL não está definida"
    echo "   Configure no arquivo .env primeiro"
    exit 1
fi

echo "✅ DATABASE_URL encontrada"

# Testar conexão
echo "🔍 Testando conexão com o banco..."
if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexão com banco estabelecida"
else
    echo "❌ ERRO: Não foi possível conectar ao banco"
    echo "   Verifique suas credenciais no .env"
    exit 1
fi

# Verificar se arquivo de schema existe
if [ ! -f "DATABASE_SCHEMA.sql" ]; then
    echo "❌ ERRO: Arquivo DATABASE_SCHEMA.sql não encontrado"
    echo "   Certifique-se de estar na pasta 'Implementação BackEnd'"
    exit 1
fi

echo "✅ Arquivo de schema encontrado"

# Fazer backup se existirem tabelas
echo "🔍 Verificando se existem tabelas..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "⚠️  Encontradas $TABLE_COUNT tabela(s) existente(s)"
    read -p "   Deseja continuar? Isso pode sobrescrever dados. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelado pelo usuário"
        exit 1
    fi
    
    echo "💾 Criando backup das tabelas existentes..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    echo "✅ Backup salvo em: $BACKUP_FILE"
fi

# Executar schema
echo "🔨 Executando schema do banco..."
if psql "$DATABASE_URL" -f DATABASE_SCHEMA.sql; then
    echo "✅ Schema executado com sucesso"
else
    echo "❌ ERRO: Falha ao executar schema"
    exit 1
fi

# Verificar tabelas criadas
echo "🔍 Verificando tabelas criadas..."
CREATED_TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$CREATED_TABLES" -ge 20 ]; then
    echo "✅ $CREATED_TABLES tabelas criadas com sucesso"
else
    echo "⚠️  Apenas $CREATED_TABLES tabelas encontradas (esperado: 20+)"
fi

# Verificar índices
echo "🔍 Verificando índices..."
INDEX_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" 2>/dev/null || echo "0")
echo "✅ $INDEX_COUNT índices criados"

# Verificar triggers
echo "🔍 Verificando triggers..."
TRIGGER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.triggers;" 2>/dev/null || echo "0")
echo "✅ $TRIGGER_COUNT triggers criados"

# Verificar dados iniciais
echo "🔍 Verificando dados iniciais..."
PLANS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM plans;" 2>/dev/null || echo "0")
if [ "$PLANS_COUNT" -ge 3 ]; then
    echo "✅ $PLANS_COUNT planos iniciais carregados"
else
    echo "⚠️  Apenas $PLANS_COUNT planos encontrados (esperado: 3)"
fi

CONFIG_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM system_config;" 2>/dev/null || echo "0")
if [ "$CONFIG_COUNT" -ge 5 ]; then
    echo "✅ $CONFIG_COUNT configurações iniciais carregadas"
else
    echo "⚠️  Apenas $CONFIG_COUNT configurações encontradas (esperado: 5+)"
fi

# Resumo final
echo ""
echo "🎉 SETUP CONCLUÍDO COM SUCESSO!"
echo ""
echo "📊 RESUMO:"
echo "   - Tabelas: $CREATED_TABLES"
echo "   - Índices: $INDEX_COUNT"
echo "   - Triggers: $TRIGGER_COUNT"
echo "   - Planos: $PLANS_COUNT"
echo "   - Configurações: $CONFIG_COUNT"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "   1. Configure suas environment variables (.env)"
echo "   2. Execute: node scripts/verify-setup.js"
echo "   3. Inicie o desenvolvimento do servidor"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "   - Ver: STEP_BY_STEP.md"
echo "   - Ver: DATABASE_ANALYSIS.md"
echo ""
