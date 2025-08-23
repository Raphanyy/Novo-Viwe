# 🎨 Viwe Design System

## Padronização Oficial para Implementações Futuras

Este documento define todos os padrões visuais, de UX e de código da aplicação Viwe. **OBRIGATÓRIO** seguir estes padrões para manter consistência em:

- ✅ Novos componentes
- ✅ Novas seções
- ✅ Novas páginas
- ✅ Futuras funcionalidades

---

## 🎯 **Filosofia de Design**

**Moderno • Limpo • Eficiente • Confiável**

- Interface minimalista com foco na funcionalidade
- Animações suaves que melhoram a UX
- Design responsivo mobile-first
- Hierarquia visual clara
- Paleta de cores profissional

---

## 🎨 **Sistema de Cores**

### **Cores Principais**

```css
/* Primary Blue */
--blue-primary: #2563eb; /* bg-blue-600 */
--blue-hover: #1d4ed8; /* bg-blue-700 */
--blue-light: #dbeafe; /* bg-blue-100 */
--blue-accent: #60a5fa; /* text-blue-400 */

/* Grays */
--gray-900: #111827; /* Títulos principais */
--gray-800: #1f2937; /* Texto escuro */
--gray-700: #374151; /* Texto médio */
--gray-600: #4b5563; /* Texto secundário */
--gray-400: #9ca3af; /* Texto disabled */
--gray-100: #f3f4f6; /* Bordas sutis */
--gray-50: #f9fafb; /* Backgrounds secundários */

/* Background */
--white: #ffffff; /* Background principal */
--dark: #111827; /* Footer/seções escuras */
```

### **Cores de Destaque por Funcionalidade**

```css
--green-accent: #16a34a; /* Funcionalidades de trânsito */
--green-light: #dcfce7; /* bg-green-100 */

--yellow-accent: #ca8a04; /* Pontos de interesse */
--yellow-light: #fef3c7; /* bg-yellow-100 */

--purple-accent: #9333ea; /* Compartilhamento */
--purple-light: #f3e8ff; /* bg-purple-100 */

--red-accent: #dc2626; /* Estados de erro */
--indigo-accent: #4f46e5; /* Funcionalidades extras */
```

---

## 📝 **Tipografia**

### **Fonte Principal**

```css
font-family: "Inter", sans-serif;
```

### **Hierarquia de Textos**

```css
/* Hero Titles */
.hero-title {
  @apply text-4xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-[-0.05em];
}

/* Page Titles */
.page-title {
  @apply text-4xl md:text-5xl font-extrabold text-gray-900 text-center;
}

/* Section Titles */
.section-title {
  @apply text-3xl md:text-4xl font-bold text-gray-900;
}

/* Card Titles */
.card-title {
  @apply text-xl font-semibold;
}

/* Subsection Titles */
.subsection-title {
  @apply text-2xl font-semibold;
}

/* Body Text */
.body-large {
  @apply text-lg md:text-xl text-gray-600 tracking-[-0.01em];
}

.body-medium {
  @apply text-lg text-gray-600;
}

.body-small {
  @apply text-sm text-gray-600;
}

/* Footer Text */
.footer-title {
  @apply font-semibold text-white;
}

.footer-text {
  @apply text-sm text-gray-400;
}
```

---

## 🧱 **Componentes Padrão**

### **Botões**

#### **Botão Primário**

```tsx
<button className="bg-blue-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg transform hover:-translate-y-0.5">
  Texto do Botão
</button>
```

#### **Botão Secundário**

```tsx
<button className="text-gray-900 px-7 py-3 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition-colors duration-200">
  Texto do Botão
</button>
```

#### **Botão Ghost (Footer/Seções escuras)**

```tsx
<button className="border border-gray-400 text-gray-400 px-7 py-3 rounded-full font-semibold hover:bg-gray-800 hover:text-white transition-colors duration-200">
  Texto do Botão
</button>
```

### **Cards Interativos**

```tsx
const cardRefs = useRef([]);

const handleCardMouseMove = (e, index) => {
  const card = cardRefs.current[index];
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotationX = (y / rect.height - 0.5) * -10;
  const rotationY = (x / rect.width - 0.5) * 10;
  card.style.transform = `scale(1.05) perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
};

const handleCardMouseLeave = (e, index) => {
  const card = cardRefs.current[index];
  if (!card) return;
  card.style.transform = `scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
};

<div
  ref={(el) => (cardRefs.current[index] = el)}
  className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300"
  onMouseMove={(e) => handleCardMouseMove(e, index)}
  onMouseLeave={(e) => handleCardMouseLeave(e, index)}
>
  {/* Conteúdo do card */}
</div>;
```

### **Ícones de Funcionalidades**

```tsx
<div className="p-4 inline-block bg-blue-100 rounded-xl text-blue-600">
  <IconComponent className="h-8 w-8" />
</div>
```

**Cores por categoria:**

- `bg-blue-100 text-blue-600` - Rotas/Navegação
- `bg-green-100 text-green-600` - Trânsito/Tempo real
- `bg-yellow-100 text-yellow-600` - Pontos de interesse
- `bg-purple-100 text-purple-600` - Compartilhamento
- `bg-red-100 text-red-600` - Alertas/Problemas
- `bg-indigo-100 text-indigo-600` - Funcionalidades avançadas

---

## ��� **Layout e Espaçamento**

### **Container Padrão**

```tsx
<div className="container mx-auto px-6">{/* Conteúdo */}</div>
```

### **Espaçamento entre Seções**

```css
/* Seções principais */
.section-spacing {
  @apply py-16 md:py-24;
}

/* Espaçamento interno de seções */
.content-spacing {
  @apply py-24 md:py-32;
}
```

### **Grids Responsivos**

```css
/* Cards de funcionalidades */
.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}

/* Grid de conteúdo geral */
.content-grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-12;
}

.content-grid-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12;
}

/* Grid do footer */
.footer-grid {
  @apply grid grid-cols-1 md:grid-cols-5 gap-8;
}
```

---

## 🎬 **Animações e Transições**

### **Animações de Entrada**

```tsx
// Hook para animações on scroll
const [isVisible, setIsVisible] = useState(false);
const elementRef = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    },
    { root: null, rootMargin: '0px', threshold: 0.2 }
  );

  if (elementRef.current) {
    observer.observe(elementRef.current);
  }

  return () => {
    if (elementRef.current) observer.unobserve(elementRef.current);
  };
}, []);

// Classes de animação
<div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
```

### **Transições de Hover**

```css
/* Botões */
.button-transition {
  @apply transition-colors duration-200;
}

.button-transform {
  @apply transform hover:-translate-y-0.5;
}

/* Links */
.link-transition {
  @apply hover:text-gray-900 transition-colors duration-200;
}

/* Cards e elementos interativos */
.card-transition {
  @apply transition-all duration-300;
}
```

---

## 🧩 **Estrutura de Seções**

### **Hero Section**

```tsx
<section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-white to-gray-50">
  <div className="absolute inset-0 z-0 pointer-events-none" ref={heroRef}></div>
  <div className="container mx-auto px-6 relative z-10">
    <div
      className={`transition-all duration-1000 ease-out ${isHeroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <h1 className="text-4xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-[-0.05em]">
        Título Principal
      </h1>
      <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto tracking-[-0.01em]">
        Descrição do hero
      </p>
    </div>
    <div className="mt-12 flex justify-center space-x-4">
      {/* Botões de CTA */}
    </div>
  </div>
</section>
```

### **Features Section**

```tsx
<section className="bg-gray-50 py-16 md:py-24 transition-opacity duration-1000">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        Título da Seção
      </h2>
      <p className="mt-2 text-lg text-gray-600">Subtítulo explicativo</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Cards de funcionalidades */}
    </div>
  </div>
</section>
```

### **CTA Section**

```tsx
<section className="bg-gray-900 py-20 text-white text-center">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
      Título de Call-to-Action
    </h2>
    <p className="mt-4 text-lg max-w-xl mx-auto text-gray-400">
      Descrição motivacional
    </p>
    <div className="mt-8 flex justify-center space-x-4">
      {/* Botões de ação */}
    </div>
  </div>
</section>
```

---

## 🧭 **Navegação**

### **Navbar Fixa**

```tsx
<nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 transition-all duration-300">
  <div className="container mx-auto px-6 flex justify-between items-center">
    {/* Logo */}
    <div className="flex items-center">
      <Rocket className="h-8 w-8 text-blue-600" />
      <span className="font-bold text-xl ml-2 text-gray-900 cursor-pointer">
        Viwe
      </span>
    </div>

    {/* Menu Desktop */}
    <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
      {/* Links de navegação */}
    </div>

    {/* Ações */}
    <div className="flex items-center space-x-4">
      {/* Botões e menu mobile */}
    </div>
  </div>
</nav>
```

### **Footer Padrão**

```tsx
<footer className="bg-gray-900 text-gray-400 py-16">
  <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
    {/* Branding */}
    <div>
      <div className="flex items-center">
        <Compass className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-lg ml-2 text-white">Viwe</span>
      </div>
      <p className="mt-4 text-sm max-w-xs">Descrição breve da marca</p>
    </div>

    {/* Links organizados em colunas */}
    {/* ... */}
  </div>
</footer>
```

---

## 📱 **Responsividade**

### **Breakpoints**

```css
/* Mobile First */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### **Padrões Responsivos**

```css
/* Títulos */
text-4xl md:text-7xl    /* Hero */
text-4xl md:text-5xl    /* Page titles */
text-3xl md:text-4xl    /* Section titles */

/* Espaçamento */
py-16 md:py-24          /* Seções */
py-24 md:py-32          /* Conteúdo de página */
py-32 md:py-48          /* Hero */

/* Grids */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4    /* Features */
grid-cols-1 md:grid-cols-3                   /* Conteúdo geral */
grid-cols-2 sm:grid-cols-3 md:grid-cols-6    /* Logos/Parceiros */
```

---

## ✨ **Efeitos Especiais**

### **Cursor Dot (Opcional)**

```tsx
const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
const [isDotVisible, setIsDotVisible] = useState(false);

useEffect(() => {
  const handleMouseMove = (e) => {
    setDotPosition({ x: e.clientX, y: e.clientY });
    if (!isDotVisible) setIsDotVisible(true);
  };

  const handleMouseLeave = () => setIsDotVisible(false);

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseleave", handleMouseLeave);
  };
}, [isDotVisible]);

{
  isDotVisible && (
    <div
      className="fixed w-3 h-3 rounded-full bg-blue-500 pointer-events-none transition-transform duration-75 ease-out z-[9999]"
      style={{
        transform: `translate(${dotPosition.x}px, ${dotPosition.y}px)`,
        opacity: 0.8,
      }}
    />
  );
}
```

### **Three.js Background (Hero)**

```tsx
// Implementação completa no App.tsx atual
// Usar apenas em hero sections especiais
```

---

## 📝 **Conteúdo e Tom**

### **Idioma**

- **Português brasileiro** para todo conteúdo
- Tom profissional mas acessível
- Verbos no imperativo para CTAs ("Começar", "Descobrir", "Planejar")

### **Estrutura de Textos**

```
Título: Ação + Benefício
Subtítulo: Explicação clara do valor
CTA: Verbo de ação + resultado esperado
```

**Exemplos:**

- ✅ "Otimize seus trajetos"
- ✅ "Descubra novos lugares"
- ✅ "Planeje sua jornada"

---

## 🚀 **Como Implementar Novos Componentes**

### **Checklist Obrigatório**

1. **Cores**: Usar apenas paleta definida
2. **Tipografia**: Seguir hierarquia estabelecida
3. **Espaçamento**: Usar classes padrão (py-16 md:py-24, etc.)
4. **Animações**: Implementar transições suaves
5. **Responsividade**: Mobile-first sempre
6. **Interatividade**: Hover states e feedback visual
7. **Acessibilidade**: ARIA labels quando necessário
8. **Consistência**: Reutilizar padrões existentes

### **Processo de Criação**

1. **Analisar**: Qual funcionalidade similar já existe?
2. **Adaptar**: Usar como base e modificar conforme necessário
3. **Testar**: Em todos os breakpoints
4. **Documentar**: Adicionar ao design system se for reutilizável

---

## ⚠️ **Regras Importantes**

### **OBRIGATÓRIO**

- ✅ Seguir exatamente os padrões de cores
- ✅ Manter a fonte Inter em todos os textos
- ✅ Usar espaçamentos padronizados
- ✅ Implementar estados de hover/focus
- ✅ Garantir responsividade total

### **PROIBIDO**

- ❌ Criar novas cores sem documentar
- ❌ Usar espaçamentos customizados
- ❌ Quebrar a hierarquia tipográfica
- ❌ Ignorar estados interativos
- ❌ Implementar sem testar em mobile

---

**Este documento é OBRIGATÓRIO para manter a consistência e qualidade da aplicação Viwe. Sempre consultar antes de implementar novos recursos.**
