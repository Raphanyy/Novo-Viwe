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
} from "lucide-react";
import { Link } from "react-router-dom";

// === Componentes de Página ===

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
      {/* Secção Hero com Fundo Three.js */}
      <section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-background to-secondary">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          ref={heroRef}
        ></div>
        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`transition-all duration-1000 ease-out ${isHeroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h1 className="text-4xl md:text-7xl font-extrabold text-foreground leading-[1.05] tracking-[-0.05em]">
              Sua jornada, <br /> planejada de forma inteligente.
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
              className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg transform hover:-translate-y-0.5"
            >
              Começar a planejar
            </Link>
            <button className="text-foreground px-7 py-3 rounded-full border border-border font-semibold hover:bg-secondary transition-colors duration-200">
              Saiba mais
            </button>
          </div>
        </div>
      </section>

      {/* Secção de Logos (Confiança) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-lg font-semibold text-muted-foreground mb-12">
            Confiança de viajantes e empresas em todo o mundo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M5.895 24h-5.895v-24h18.27c5.939 0 9.873 2.858 9.873 8.358 0 5.432-3.824 8.312-9.674 8.312h-9.844v7.33zm5.895-16.73c2.757 0 4.639-1.325 4.639-3.95 0-2.625-1.879-3.95-4.639-3.95h-5.895v7.9z" />
            </svg>
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M72.245 24.001h-5.748l-8.625-12.75-8.625 12.75h-5.748l12.18-18.001-12.18-18h5.748l8.625 12.75 8.625-12.75h5.748l-12.18 18z" />
            </svg>
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M96.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M116.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M141.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-muted-foreground/50 opacity-60"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M166.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Secção de Funcionalidades com animação */}
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
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-primary/50"
              onMouseMove={(e) => handleCardMouseMove(e, 0)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            >
              <div className="p-4 inline-block bg-primary/10 rounded-xl text-primary">
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
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-green-500/50"
              onMouseMove={(e) => handleCardMouseMove(e, 1)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 1)}
            >
              <div className="p-4 inline-block bg-green-500/10 rounded-xl text-green-500">
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
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-yellow-500/50"
              onMouseMove={(e) => handleCardMouseMove(e, 2)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 2)}
            >
              <div className="p-4 inline-block bg-yellow-500/10 rounded-xl text-yellow-500">
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
              className="bg-card p-8 rounded-2xl border border-border shadow-xl transition-all duration-300 hover:border-purple-500/50"
              onMouseMove={(e) => handleCardMouseMove(e, 3)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            >
              <div className="p-4 inline-block bg-purple-500/10 rounded-xl text-purple-500">
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
            <Rocket className="h-8 w-8 text-primary" />
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

        {/* CTA Section */}
        <section className="bg-secondary py-20 text-center border-t border-border">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">
              Pronto para sua próxima aventura?
            </h2>
            <p className="mt-4 text-lg max-w-xl mx-auto text-muted-foreground">
              Crie sua conta agora e comece a planejar seus trajetos com a Viwe.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg"
              >
                Começar a planejar
              </Link>
              <button className="border border-border text-muted-foreground px-7 py-3 rounded-full font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                Contatar suporte
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-muted-foreground py-16 border-t border-border">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center">
              <Compass className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg ml-2 text-foreground">Viwe</span>
            </div>
            <p className="mt-4 text-sm max-w-xs">
              Planejador de rotas <br /> para o mundo.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Funcionalidades</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Otimização
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Trânsito
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Pontos de interesse
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Compartilhar
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Empresa</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Sobre nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Ajuda</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Suporte
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Termos de uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Política de privacidade
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Idioma</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Português (Brasil)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  English (United States)
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-muted-foreground/60">
              © 2024 Viwe. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
