# ⚡ Viwe Design System - Referência Rápida

## 🎯 **Para Implementações Futuras**

**OBRIGATÓRIO** consultar antes de criar qualquer novo componente, seção ou página.

---

## 📦 **Como Usar**

### **1. Importar Componentes**

```tsx
import {
  PrimaryButton,
  Section,
  Container,
  FeatureCard,
  PageTitle,
} from "../components/ViweUI";
```

### **2. Estrutura Base de Página**

```tsx
const NovaPage = () => (
  <>
    <Section className="pt-24">
      <Container>
        <PageTitle>Título da Página</PageTitle>
      </Container>
    </Section>

    <Section background="gray">
      <Container>{/* Conteúdo */}</Container>
    </Section>
  </>
);
```

---

## 🎨 **Cores Essenciais**

| Uso                   | Classe          | Cor     |
| --------------------- | --------------- | ------- |
| **Primária**          | `bg-blue-600`   | #2563eb |
| **Hover Primária**    | `bg-blue-700`   | #1d4ed8 |
| **Texto Principal**   | `text-gray-900` | #111827 |
| **Texto Secundário**  | `text-gray-600` | #4b5563 |
| **Background Neutro** | `bg-gray-50`    | #f9fafb |
| **Background Escuro** | `bg-gray-900`   | #111827 |

### **Cores por Funcionalidade**

- **Rotas**: `blue` (bg-blue-100 text-blue-600)
- **Trânsito**: `green` (bg-green-100 text-green-600)
- **POI**: `yellow` (bg-yellow-100 text-yellow-600)
- **Compartilhar**: `purple` (bg-purple-100 text-purple-600)

---

## 📝 **Tipografia Rápida**

| Tipo       | Componente       | Classes                               |
| ---------- | ---------------- | ------------------------------------- |
| **Hero**   | `<HeroTitle>`    | `text-4xl md:text-7xl font-extrabold` |
| **Página** | `<PageTitle>`    | `text-4xl md:text-5xl font-extrabold` |
| **Seção**  | `<SectionTitle>` | `text-3xl md:text-4xl font-bold`      |
| **Card**   | `<CardTitle>`    | `text-xl font-semibold`               |
| **Corpo**  | `<BodyLarge>`    | `text-lg md:text-xl text-gray-600`    |

---

## 🧱 **Componentes Essenciais**

### **Botões**

```tsx
<PrimaryButton>Ação Principal</PrimaryButton>
<SecondaryButton>Ação Secundária</SecondaryButton>
<GhostButton>Ação Terciária</GhostButton>
```

### **Cards**

```tsx
<FeatureCard
  icon={MapPin}
  title="Título"
  description="Descrição"
  variant="blue"
/>

<InteractiveCard>
  {/* Conteúdo com efeito 3D */}
</InteractiveCard>
```

### **Layout**

```tsx
<Section background="gray">
  {" "}
  {/* white | gray | dark */}
  <Container>
    <FeaturesGrid columns={4}>
      {" "}
      {/* 2 | 3 | 4 | 6 */}
      {/* Cards */}
    </FeaturesGrid>
  </Container>
</Section>
```

### **Animações**

```tsx
<AnimatedSection>
  {/* Conteúdo que aparece no scroll */}
</AnimatedSection>

<FadeInSection>
  {/* Conteúdo que faz fade in */}
</FadeInSection>
```

---

## 📐 **Espaçamentos Padrão**

| Uso                    | Classes                             |
| ---------------------- | ----------------------------------- |
| **Seções Principais**  | `py-16 md:py-24`                    |
| **Conteúdo de Página** | `py-24 md:py-32`                    |
| **Hero Section**       | `py-32 md:py-48`                    |
| **Container**          | `px-6`                              |
| **Gaps de Grid**       | `gap-8` (cards) `gap-12` (conteúdo) |

---

## 🎬 **Animações Padrão**

### **Transições de Hover**

```tsx
className = "transition-colors duration-200 hover:bg-blue-700";
className = "transition-all duration-300 hover:scale-105";
className = "transform hover:-translate-y-0.5";
```

### **Animações de Entrada**

```tsx
className = "transition-all duration-1000 ease-out opacity-0 translate-y-4";
// Torna-se: opacity-100 translate-y-0
```

---

## 📱 **Responsividade**

### **Breakpoints**

- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+

### **Padrões Comuns**

```tsx
// Texto
text-4xl md:text-7xl

// Grid
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// Espaçamento
py-16 md:py-24

// Flexbox
flex-col sm:flex-row
```

---

## 🚀 **Templates Prontos**

### **Feature Section**

```tsx
<Section background="gray">
  <Container>
    <div className="text-center mb-16">
      <SectionTitle>Título da Seção</SectionTitle>
      <BodyMedium className="mt-4">Subtítulo</BodyMedium>
    </div>
    <FeaturesGrid columns={3}>
      <FeatureCard icon={Icon1} title="..." description="..." />
      <FeatureCard icon={Icon2} title="..." description="..." />
      <FeatureCard icon={Icon3} title="..." description="..." />
    </FeaturesGrid>
  </Container>
</Section>
```

### **Pricing Section**

```tsx
<Section>
  <Container>
    <PageTitle className="mb-16">Preços</PageTitle>
    <ContentGrid columns={3}>
      <PricingCard {...plano1} />
      <PricingCard {...plano2} isHighlighted />
      <PricingCard {...plano3} />
    </ContentGrid>
  </Container>
</Section>
```

### **CTA Section**

```tsx
<CTASection>
  <SectionTitle className="text-white mb-4">Pronto para começar?</SectionTitle>
  <BodyLarge className="text-gray-400 mb-8">
    Junte-se a milhares de usuários
  </BodyLarge>
  <div className="flex justify-center space-x-4">
    <PrimaryButton>Começar</PrimaryButton>
    <GhostButton>Saiba mais</GhostButton>
  </div>
</CTASection>
```

---

## ⚠️ **Regras Críticas**

### **✅ SEMPRE FAZER**

- Usar componentes da `ViweUI.tsx`
- Seguir a paleta de cores exata
- Implementar estados de hover
- Testar em mobile e desktop
- Usar espaçamentos padronizados

### **❌ NUNCA FAZER**

- Criar cores customizadas
- Usar espaçamentos arbitrários
- Ignorar responsividade
- Quebrar hierarquia tipográfica
- Omitir animações de transição

---

## 🔍 **Arquivos de Referência**

1. **`DESIGN_SYSTEM.md`** - Documentação completa
2. **`ViweUI.tsx`** - Biblioteca de componentes
3. **`IMPLEMENTATION_EXAMPLE.md`** - Exemplos práticos
4. **`QUICK_REFERENCE.md`** - Este arquivo

---

## 💡 **Processo de Desenvolvimento**

1. **Consultar** esta referência
2. **Reutilizar** componentes existentes
3. **Adaptar** se necessário
4. **Testar** responsividade
5. **Validar** com design system
6. **Documentar** se for reutilizável

---

**🎯 Objetivo:** Manter 100% de consistência visual em todas as implementações futuras da Viwe.
