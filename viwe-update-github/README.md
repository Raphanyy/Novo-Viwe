# Viwe - Aplicativo Mobile com Capacitor

Uma aplicação full-stack React com suporte nativo para Android e iOS usando Capacitor.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js integrado
- **Mobile**: Capacitor (Android + iOS)
- **UI**: Radix UI + TailwindCSS 3 + Lucide React
- **Deploy**: Netlify

## 📱 Versões Disponíveis

- **Web**: [fusion-starter-2024.netlify.app](http://fusion-starter-2024.netlify.app)
- **Android**: APK gerado via Android Studio
- **iOS**: IPA gerado via Xcode

## 🛠��� Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PNPM (recomendado)
- Android Studio (para Android)
- Xcode (para iOS - macOS apenas)
- Java Development Kit (JDK) 17+

### Instalação

```bash
# Clonar repositório
git clone [seu-repositorio]
cd viwe

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 📱 Build Mobile

### Web Build
```bash
# Build para web
pnpm build

# Build específico para mobile
pnpm run build:mobile
```

### Android
```bash
# Build e abrir no Android Studio
pnpm run cap:android

# Apenas sincronizar
pnpm run cap:sync
```

### iOS
```bash
# Build e abrir no Xcode
pnpm run cap:ios
```

## 🏗️ Estrutura do Projeto

```
📁 viwe/
├── 📁 client/           # Frontend React
│   ├── 📁 components/   # Componentes UI
│   ├── 📁 pages/        # Páginas/Rotas
│   ├── 📁 contexts/     # Context API
│   └── 📁 hooks/        # Custom Hooks
├── 📁 server/           # Backend Express
├── 📁 shared/           # Tipos compartilhados
├── 📁 android/          # Projeto Android nativo
├── 📁 ios/              # Projeto iOS nativo
├── 📁 public/           # Assets públicos
└── capacitor.config.ts  # Configuração Capacitor
```

## 🎨 Design System

O projeto utiliza um design system completo baseado em:
- **TailwindCSS 3** com tema escuro absoluto
- **Radix UI** para componentes acessíveis
- **Lucide React** para ícones
- **Layout responsivo** para mobile, tablet e desktop

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Servidor de desenvolvimento
pnpm test             # Executar testes

# Build
pnpm build            # Build completo (client + server)
pnpm build:mobile     # Build para mobile

# Capacitor
pnpm cap:build        # Build + sync mobile
pnpm cap:android      # Abrir Android Studio
pnpm cap:ios          # Abrir Xcode
pnpm cap:sync         # Sincronizar plataformas

# Produção
pnpm start            # Servidor de produção
```

## 🌐 Deploy

### Web (Netlify)
O deploy na web é automático via Netlify:
- URL: http://fusion-starter-2024.netlify.app
- Deploy contínuo configurado

### Mobile Stores

#### Android (Google Play)
1. Abrir `android/` no Android Studio
2. Build → Generate Signed Bundle/APK
3. Configurar keystore de produção
4. Upload na Play Console

#### iOS (App Store)
1. Abrir `ios/App.xcworkspace` no Xcode
2. Configurar Team e Bundle ID
3. Product → Archive
4. Upload via App Store Connect

## 🔑 Configurações

### Capacitor
- **App ID**: `com.viwe.app`
- **App Name**: `Viwe`
- **Tema**: Escuro com splash screen personalizado
- **Scheme**: HTTPS para Android

### Environment Variables
Configure via Netlify UI ou `.env`:
```bash
# Exemplo de variáveis de ambiente
VITE_API_URL=your_api_url
VITE_APP_NAME=Viwe
```

## 📖 Documentação

- [Guia Mobile Completo](./MOBILE_BUILD_GUIDE.md) - Build Android/iOS
- [Arquitetura](./AGENTS.md) - Detalhes técnicos
- [Capacitor Docs](https://capacitorjs.com/docs)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Documentação: [Guias do projeto](./MOBILE_BUILD_GUIDE.md)
- Issues: Abra uma issue no GitHub
- Discussões: Use as Discussions do repositório

---

**Desenvolvido com ❤️ usando React + Capacitor**
