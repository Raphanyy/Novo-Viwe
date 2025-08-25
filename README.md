# 🌟 Viwe - Sistema Simplificado

Um projeto full-stack otimizado com React + Node.js + Neon PostgreSQL.

## 🚀 Setup Automático

```bash
# 1. Instalar e iniciar (tudo automático)
pnpm start

# OU manual:
pnpm install
pnpm dev
```

**Pronto!** O sistema configura tudo automaticamente:

- ✅ Frontend: http://localhost:8081
- ✅ Backend: http://localhost:3002
- ✅ Database: Neon PostgreSQL
- ✅ Auto-conecta frontend + backend

## 📊 Verificar Status

```bash
# Health check completo
curl http://localhost:3002/health

# Status do sistema
curl http://localhost:3002/api/status

# Teste Neon
curl http://localhost:3002/api/test-neon
```

## 🗄️ Configurar Neon (Opcional)

Se quiser conectar seu próprio Neon:

1. **Copie sua connection string do Neon**
2. **Configure no `.env`:**

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname
```

3. **Reinicie:** `pnpm dev`

## 📁 Estrutura Simplificada

```
viwe/
├── client/           # Frontend React
├── server/
│   ├── app.js        # Servidor principal
│   └── src/utils/    # Utilitários Neon
├── package.json      # Scripts simplificados
└── .env             # Configurações
```

## 🛠️ Comandos Disponíveis

```bash
pnpm start    # Setup + Dev (automático)
pnpm dev      # Desenvolvimento
pnpm build    # Build de produção
pnpm test     # Testes
pnpm format   # Formatação de código
```

## 🎯 Endpoints da API

- `GET /health` - Status completo
- `GET /api` - Informações da API
- `GET /api/ping` - Teste básico
- `GET /api/status` - Status do sistema
- `GET /api/test-neon` - Teste Neon

## ✨ Características

- **Setup de 1 comando** - `pnpm start`
- **Auto-conecta** frontend + backend
- **Neon PostgreSQL** integrado
- **Hot reload** completo
- **CORS configurado**
- **Health checks** automáticos

---

**🚀 Para começar:** `pnpm start`

**📱 Acessar:** http://localhost:8081
