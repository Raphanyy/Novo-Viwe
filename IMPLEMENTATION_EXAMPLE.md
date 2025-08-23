# 📋 Exemplo de Implementação - Viwe Design System

## Como implementar novas funcionalidades usando os componentes padronizados

Este arquivo demonstra como usar corretamente os componentes da `ViweUI.tsx` para manter a consistência visual.

---

## 🎯 **Exemplo: Nova Página "Planos"**

### **Estrutura Completa**

```tsx
import React from "react";
import {
  PageTitle,
  BodyLarge,
  Section,
  Container,
  ContentGrid,
  PricingCard,
  AnimatedSection,
} from "../components/ViweUI";

const PlanosPage: React.FC = () => {
  return (
    <>
      {/* Hero da página */}
      <Section className="pt-24">
        <Container>
          <AnimatedSection className="text-center">
            <PageTitle className="mb-8">
              Escolha o Plano Ideal para Você
            </PageTitle>
            <BodyLarge className="max-w-2xl mx-auto mb-16">
              Opções flexíveis para cada tipo de viajante, desde aventureiros
              individuais até grandes empresas.
            </BodyLarge>
          </AnimatedSection>
        </Container>
      </Section>

      {/* Cards de preços */}
      <Section background="gray">
        <Container>
          <ContentGrid columns={3}>
            <PricingCard
              title="Plano Básico"
              subtitle="Para viajantes individuais"
              price="Grátis"
              features={[
                "10 rotas por mês",
                "Pontos de interesse básicos",
                "Suporte por email",
              ]}
              buttonText="Começar grátis"
              onButtonClick={() => console.log("Plano básico selecionado")}
            />

            <PricingCard
              title="Plano Pro"
              subtitle="Para viajantes frequentes"
              price="29,90"
              features={[
                "Rotas ilimitadas",
                "Todos os pontos de interesse",
                "Suporte prioritário",
                "Mapas offline",
              ]}
              buttonText="Assinar agora"
              isHighlighted={true}
              onButtonClick={() => console.log("Plano pro selecionado")}
            />

            <PricingCard
              title="Plano Empresarial"
              subtitle="Para frotas e empresas"
              price="199,90"
              features={[
                "Todos os recursos Pro",
                "Múltiplos usuários",
                "Análise de desempenho",
                "API personalizada",
              ]}
              buttonText="Entrar em contato"
              onButtonClick={() => console.log("Contato empresarial")}
            />
          </ContentGrid>
        </Container>
      </Section>
    </>
  );
};

export default PlanosPage;
```

---

## 🧩 **Exemplo: Novo Componente "Testemunhos"**

### **Implementação Seguindo Padrões**

```tsx
import React from "react";
import {
  Section,
  Container,
  SectionTitle,
  BodyMedium,
  FeaturesGrid,
  AnimatedSection,
} from "../components/ViweUI";
import { Star, User } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  rating,
  avatar,
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-xl">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>

    <BodyMedium className="mb-6 italic">"{content}"</BodyMedium>

    <div className="flex items-center">
      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <User className="h-6 w-6 text-gray-500" />
        )}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  </div>
);

const TestemunhosSection: React.FC = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Viajante Frequente",
      content:
        "O Viwe transformou completamente como eu planejo minhas viagens. Economizo horas de planejamento!",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "Gerente de Logística",
      content:
        "Nossa empresa reduziu 30% dos custos de combustível usando as rotas otimizadas do Viwe.",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Blogueira de Viagem",
      content:
        "Indispensável para descobrir lugares incríveis pelo caminho. Recomendo para todos os aventureiros!",
      rating: 4,
    },
  ];

  return (
    <Section background="gray">
      <Container>
        <AnimatedSection className="text-center mb-16">
          <SectionTitle>O que nossos usuários dizem</SectionTitle>
          <BodyMedium className="mt-4">
            Milhares de viajantes já transformaram suas jornadas com o Viwe
          </BodyMedium>
        </AnimatedSection>

        <FeaturesGrid columns={3}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </FeaturesGrid>
      </Container>
    </Section>
  );
};

export default TestemunhosSection;
```

---

## 📊 **Exemplo: Seção de Estatísticas**

### **Usando Componentes Base**

```tsx
import React from "react";
import {
  Section,
  Container,
  SectionTitle,
  BodyMedium,
  FeaturesGrid,
  AnimatedSection,
} from "../components/ViweUI";
import { MapPin, Users, Route, Clock } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  number,
  label,
  description,
}) => (
  <div className="text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <div className="text-4xl font-extrabold text-gray-900 mb-2">{number}</div>
    <div className="text-lg font-semibold text-gray-700 mb-2">{label}</div>
    <BodyMedium className="text-sm">{description}</BodyMedium>
  </div>
);

const EstatisticasSection: React.FC = () => {
  const stats = [
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      number: "2M+",
      label: "Usuários Ativos",
      description: "Viajantes confiam no Viwe diariamente",
    },
    {
      icon: <Route className="h-12 w-12 text-green-600" />,
      number: "50M+",
      label: "Rotas Otimizadas",
      description: "Trajetos calculados com precisão",
    },
    {
      icon: <MapPin className="h-12 w-12 text-yellow-600" />,
      number: "100K+",
      label: "Pontos de Interesse",
      description: "Locais descobertos pelos usuários",
    },
    {
      icon: <Clock className="h-12 w-12 text-purple-600" />,
      number: "30%",
      label: "Economia de Tempo",
      description: "Redução média no tempo de viagem",
    },
  ];

  return (
    <Section>
      <Container>
        <AnimatedSection className="text-center mb-16">
          <SectionTitle>Números que Impressionam</SectionTitle>
          <BodyMedium className="mt-4">
            Resultados comprovados de uma plataforma que funciona
          </BodyMedium>
        </AnimatedSection>

        <FeaturesGrid columns={4}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </FeaturesGrid>
      </Container>
    </Section>
  );
};

export default EstatisticasSection;
```

---

## 🎨 **Exemplo: Card de Funcionalidade Avançada**

### **Com Hover Effects e Animações**

```tsx
import React from "react";
import {
  FeatureCard,
  InteractiveCard,
  FeatureIcon,
  CardTitle,
  BodySmall,
  PrimaryButton,
} from "../components/ViweUI";
import { Zap, ArrowRight } from "lucide-react";

const AdvancedFeatureCard: React.FC = () => (
  <InteractiveCard className="relative overflow-hidden">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>

    <div className="relative z-10">
      <FeatureIcon icon={Zap} variant="purple" size="lg" />

      <CardTitle className="mt-6 mb-4">IA para Rotas Inteligentes</CardTitle>

      <BodySmall className="mb-6">
        Nossa inteligência artificial aprende seus padrões de viagem e sugere as
        melhores rotas automaticamente.
      </BodySmall>

      <div className="space-y-3 mb-8">
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
          Aprendizado personalizado
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
          Previsão de tráfego avançada
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
          Sugestões contextuais
        </div>
      </div>

      <PrimaryButton
        className="w-full flex items-center justify-center"
        onClick={() => console.log("Saiba mais sobre IA")}
      >
        Saiba mais
        <ArrowRight className="ml-2 h-4 w-4" />
      </PrimaryButton>
    </div>
  </InteractiveCard>
);

export default AdvancedFeatureCard;
```

---

## 🚀 **Exemplo: Hero Customizado**

### **Para Páginas Específicas**

```tsx
import React from "react";
import {
  HeroSection,
  HeroTitle,
  BodyLarge,
  PrimaryButton,
  SecondaryButton,
  AnimatedSection,
} from "../components/ViweUI";

const CustomHero: React.FC = () => (
  <HeroSection>
    <AnimatedSection>
      <HeroTitle className="mb-8">
        Transforme suas <br />
        <span className="text-blue-600">viagens em experiências</span>
      </HeroTitle>

      <BodyLarge className="max-w-3xl mx-auto mb-12">
        Descubra como milhões de viajantes estão economizando tempo, dinheiro e
        criando memórias inesquecíveis com o planejador de rotas mais avançado
        do mundo.
      </BodyLarge>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <PrimaryButton onClick={() => console.log("Começar grátis")}>
          Começar gratuitamente
        </PrimaryButton>

        <SecondaryButton onClick={() => console.log("Ver demo")}>
          Ver demonstração
        </SecondaryButton>
      </div>

      <div className="mt-12 text-sm text-gray-500">
        ✨ Sem cartão de crédito • ⚡ Configuração em 2 minutos • 🌟 Suporte
        24/7
      </div>
    </AnimatedSection>
  </HeroSection>
);

export default CustomHero;
```

---

## ✅ **Checklist de Implementação**

Ao criar novos componentes, sempre verificar:

### **🎨 Design**

- [ ] Cores seguem a paleta definida
- [ ] Tipografia usa as classes padronizadas
- [ ] Espaçamentos consistentes (py-16 md:py-24, etc.)
- [ ] Bordas arredondadas (rounded-2xl, rounded-full)

### **🔄 Interatividade**

- [ ] Estados de hover implementados
- [ ] Transições suaves (duration-200, duration-300)
- [ ] Feedback visual em botões
- [ ] Cards com efeitos 3D quando apropriado

### **📱 Responsividade**

- [ ] Mobile-first approach
- [ ] Breakpoints corretos (md:, lg:)
- [ ] Texto escalável (text-4xl md:text-7xl)
- [ ] Grids responsivos

### **🎬 Animações**

- [ ] Animações de entrada (scroll-triggered)
- [ ] Performance otimizada
- [ ] Fallbacks para reduced motion

### **♿ Acessibilidade**

- [ ] Contraste adequado
- [ ] Focus states visíveis
- [ ] ARIA labels quando necessário
- [ ] Navegação por teclado

---

**💡 Lembre-se:** A consistência é fundamental. Sempre reutilizar componentes existentes antes de criar novos, e quando criar novos, seguir exatamente os padrões estabelecidos.
