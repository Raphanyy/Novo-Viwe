import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  MapPin,
  Route,
  Share2,
  Compass,
  Menu,
  X,
  Rocket,
  TrafficCone,
  Globe,
  Users,
  DollarSign,
  List,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: "1M+", label: "Rotas Otimizadas", icon: Route, color: "from-blue-500 to-cyan-500" },
    { number: "50K+", label: "Usuários Ativos", icon: Users, color: "from-green-500 to-emerald-500" },
    { number: "99.9%", label: "Uptime Garantido", icon: Shield, color: "from-purple-500 to-pink-500" },
    { number: "30%", label: "Economia de Tempo", icon: Clock, color: "from-orange-500 to-red-500" },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-background via-primary/5 to-purple-500/10 border-y border-border relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Números que impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já confiam no Viwe para otimizar suas jornadas diárias
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group text-center transition-all duration-1000 delay-${index * 200} ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium text-lg">{stat.label}</div>
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
      text: "O Viwe revolucionou minha rotina de trabalho. Economizo 2 horas por dia nas minhas visitas aos clientes! A precisão das rotas é impressionante.",
      rating: 5,
      company: "TechCorp",
    },
    {
      name: "Carlos Mendes", 
      role: "Motorista de App",
      avatar: "CM",
      text: "Melhor aplicativo de rotas que já usei. A previsão de trânsito é incrivelmente precisa e me ajuda a evitar engarrafamentos diariamente.",
      rating: 5,
      company: "Uber",
    },
    {
      name: "Mariana Costa",
      role: "Empresária",
      avatar: "MC",
      text: "Nossa frota reduziu 25% no consumo de combustível usando as rotas otimizadas do Viwe. O ROI foi imediato!",
      rating: 5,
      company: "LogiTrans",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary to-background relative overflow-hidden">
      {/* Efeitos decorativos */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Amado pelos usuários</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já otimizaram suas jornadas com o Viwe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-3xl border border-border shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-primary/30 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Gradiente sutil no fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-card-foreground mb-8 leading-relaxed text-lg">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground text-lg">{testimonial.name}</div>
                    <div className="text-muted-foreground">{testimonial.role}</div>
                    <div className="text-primary text-sm font-medium">{testimonial.company}</div>
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
      description: "Digite onde você quer ir ou selecione no mapa interativo com tecnologia de ponta",
      icon: Target,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "02", 
      title: "Otimização inteligente",
      description: "Nossa IA avançada calcula a melhor rota considerando trânsito, clima e suas preferências",
      icon: Zap,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "03",
      title: "Navegue com confiança",
      description: "Siga as instruções em tempo real e chegue mais rápido com economia garantida",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500"
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Grid de fundo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Como funciona</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Três passos para o sucesso
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Process simplificado para otimizar suas jornadas de forma inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary/20 transform -translate-x-1/2 z-0 rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              <div className={`relative z-10 inline-flex items-center justify-center w-36 h-36 bg-gradient-to-r ${step.color} rounded-3xl mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <step.icon className="h-16 w-16 text-white" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold shadow-lg">
                  {step.step}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg max-w-sm mx-auto">
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
      description: "Aplicativo nativo para iOS e Android com sincronização automática em nuvem e interface premium",
      gradient: "from-blue-500 to-cyan-500",
      details: ["Interface intuitiva", "Offline first", "Push notifications"]
    },
    {
      icon: Cloud,
      title: "Sincronização Automática",
      description: "Suas rotas ficam salvas e sincronizadas em tempo real em todos os seus dispositivos",
      gradient: "from-purple-500 to-pink-500",
      details: ["Backup automático", "Multi-dispositivo", "Acesso anywhere"]
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análise detalhada com métricas de tempo, distância, economia e impacto ambiental",
      gradient: "from-green-500 to-emerald-500",
      details: ["Dashboards interativos", "Exportação PDF", "Insights de IA"]
    },
    {
      icon: Award,
      title: "Suporte Premium",
      description: "Atendimento 24/7 com especialistas certificados em otimização de rotas e logística",
      gradient: "from-orange-500 to-red-500",
      details: ["Chat ao vivo", "Consultoria gratuita", "SLA garantido"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary via-background to-secondary relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Recursos avançados</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tecnologia de ponta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recursos premium que fazem a diferença na sua experiência de navegação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-10 rounded-3xl border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Gradiente de fundo no hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
  // Observer para a seção de funcionalidades
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
    const rotationX = (y / rect.height - 0.5) * -10;
    const rotationY = (x / rect.width - 0.5) * 10;
    card.style.transform = `scale(1.05) perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = `scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <React.Fragment>
      {/* Secção Hero Premium com Logo Real */}
      <section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-background via-background to-primary/10">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          ref={heroRef}
        ></div>
        
        {/* Efeitos de brilho premium */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-60"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-300"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`transition-all duration-1000 ease-out ${isHeroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Logo real grande acima do título */}
            <div className="mb-12 flex justify-center">
              <div className="group relative">
                <ViweLogo className="h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                {/* Efeito de brilho ao redor da logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-2xl animate-pulse opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[1.05] tracking-[-0.05em] mb-6">
              Sua jornada, <br /> 
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                planejada de forma inteligente.
              </span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto tracking-[-0.01em] leading-relaxed">
              Viwe é o planejador de rotas mais avançado do mercado. Otimize seus
              trajetos com IA, descubra novos lugares e chegue ao seu destino com
              máxima eficiência e tranquilidade.
            </p>
          </div>
          <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/login"
              className="group bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 transition-all duration-300 shadow-2xl transform hover:-translate-y-2 hover:shadow-primary/25"
            >
              <span className="flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6" />
                Começar gratuitamente
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            <button className="group flex items-center justify-center gap-3 text-foreground px-10 py-5 rounded-full border-2 border-border font-bold text-lg hover:bg-secondary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Ver demonstração
            </button>
          </div>
          
          {/* Badge de confiança */}
          <div className="mt-12 flex justify-center">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold">A</div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold">M</div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold">C</div>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full border-2 border-background flex items-center justify-center text-primary text-xs font-bold">+</div>
              </div>
              <span className="text-muted-foreground font-medium">Mais de <strong className="text-foreground">50.000</strong> usuários confiam no Viwe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas Premium */}
      <StatsSection />

      {/* Secção de Logos de Confiança */}
      <section className="py-20 bg-gradient-to-r from-background to-secondary">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-xl font-semibold text-muted-foreground mb-16">
            Confiança de empresas líderes em todo o mundo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-12 items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex justify-center group">
                <div className="w-28 h-16 bg-gradient-to-r from-muted-foreground/10 to-muted-foreground/5 rounded-xl flex items-center justify-center opacity-60 hover:opacity-90 transition-all duration-300 group-hover:scale-110 border border-border">
                  <span className="text-muted-foreground text-sm font-bold">EMPRESA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secção de Funcionalidades principais com melhorias */}
      <section
        ref={featuresRef}
        className={`bg-gradient-to-br from-secondary to-background py-24 transition-opacity duration-1000 ${isFeaturesVisible ? "opacity-100" : "opacity-0"} relative overflow-hidden`}
      >
        {/* Efeitos de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">Funcionalidades principais</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recursos para otimizar sua viagem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avançada que faz a diferença na sua jornada diária
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div
              ref={(el) => (cardRefs.current[0] = el)}
              className="bg-card p-10 rounded-3xl border border-border shadow-xl transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
              onMouseMove={(e) => handleCardMouseMove(e, 0)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="p-5 inline-block bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Route className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-primary transition-colors">
                  Otimização de Rotas
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Algoritmos de IA calculam o caminho mais eficiente, economizando até 30% do seu tempo e combustível.
                </p>
              </div>
            </div>
            
            <div
              ref={(el) => (cardRefs.current[1] = el)}
              className="bg-card p-10 rounded-3xl border border-border shadow-xl transition-all duration-500 hover:border-green-500/50 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
              onMouseMove={(e) => handleCardMouseMove(e, 1)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 1)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="p-5 inline-block bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl text-green-500 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <TrafficCone className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-green-500 transition-colors">
                  Previsão de Trânsito
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dados em tempo real de milhões de sensores para evitar engarrafamentos com precisão de 99%.
                </p>
              </div>
            </div>
            
            <div
              ref={(el) => (cardRefs.current[2] = el)}
              className="bg-card p-10 rounded-3xl border border-border shadow-xl transition-all duration-500 hover:border-yellow-500/50 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
              onMouseMove={(e) => handleCardMouseMove(e, 2)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 2)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="p-5 inline-block bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-2xl text-yellow-500 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-yellow-500 transition-colors">
                  Pontos de Interesse
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Descubra restaurantes, postos e atrações ao longo do caminho com avaliações em tempo real.
                </p>
              </div>
            </div>
            
            <div
              ref={(el) => (cardRefs.current[3] = el)}
              className="bg-card p-10 rounded-3xl border border-border shadow-xl transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
              onMouseMove={(e) => handleCardMouseMove(e, 3)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="p-5 inline-block bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl text-purple-500 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-purple-500 transition-colors">
                  Compartilhar Itinerário
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compartilhe rotas em tempo real com familiares e equipes com rastreamento ao vivo.
                </p>
              </div>
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Efeito three.js para o fundo melhorado
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

    const light = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0x3b82f6, 0.4);
    directionalLight.position.set(0, 0, 5);
    scene.add(directionalLight);

    const geometry = new THREE.PlaneGeometry(12, 12, 40, 40);
    const material = new THREE.MeshLambertMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.x = mouseY * 0.15;
      plane.rotation.y = mouseX * 0.15;
      plane.rotation.z += 0.001;
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
      window.removeEventListener("mousemove", handleMouseMove);
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
    <div
      className="bg-background min-h-screen text-foreground font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Barra de Navegação Premium com Logo Real */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border py-4 transition-all duration-300 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center group">
            <ViweLogo className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-2xl ml-3 text-foreground group-hover:text-primary transition-colors">Viwe</span>
          </div>

          <div className="hidden md:flex space-x-8 text-muted-foreground font-medium">
            <a
              href="#funcionalidades"
              className="hover:text-foreground transition-colors duration-200 relative group"
            >
              Funcionalidades
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#sobre"
              className="hover:text-foreground transition-colors duration-200 relative group"
            >
              Sobre nós
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#precos"
              className="hover:text-foreground transition-colors duration-200 relative group"
            >
              Preços
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-muted-foreground font-medium hover:text-foreground transition-colors duration-200 hidden md:block"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-6 py-3 rounded-full font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hidden md:block"
            >
              Começar grátis
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Premium */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col items-start px-6 py-6 space-y-4 text-muted-foreground font-medium bg-card/50 backdrop-blur-sm border-t border-border mx-6 mt-4 rounded-2xl">
            <a
              href="#funcionalidades"
              className="w-full py-3 px-4 hover:bg-secondary rounded-xl transition-colors duration-200"
            >
              Funcionalidades
            </a>
            <a
              href="#sobre"
              className="w-full py-3 px-4 hover:bg-secondary rounded-xl transition-colors duration-200"
            >
              Sobre nós
            </a>
            <a
              href="#precos"
              className="w-full py-3 px-4 hover:bg-secondary rounded-xl transition-colors duration-200"
            >
              Preços
            </a>
            <Link
              to="/login"
              className="w-full py-3 px-4 hover:bg-secondary rounded-xl transition-colors duration-200"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-colors duration-200 text-center"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="pt-24">
        <HomePage heroRef={heroRef} />

        {/* CTA Section Ultra Premium */}
        <section className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          {/* Partículas animadas */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mb-8">
                Pronto para revolucionar suas jornadas?
              </h2>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 mb-12 leading-relaxed">
                Junte-se a mais de 50.000 usuários que já otimizaram suas rotas com o Viwe.
                Comece gratuitamente e veja a diferença em sua primeira viagem!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <Link
                  to="/login"
                  className="bg-white text-primary px-10 py-5 rounded-full font-bold text-xl hover:bg-white/90 transition-all duration-300 shadow-2xl hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Sparkles className="h-6 w-6" />
                    Começar gratuitamente
                  </span>
                </Link>
                <button className="border-2 border-white/40 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:-translate-y-1">
                  <span className="flex items-center justify-center gap-3">
                    <MessageCircle className="h-6 w-6" />
                    Falar com vendas
                  </span>
                </button>
              </div>
              
              {/* Garantias */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Teste grátis por 30 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Ultra Premium */}
      <footer className="bg-gradient-to-br from-secondary via-background to-secondary text-muted-foreground py-24 border-t border-border relative overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center mb-8 group">
                <ViweLogo className="h-12 w-12 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-3xl ml-3 text-foreground group-hover:text-primary transition-colors">Viwe</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md text-lg">
                O planejador de rotas mais avançado do mercado. Otimize suas jornadas 
                com tecnologia de ponta e economize tempo, combustível e dinheiro.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social, index) => (
                  <div key={index} className="w-12 h-12 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center hover:from-primary/20 hover:to-blue-500/20 transition-all duration-300 cursor-pointer group border border-border hover:border-primary/30">
                    <span className="text-primary font-bold group-hover:scale-110 transition-transform">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-8 text-lg">Produto</h4>
              <ul className="space-y-4">
                {['Funcionalidades', 'Preços', 'API', 'Integrações', 'Mobile App'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-foreground transition-colors duration-200 relative group">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-8 text-lg">Empresa</h4>
              <ul className="space-y-4">
                {['Sobre nós', 'Carreira', 'Imprensa', 'Parceiros', 'Blog'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-foreground transition-colors duration-200 relative group">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-8 text-lg">Suporte</h4>
              <ul className="space-y-4">
                {['Central de ajuda', 'Contato', 'Status', 'Documentação', 'Comunidade'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-foreground transition-colors duration-200 relative group">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-12 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground/80 mb-4 md:mb-0">
              © 2024 Viwe. Todos os direitos reservados. Feito com ❤️ no Brasil.
            </p>
            <div className="flex space-x-8">
              {['Termos de uso', 'Política de privacidade', 'Cookies', 'LGPD'].map((item, index) => (
                <a key={index} href="#" className="text-muted-foreground hover:text-foreground transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
