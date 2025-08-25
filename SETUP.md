# 🚀 Setup Viwe - Guia Rápido

## ⚡ Inicialização com 1 Comando

```bash
# Linux/Mac
./start-dev.sh

# Windows/Universal
pnpm start
```

## 📊 Verificar se Funcionou

**URLs Principais:**
- 🌍 App: http://localhost:8081
- ⚙️ API: http://localhost:3002/api
- 🔍 Health: http://localhost:3002/health

**Testes Rápidos:**
```bash
# Ping básico
curl http://localhost:8081/api/ping

# Status completo
curl http://localhost:3002/api/status

# Teste Neon (se configurado)
curl http://localhost:3002/api/test-neon
```

## 🗄️ Configurar Neon (Opcional)

1. **Obter connection string do Neon**
2. **Adicionar no `.env`:**
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname
```
3. **Reiniciar:** `pnpm dev`

## ✅ Checklist de Funcionamento

- [ ] `pnpm start` executa sem erros
- [ ] Frontend carrega em http://localhost:8081
- [ ] Backend responde em http://localhost:3002
- [ ] API retorna dados em `/api/ping`
- [ ] Health check mostra "OK" em `/health`
- [ ] (Opcional) Neon conectado e com 19 tabelas

## 🛠️ Comandos Úteis

```bash
pnpm start    # Setup + inicialização
pnpm dev      # Só desenvolvimento  
pnpm build    # Build de produção
pnpm test     # Executar testes
```

## 🎯 Estrutura Final

```
viwe/
├── client/           # React frontend
├── server/
│   ├── app.js        # Servidor principal
│   └── src/utils/    # Utilitários Neon
├── .env             # Configurações
├── package.json     # Scripts simplificados
├── start-dev.sh     # Setup automático
└── README.md        # Documentação
```

---

**🏁 Resultado:** Sistema full-stack funcionando com setup automático!
