# Plugins Capacitor Configurados

Este documento lista todos os plugins Capacitor que foram configurados no projeto e suas funcionalidades.

## Plugins Instalados

### 1. @capacitor/geolocation (v7.1.5)

- **Funcionalidade**: Acesso nativo à localização GPS do dispositivo
- **Uso no projeto**: Utilizado no MapPage.tsx para obter localização do usuário
- **Permissões configuradas**:
  - Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
  - iOS: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`

### 2. @capacitor/push-notifications (v7.0.2)

- **Funcionalidade**: Notificações push nativas
- **Uso no projeto**: UI configurada em NotificationSettingsPage.tsx
- **Permissões configuradas**:
  - Android: `WAKE_LOCK`, `com.google.android.c2dm.permission.RECEIVE`
  - iOS: `aps-environment` (development)

### 3. @capacitor/status-bar (v7.0.2)

- **Funcionalidade**: Controle da barra de status
- **Uso no projeto**: Para personalizar aparência da status bar no tema escuro
- **Configuração**: Automática via Capacitor

### 4. @capacitor/preferences (v7.0.2)

- **Funcionalidade**: Armazenamento nativo persistente
- **Uso no projeto**: Substituição recomendada para localStorage em AuthContext.tsx e TraceRouteContext.tsx
- **Vantagens**: Armazenamento mais seguro e consistente entre plataformas

### 5. @capacitor/share (v7.0.2)

- **Funcionalidade**: Compartilhamento nativo
- **Uso no projeto**: Botões de compartilhar em várias páginas (HomePage, AboutPage, etc.)
- **Configuração**: Automática via Capacitor

### 6. @capacitor/network (v7.0.2)

- **Funcionalidade**: Monitoramento de conexão de rede
- **Uso no projeto**: Detecção de status de conectividade para melhor UX
- **Permissões configuradas**:
  - Android: `ACCESS_NETWORK_STATE`

## Como usar os plugins

### Geolocation

```typescript
import { Geolocation } from "@capacitor/geolocation";

const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  console.log("Current position:", coordinates);
};
```

### Push Notifications

```typescript
import { PushNotifications } from "@capacitor/push-notifications";

const addListeners = async () => {
  await PushNotifications.addListener("registration", (token) => {
    console.info("Registration token: ", token.value);
  });
};
```

### Status Bar

```typescript
import { StatusBar, Style } from "@capacitor/status-bar";

const setStatusBarStyleDark = async () => {
  await StatusBar.setStyle({ style: Style.Dark });
};
```

### Preferences (Storage)

```typescript
import { Preferences } from "@capacitor/preferences";

const setName = async () => {
  await Preferences.set({
    key: "name",
    value: "Max",
  });
};

const getName = async () => {
  const { value } = await Preferences.get({ key: "name" });
  console.log(`Hello ${value}!`);
};
```

### Share

```typescript
import { Share } from "@capacitor/share";

const share = async () => {
  await Share.share({
    title: "See cool stuff",
    text: "Really awesome thing you need to see right meow",
    url: "http://ionicframework.com/",
    dialogTitle: "Share with buddies",
  });
};
```

### Network

```typescript
import { Network } from "@capacitor/network";

const logCurrentNetworkStatus = async () => {
  const status = await Network.getStatus();
  console.log("Network status:", status);
};
```

## Próximos passos

1. **Implementar uso dos plugins**: Substituir uso de navigator.geolocation por @capacitor/geolocation
2. **Configurar push notifications**: Configurar FCM (Android) e APNs (iOS)
3. **Testar no dispositivo**: Os plugins precisam ser testados em dispositivos reais
4. **Migrar localStorage**: Substituir localStorage por @capacitor/preferences onde apropriado

## Comandos úteis

```bash
# Sincronizar plugins
npx cap sync

# Verificar status
npx cap doctor

# Abrir projeto nativo para desenvolvimento
npx cap open android
npx cap open ios

# Build e sync
pnpm run cap:build
```
