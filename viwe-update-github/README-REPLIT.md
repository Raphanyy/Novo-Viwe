# Fusion Starter - Replit Edition

Este projeto foi adaptado para rodar perfeitamente no Replit!

## 🚀 Como Usar no Replit

1. **Fork este Repl** ou importe o código
2. **Clique em "Run"** - o Replit automaticamente:
   - Instalará as dependências com `pnpm`
   - Iniciará o servidor de desenvolvimento
   - Abrirá a aplicação na aba de preview

## 📋 O que foi Adaptado para o Replit

### Arquivos Criados:

- `.replit` - Configuração principal do Replit
- `replit.nix` - Ambiente Nix com Node.js 20 e pnpm
- `main.py` - Arquivo para detecção de projeto
- `README-REPLIT.md` - Este arquivo

### Modificações:

- **vite.config.ts**: Servidor configurado para `0.0.0.0` e porta dinâmica
- **package.json**: Scripts adaptados para Replit

## 🔧 Configuração

O projeto está configurado para:

- ✅ Node.js 20
- ✅ pnpm como gerenciador de pacotes
- ✅ Porta 8080 (configurável via ENV)
- ✅ Hot reload automático
- ✅ TypeScript support
- ✅ Express + React integrados

## 🌐 Acessando a Aplicação

Depois de clicar em "Run", você pode:

- Ver a aplicação na aba "Webview" do Replit
- Abrir em nova aba para visualização completa
- Compartilhar o link público do Replit

## 🛠️ Comandos Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm test` - Executa os testes
- `pnpm typecheck` - Verificação de tipos TypeScript

## 📱 Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js integrado
- **UI**: Radix UI + Lucide React icons
- **Routing**: React Router 6 (SPA)
- **Testing**: Vitest

## 🎯 Pronto para Usar!

Seu projeto está completamente configurado e pronto para desenvolvimento no Replit. Basta clicar em "Run" e começar a programar!
