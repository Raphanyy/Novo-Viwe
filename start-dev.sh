#!/bin/bash

echo "🌟 VIWE - Setup Automático"
echo "=========================="

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Verificar .env
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado, criando template..."
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=sua_connection_string_aqui" > .env
fi

# Iniciar desenvolvimento
echo "🚀 Iniciando desenvolvimento..."
echo "   Frontend: http://localhost:8081"
echo "   Backend:  http://localhost:3002"
echo "   Health:   http://localhost:3002/health"
echo ""

pnpm dev
