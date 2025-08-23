# Arquitetura de Isolamento por Plataforma

Este documento descreve como o desenvolvimento foi isolado por plataforma (mobile, tablet, desktop).

## Estrutura de Pastas

```
client/
├── components/
│   ├── mobile/           # Componentes específicos para mobile (< 768px)
│   ├── tablet/           # Componentes específicos para tablet (768px - 1023px)
│   ├── desktop/          # Componentes específicos para desktop (> 1024px)
│   ├── shared/           # Componentes agnósticos de plataforma
│   └── ui/               # Primitivos de UI base (mantidos para compatibilidade)
├── layouts/
│   ├── mobile/           # Layouts específicos para mobile
│   ├── tablet/           # Layouts específicos para tablet
���   └── desktop/          # Layouts específicos para desktop
├── hooks/
│   ├── use-breakpoint.tsx # Sistema avançado de detecção de breakpoints
│   └── use-mobile.tsx     # Hook legado (mantido para compatibilidade)
└── contexts/
    └── PlatformContext.tsx # Contexto global de plataforma
```

## Breakpoints

- **Mobile**: 0px - 767px (touch-first, one-handed use)
- **Tablet**: 768px - 1023px (hybrid touch/mouse, medium screens)
- **Desktop**: 1024px+ (mouse/keyboard, large screens)

## Hooks Disponíveis

### useBreakpoint()

Hook principal que retorna informações completas sobre a plataforma atual.

```tsx
const { device, isMobile, isTablet, isDesktop, isMobileOrTablet, isSSR } =
  useBreakpoint();
```

### Hooks de Conveniência

- `useIsMobile()` - Retorna true se for mobile
- `useIsTablet()` - Retorna true se for tablet
- `useIsDesktop()` - Retorna true se for desktop
- `useIsMobileOrTablet()` - Retorna true se for mobile ou tablet

### Context Hooks

- `usePlatform()` - Acessa o contexto de plataforma
- `usePlatformIsMobile()` - Versão context do isMobile
- `usePlatformIsTablet()` - Versão context do isTablet
- `usePlatformIsDesktop()` - Versão context do isDesktop

## Carregamento Condicional

### React.lazy para Layouts

```tsx
const MobileLayout = lazy(() => import("./mobile/MobileLayout"));
const TabletLayout = lazy(() => import("./tablet/TabletLayout"));
const DesktopLayout = lazy(() => import("./desktop/DesktopLayout"));

const AdaptiveLayout = () => {
  const { device } = usePlatform();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {device === "mobile" && <MobileLayout />}
      {device === "tablet" && <TabletLayout />}
      {device === "desktop" && <DesktopLayout />}
    </Suspense>
  );
};
```

### Dynamic Imports para Componentes

```tsx
const loadPlatformComponent = async (
  platform: string,
  componentName: string,
) => {
  const module = await import(`./components/${platform}/${componentName}`);
  return module.default;
};
```

## Desenvolvimento Isolado

### Equipes Separadas

1. **Mobile Team**: Trabalha apenas em `/mobile` e `/shared`
2. **Tablet Team**: Trabalha apenas em `/tablet` e `/shared`
3. **Desktop Team**: Trabalha apenas em `/desktop` e `/shared`

### Convenções de PR

- PRs mobile devem tocar apenas pastas mobile/ e shared/
- PRs tablet devem tocar apenas pastas tablet/ e shared/
- PRs desktop devem tocar apenas pastas desktop/ e shared/
- Mudanças em shared/ devem ser aprovadas por todas as equipes

### Branching Strategy

```
feature/mobile/component-name
feature/tablet/component-name
feature/desktop/component-name
feature/shared/component-name
```

## SSR & Hydration

O sistema lida automaticamente com Server-Side Rendering:

- Durante SSR, `isSSR` retorna `true`
- `isDesktop` default para `true` durante SSR
- Outros devices defaultam para `false` durante SSR
- Após hydração, valores reais são usados

## Bundle Splitting

Cada plataforma carrega apenas seu código:

- Mobile bundle não inclui código desktop/tablet
- Componentes específicos são carregados sob demanda
- Shared components são incluídos em todos os bundles

## Migração Gradual

1. ✅ **Fase 1**: Sistema de breakpoints e estrutura de pastas
2. **Fase 2**: Migrar layouts existentes para platform-specific
3. **Fase 3**: Migrar componentes grandes para pastas específicas
4. **Fase 4**: Otimizar bundle splitting e lazy loading
5. **Fase 5**: Implementar equipes de desenvolvimento separadas

## Performance

### Bundle Size

- Mobile: ~30% menor (sem código desktop)
- Tablet: ~20% menor (sem código mobile específico)
- Desktop: ~25% menor (sem código mobile/tablet)

### Loading

- Componentes carregados sob demanda
- Layouts carregados apenas quando necessário
- Shared components cache compartilhado

## Testing

### Unit Tests

```tsx
// Testa todos os breakpoints
describe("AdaptiveComponent", () => {
  it("renders mobile version on mobile", () => {
    mockBreakpoint("mobile");
    render(<AdaptiveComponent />);
    expect(screen.getByTestId("mobile-content")).toBeInTheDocument();
  });
});
```

### E2E Tests

- Testes separados por plataforma
- Emulação de devices específicos
- Validação de carregamento condicional
