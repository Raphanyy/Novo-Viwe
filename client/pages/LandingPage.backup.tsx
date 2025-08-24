import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  MapPin,
  Route,
  Share2,
  TrafficCone,
  Clock,
  Star,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Award,
  Smartphone,
  Cloud,
  BarChart3,
  ArrowRight,
  Play,
  Heart,
  MessageCircle,
  Sparkles,
  Lightbulb,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

// === Logo Real da Viwe ===
const ViweLogo = ({ className = "h-16 w-16" }: { className?: string }) => (
  <img
    src="https://cdn.builder.io/api/v1/image/assets%2F6c1daba7e59b4ec58eff5c97822a2701%2Fd6f16773cb7b41a3a689efc7c5e77e61?format=webp&width=800"
    alt="Viwe Logo"
    className={`${className} object-contain`}
  />
);

// === Seções Principais ===

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      number: "1M+",
      label: "Rotas Otimizadas",
      icon: Route,
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "50K+",
      label: "Usuários Ativos",
      icon: Users,
      color: "from-blue-600 to-blue-700",
    },
    {
      number: "99.9%",
      label: "Uptime Garantido",
      icon: Shield,
      color: "from-blue-400 to-blue-500",
    },
    {
      number: "30%",
      label: "Economia de Tempo",
      icon: Clock,
      color: "from-blue-700 to-blue-800",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-gradient-to-br from-muted/30 to-primary/5 border-y border-border relative overflow-hidden"
    >
      {/* Efeitos de fundo suavizados */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Números que impressionam
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Milhares de pessoas já confiam no Viwe para otimizar suas jornadas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-700 delay-${index * 100} ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${stat.color} rounded-xl mb-3 md:mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}
              >
                <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ana Silva",
      role: "Executiva de Vendas",
      avatar: "AS",
      text: "Revolucionou minha rotina! Economizo 2 horas por dia nas visitas aos clientes.",
      rating: 5,
      company: "TechCorp",
    },
    {
      name: "Carlos Mendes",
      role: "Motorista de App",
      avatar: "CM",
      text: "Melhor app de rotas que já usei. Previsão de trânsito sempre precisa.",
      rating: 5,
      company: "Uber",
    },
    {
      name: "Mariana Costa",
      role: "Empresária",
      avatar: "MC",
      text: "Nossa frota reduziu 25% no combustível. Rotas otimizadas fazem diferença.",
      rating: 5,
      company: "LogiTrans",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium text-sm">
              Amado pelos usuários
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            O que nossos usuários dizem
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Milhares de pessoas já otimizaram suas jornadas com o Viwe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-card p-6 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-current" />
                ))}
              </div>
              <blockquote
                className="text-card-foreground mb-6 leading-relaxed overflow-hidden"
                style={
                  {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  } as React.CSSProperties
                }
              >
                "{testimonial.text}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.role}
                  </div>
                  <div className="text-primary text-xs font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Defina seu destino",
      description: "Digite onde você quer ir ou selecione no mapa interativo",
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: "02",
      title: "Otimização inteligente",
      description:
        "Nossa IA calcula a melhor rota considerando trânsito e preferências",
      icon: Zap,
      color: "from-blue-600 to-blue-700",
    },
    {
      step: "03",
      title: "Navegue com confiança",
      description:
        "Siga as instruções em tempo real e chegue mais rápido ao destino",
      icon: CheckCircle,
      color: "from-blue-700 to-blue-800",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium text-sm">
              Como funciona
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Três passos simples
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Processo simplificado para otimizar suas jornadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 transform -translate-x-1/2 z-0 rounded-full"></div>
              )}

              <div
                className={`relative z-10 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r ${step.color} rounded-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
              >
                <step.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold">
                  {step.step}
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdvancedFeaturesSection = () => {
  const features = [
    {
      icon: Smartphone,
      title: "App Mobile Nativo",
      description: "Disponível para iOS e Android com sincronização automática",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Cloud,
      title: "Sincronização Automática",
      description:
        "Suas rotas ficam salvas e sincronizadas em todos os dispositivos",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análise detalhada de tempo, distância e economia",
      gradient: "from-blue-700 to-blue-800",
    },
    {
      icon: Award,
      title: "Suporte Premium",
      description: "Atendimento 24/7 com especialistas em otimização",
      gradient: "from-blue-400 to-blue-500",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium text-sm">
              Recursos avançados
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Tecnologia de ponta
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Recursos premium que fazem a diferença na sua experiência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage = ({
  heroRef,
}: {
  heroRef: React.RefObject<HTMLDivElement>;
}) => {
  // Estado para a animação do texto do herói
  const [isHeroTextVisible, setIsHeroTextVisible] = useState(false);
  // Observer para a se����ão de funcionalidades
  const featuresRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);

  // Animação inicial do texto do herói
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeroTextVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Observer para a seção de funcionalidades
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFeaturesVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.2 },
    );
    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }
    return () => {
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);

  // Lógica para o efeito 3D nos cards
  const handleCardMouseMove = (e: React.MouseEvent, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotationX = (y / rect.height - 0.5) * -5;
    const rotationY = (x / rect.width - 0.5) * 5;
    card.style.transform = `scale(1.02) perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = `scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <React.Fragment>
      {/* Secção Hero enquadrada ao máximo */}
      <section className="relative overflow-hidden py-4 md:py-6 lg:py-8 text-center bg-gradient-to-br from-background via-background to-primary/5 min-h-screen flex items-start pt-20">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-60"
          ref={heroRef}
        ></div>

        {/* Efeitos de brilho intensificados */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10 w-full">
          <div
            className={`transition-all duration-1000 ease-out ${isHeroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Logo posicionada 15% mais acima e com tamanho aumentado */}
            <div className="mb-1 md:mb-2 lg:mb-3 flex justify-center -translate-y-6">
              <div className="group relative">
                <ViweLogo className="h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 xl:h-56 xl:w-56 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300" />
                {/* Efeito de brilho suave */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-blue-500/15 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-300"></div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-2 lg:mb-3">
              Somos a maior plataforma
              <br />
              de rotas inteligentes do mundo
            </h1>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-snug mb-3 lg:mb-4">
              Viwe é o planejador de rotas mais avançado do mercado. Otimize
              trajetos com IA, organize conjuntos, economize tempo e muito mais.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-3 lg:mb-4">
            <Link
              to="/login"
              className="group bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Começar gratuitamente
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button className="group flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full border border-white font-semibold hover:bg-black/90 transition-all duration-300">
              <Play className="h-4 w-4" />
              Ver demonstração
            </button>
          </div>

          {/* Badge de confiança ultra-compacto */}
          <div className="flex justify-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 flex items-center gap-2">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 bg-gradient-to-r from-primary to-blue-600 rounded-full border border-background"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border border-background"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full border border-background"></div>
              </div>
              <span className="text-muted-foreground text-xs">
                Mais de <strong className="text-foreground">50K</strong>{" "}
                usuários
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas */}
      <StatsSection />

      {/* Secção de Logos de Confiança simplificada */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-base font-medium text-muted-foreground mb-8">
            Confiança de empresas em todo o mundo
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex justify-center">
                <div className="w-20 h-12 bg-muted/40 rounded-lg flex items-center justify-center opacity-50 hover:opacity-70 transition-opacity">
                  <span className="text-muted-foreground text-xs font-medium">
                    LOGO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secção de Funcionalidades principais com proporções corrigidas */}
      <section
        ref={featuresRef}
        className={`bg-secondary/30 py-16 md:py-20 transition-opacity duration-1000 ${isFeaturesVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-sm">
                Funcionalidades principais
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Recursos para otimizar sua viagem
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Tecnologia avançada que faz a diferença na sua jornada
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              ref={(el) => (cardRefs.current[0] = el)}
              className="bg-card p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl group"
              onMouseMove={(e) => handleCardMouseMove(e, 0)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            >
              <div className="p-3 inline-block bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl text-primary mb-4 group-hover:scale-105 transition-transform duration-300">
                <Route className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                Otimização de Rotas
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                IA encontra rotas eficientes. Economize tempo e combustível.
              </p>
            </div>

            <div
              ref={(el) => (cardRefs.current[1] = el)}
              className="bg-card p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl group"
              onMouseMove={(e) => handleCardMouseMove(e, 1)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 1)}
            >
              <div className="p-3 inline-block bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl text-blue-500 mb-4 group-hover:scale-105 transition-transform duration-300">
                <TrafficCone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-blue-500 transition-colors">
                Previsão de Trânsito
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Dados em tempo real evitam trânsito. Precisão de 99% garantida.
              </p>
            </div>

            <div
              ref={(el) => (cardRefs.current[2] = el)}
              className="bg-card p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:border-blue-600/50 hover:shadow-xl group"
              onMouseMove={(e) => handleCardMouseMove(e, 2)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 2)}
            >
              <div className="p-3 inline-block bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl text-blue-600 mb-4 group-hover:scale-105 transition-transform duration-300">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-blue-600 transition-colors">
                Pontos de Interesse
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Encontre restaurantes, postos e atrações no seu trajeto
                facilmente.
              </p>
            </div>

            <div
              ref={(el) => (cardRefs.current[3] = el)}
              className="bg-card p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:border-blue-700/50 hover:shadow-xl group"
              onMouseMove={(e) => handleCardMouseMove(e, 3)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            >
              <div className="p-3 inline-block bg-gradient-to-br from-blue-700/20 to-blue-700/10 rounded-xl text-blue-700 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-blue-700 transition-colors">
                Compartilhar Itinerário
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Compartilhe rotas em tempo real com família e equipes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <HowItWorksSection />

      {/* Recursos Avançados */}
      <AdvancedFeaturesSection />

      {/* Testemunhos */}
      <TestimonialsSection />
    </React.Fragment>
  );
};

const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Efeito three.js suavizado para o fundo
  useEffect(() => {
    if (!heroRef.current) return;

    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      plane: THREE.Mesh;
    const width = heroRef.current.clientWidth;
    const height = heroRef.current.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    heroRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
    directionalLight.position.set(0, 0, 5);
    scene.add(directionalLight);

    const geometry = new THREE.PlaneGeometry(12, 12, 30, 30);
    const material = new THREE.MeshLambertMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.x += 0.0003;
      plane.rotation.y += 0.0005;
      plane.rotation.z += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!heroRef.current) return;
      const newWidth = heroRef.current.clientWidth;
      const newHeight = heroRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (
        heroRef.current &&
        renderer.domElement &&
        heroRef.current.contains(renderer.domElement)
      ) {
        heroRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Conteúdo Principal */}
      <HomePage heroRef={heroRef} />

    </div>
  );
};

export default LandingPage;
