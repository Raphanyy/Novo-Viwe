#!/bin/bash

# Script para rodar backend e frontend em paralelo
echo "🚀 Iniciando servidores de desenvolvimento..."

# Função para cleanup ao sair
cleanup() {
    echo "🔄 Encerrando servidores..."
    kill %1 %2 2>/dev/null
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar backend na porta 3001 (em background)
echo "📡 Iniciando backend na porta 3001..."
cd server/src && node index.js &
BACKEND_PID=$!

# Aguardar um pouco para backend inicializar
sleep 3

# Voltar para raiz e iniciar frontend na porta 8080
echo "🌐 Iniciando frontend na porta 8080..."
cd ../../
vite &
FRONTEND_PID=$!

# Aguardar ambos os processos
echo "✅ Servidores rodando:"
echo "   - Backend:  http://localhost:3001"
echo "   - Frontend: http://localhost:8080"
echo "   - Health:   http://localhost:3001/health"
echo ""
echo "Pressione Ctrl+C para parar os servidores"

# Aguardar qualquer um dos processos terminar
wait
