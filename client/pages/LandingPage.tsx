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
} from "lucide-react";
import { Link } from "react-router-dom";

// === Logo SVG Customizada ===
const ViweLogo = ({ className = "h-16 w-16" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Fundo do círculo */}
    <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" filter="url(#glow)" />
    
    {/* Foguete estilizado */}
    <path
      d="M50 15 L60 35 L55 40 L50 38 L45 40 L40 35 Z"
      fill="white"
    />
    <path
      d="M45 40 L55 40 L53 45 L52 50 L48 50 L47 45 Z"
      fill="white"
    />
    <path
      d="M47 50 L53 50 L52 55 L51 60 L49 60 L48 55 Z"
      fill="white"
    />
    
    {/* Chamas */}
    <path
      d="M48 60 L50 70 L52 60"
      fill="#f59e0b"
    />
    <path
      d="M46 62 L48 68 L50 62"
      fill="#ef4444"
    />
    <path
      d="M52 62 L54 68 L52 62"
      fill="#ef4444"
    />
    
    {/* Janelas */}
    <circle cx="48" cy="42" r="2" fill="#3b82f6" />
    <circle cx="52" cy="42" r="2" fill="#3b82f6" />
    
    {/* Estrelas decorativas */}
    <circle cx="25" cy="25" r="1" fill="white" opacity="0.8" />
    <circle cx="75" cy="30" r="1" fill="white" opacity="0.6" />
    <circle cx="30" cy="70" r="1" fill="white" opacity="0.7" />
    <circle cx="70" cy="75" r="1" fill="white" opacity="0.5" />
  </svg>
);

// === Componentes de Página ===

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
    { number: "1M+", label: "Rotas Otimizadas", icon: Route },
    { number: "50K+", label: "Usuários Ativos", icon: Users },
    { number: "99.9%", label: "Uptime Garantido", icon: Shield },
    { number: "30%", label: "Economia de Tempo", icon: Clock },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary/5 to-purple-500/5 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-1000 delay-${index * 200} ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.number}</div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
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
      text: "O Viwe revolucionou minha rotina de trabalho. Economizo 2 horas por dia nas minhas visitas aos clientes!",
      rating: 5,
    },
    {
      name: "Carlos Mendes",
      role: "Motorista de App",
      avatar: "CM",
      text: "Melhor aplicativo de rotas que já usei. A previsão de trânsito é incrivelmente precisa.",
      rating: 5,
    },
    {
      name: "Mariana Costa",
      role: "Empresária",
      avatar: "MC",
      text: "Nossa frota reduziu 25% no consumo de combustível usando as rotas otimizadas do Viwe.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
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
              className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-card-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
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
    },
    {
      step: "02", 
      title: "Otimização inteligente",
      description: "Nossa IA calcula a melhor rota considerando trânsito e preferências",
      icon: Zap,
    },
    {
      step: "03",
      title: "Navegue com confiança",
      description: "Siga as instruções em tempo real e chegue mais rápido ao destino",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Três passos simples para otimizar suas jornadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 transform -translate-x-1/2 z-0" />
              )}
              
              <div className="relative z-10 inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-6 shadow-lg">
                <step.icon className="h-12 w-12 text-primary-foreground" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold">
                  {step.step}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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
      description: "Disponível para iOS e Android com sincronização em nuvem",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Cloud,
      title: "Sincronização Automática",
      description: "Suas rotas ficam salvas e sincronizadas em todos os dispositivos",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análise detalhada de tempo, distância e economia de combustível",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Suporte Premium",
      description: "Atendimento 24/7 com especialistas em otimização de rotas",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recursos Avançados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tecnologia de ponta para a melhor experiência de navegação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
      {/* Secção Hero com Fundo Three.js e Logo */}
      <section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-background via-background to-primary/5">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          ref={heroRef}
        ></div>
        
        {/* Efeitos de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`transition-all duration-1000 ease-out ${isHeroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Logo grande acima do título */}
            <div className="mb-8 flex justify-center">
              <ViweLogo className="h-24 w-24 md:h-32 md:w-32 animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold text-foreground leading-[1.05] tracking-[-0.05em] mb-4">
              Sua jornada, <br /> 
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                planejada de forma inteligente.
              </span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto tracking-[-0.01em]">
              Viwe é o seu planejador de rotas definitivo. Otimize seus
              trajetos, descubra novos lugares e chegue ao seu destino com
              eficiência e tranquilidade.
            </p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="group bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-8 py-4 rounded-full font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 shadow-2xl transform hover:-translate-y-1 hover:shadow-primary/25"
            >
              <span className="flex items-center justify-center gap-2">
                Começar a planejar
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button className="group flex items-center justify-center gap-2 text-foreground px-8 py-4 rounded-full border border-border font-semibold hover:bg-secondary transition-all duration-200">
              <Play className="h-5 w-5" />
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas */}
      <StatsSection />

      {/* Secção de Logos (Confiança) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-lg font-semibold text-muted-foreground mb-12">
            Confiança de viajantes e empresas em todo o mundo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex justify-center">
                <div className="w-24 h-12 bg-muted-foreground/10 rounded-lg flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity">
                  <span className="text-muted-foreground text-sm font-semibold">LOGO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secção de Funcionalidades principais */}
      <section
        ref={featuresRef}
        className={`bg-secondary py-16 md:py-24 transition-opacity duration-1000 ${isFeaturesVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Recursos para otimizar sua viagem
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Tudo o que você precisa para uma jornada perfeita, num só lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              ref={(el) => (cardRefs.current[0] = el)}
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
              onMouseMove={(e) => handleCardMouseMove(e, 0)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            >
              <div className="p-4 inline-block bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl text-primary mb-6">
                <Route className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6 text-card-foreground">
                Otimização de Rotas
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Calcule o caminho mais rápido e eficiente, economizando tempo e
                combustível.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[1] = el)}
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl"
              onMouseMove={(e) => handleCardMouseMove(e, 1)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 1)}
            >
              <div className="p-4 inline-block bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl text-green-500 mb-6">
                <TrafficCone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6 text-card-foreground">
                Previsão de Trânsito
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Evite engarrafamentos com informações de trânsito em tempo real
                e previsões inteligentes.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[2] = el)}
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-yellow-500/50 hover:shadow-2xl"
              onMouseMove={(e) => handleCardMouseMove(e, 2)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 2)}
            >
              <div className="p-4 inline-block bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl text-yellow-500 mb-6">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6 text-card-foreground">
                Pontos de Interesse
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Descubra e adicione locais importantes ao longo do seu caminho,
                como restaurantes e postos de gasolina.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[3] = el)}
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl"
              onMouseMove={(e) => handleCardMouseMove(e, 3)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            >
              <div className="p-4 inline-block bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl text-purple-500 mb-6">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6 text-card-foreground">
                Compartilhar Itinerário
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Envie seu trajeto completo para amigos e familiares com apenas
                um toque.
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Efeito three.js para o fundo
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

    const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
    const material = new THREE.MeshLambertMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
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
      plane.rotation.x = mouseY * 0.1;
      plane.rotation.y = mouseX * 0.1;
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
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Barra de Navegação */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-4 transition-all duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <ViweLogo className="h-8 w-8" />
            <span className="font-bold text-xl ml-2 text-foreground">Viwe</span>
          </div>

          <div className="hidden md:flex space-x-8 text-muted-foreground font-medium">
            <a
              href="#funcionalidades"
              className="hover:text-foreground transition-colors duration-200"
            >
              Funcionalidades
            </a>
            <a
              href="#sobre"
              className="hover:text-foreground transition-colors duration-200"
            >
              Sobre nós
            </a>
            <a
              href="#precos"
              className="hover:text-foreground transition-colors duration-200"
            >
              Preços
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
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200 transform hover:-translate-y-0.5 hidden md:block"
            >
              Começar agora
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col items-start px-6 py-4 space-y-2 text-muted-foreground font-medium bg-background border-t border-border">
            <a
              href="#funcionalidades"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              Funcionalidades
            </a>
            <a
              href="#sobre"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              Sobre nós
            </a>
            <a
              href="#precos"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              Preços
            </a>
            <Link
              to="/login"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 text-center"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="pt-24">
        <HomePage heroRef={heroRef} />

        {/* CTA Section Premium */}
        <section className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-white mb-6">
              Pronto para revolucionar suas jornadas?
            </h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-white/90 mb-10">
              Junte-se a milhares de usuários que já otimizaram suas rotas com o Viwe.
              Comece gratuitamente hoje mesmo!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors duration-200 shadow-lg text-lg"
              >
                Começar gratuitamente
              </Link>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors duration-200 text-lg">
                Contatar vendas
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Premium */}
      <footer className="bg-secondary text-muted-foreground py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <ViweLogo className="h-8 w-8" />
                <span className="font-bold text-2xl ml-2 text-foreground">Viwe</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                O planejador de rotas mais avançado do mercado. Otimize suas jornadas 
                e economize tempo, combustível e dinheiro com nossa tecnologia de ponta.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6">Produto</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6">Empresa</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Sobre nós</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Carreira</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Imprensa</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Parceiros</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6">Suporte</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground/80">
              © 2024 Viwe. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
