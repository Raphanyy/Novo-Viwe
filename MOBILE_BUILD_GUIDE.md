# Guia de Build Mobile com Capacitor

## Visão Geral

O Viwe agora está configurado com Capacitor para gerar versões Android e iOS da aplicação.

## Estrutura do Projeto

```
📁 Projeto/
├── android/              # Projeto Android nativo
├── ios/                  # Projeto iOS nativo  
├── dist/spa/             # Build web para mobile
├── capacitor.config.ts   # Configuração do Capacitor
└── src/                  # Código fonte React
```

## Scripts Disponíveis

### Comandos de Build
```bash
# Build apenas para web mobile
pnpm run build:mobile

# Build e sincronizar com plataformas móveis
pnpm run cap:build

# Sincronizar sem rebuild
pnpm run cap:sync
```

### Comandos de Desenvolvimento
```bash
# Abrir projeto Android no Android Studio
pnpm run cap:android

# Abrir projeto iOS no Xcode
pnpm run cap:ios
```

## Pré-requisitos para Build

### Para Android:
1. **Android Studio** instalado
2. **Java Development Kit (JDK) 17+**
3. **Android SDK** configurado
4. Variáveis de ambiente: `ANDROID_HOME`, `JAVA_HOME`

### Para iOS:
1. **Xcode** instalado (macOS apenas)
2. **CocoaPods** instalado: `sudo gem install cocoapods`
3. **iOS Simulator** ou dispositivo físico
4. Conta de desenvolvedor Apple

## Fluxo de Desenvolvimento

### 1. Fazer alterações no código React
```bash
# Desenvolver normalmente
pnpm dev
```

### 2. Build e sync para mobile
```bash
# Build e sincronizar
pnpm run cap:build
```

### 3. Testar em dispositivos
```bash
# Android
pnpm run cap:android

# iOS  
pnpm run cap:ios
```

## Configurações Importantes

### capacitor.config.ts
- **appId**: `com.viwe.app` - Identificador único do app
- **appName**: `Viwe` - Nome exibido no dispositivo
- **webDir**: `dist/spa` - Diretório do build web
- **androidScheme**: `https` - Esquema de URL para Android

### Funcionalidades Configuradas
- ✅ SplashScreen com tema escuro
- ✅ Esquema HTTPS para Android
- ✅ Configurações de immersão
- ✅ Build otimizado para SPA

## Debugging

### Logs do Android
```bash
# Via Android Studio ou
adb logcat | grep -i capacitor
```

### Logs do iOS
```bash
# Via Xcode Console ou Safari Web Inspector
```

### Live Reload (Desenvolvimento)
```bash
# Configurar IP local no capacitor.config.ts
server: {
  url: 'http://YOUR-LOCAL-IP:8080',
  cleartext: true
}
```

## Gerando APK/IPA

### Android APK
1. Abrir `android/` no Android Studio
2. Build → Generate Signed Bundle/APK
3. Escolher APK
4. Configurar keystore
5. Build Release

### iOS IPA
1. Abrir `ios/App.xcworkspace` no Xcode
2. Configurar Team e Bundle ID
3. Product → Archive
4. Distribute App

## Troubleshooting

### Erro "CocoaPods not installed"
```bash
sudo gem install cocoapods
cd ios && pod install
```

### Erro de sincronização
```bash
# Limpar e rebuild
npx cap sync --force
```

### Permissões Android
Adicionar no `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Permissões iOS
Adicionar no `ios/App/App/Info.plist` conforme necessário.

## Deploy na Store

### Google Play Store
1. Gerar APK/AAB assinado
2. Configurar metadados na Play Console
3. Upload e revisão

### Apple App Store
1. Gerar IPA via Xcode
2. Upload via App Store Connect
3. Configurar metadados e revisão

## Comandos Úteis

```bash
# Verificar instalação
npx cap doctor

# Listar plataformas
npx cap ls

# Atualizar Capacitor
pnpm update @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Remover plataforma
npx cap rm android
npx cap rm ios

# Adicionar novamente
npx cap add android
npx cap add ios
```

## Plugins Recomendados

Para funcionalidades avançadas, considere adicionar:
- `@capacitor/camera` - Câmera
- `@capacitor/geolocation` - GPS
- `@capacitor/push-notifications` - Notificações
- `@capacitor/status-bar` - Barra de status
- `@capacitor/keyboard` - Teclado

```bash
pnpm add @capacitor/[plugin-name]
npx cap sync
```

---

## Próximos Passos

1. Configurar ambiente de desenvolvimento Android/iOS
2. Testar em dispositivos físicos
3. Configurar CI/CD para builds automáticos
4. Implementar funcionalidades específicas mobile
5. Preparar para publicação nas stores
