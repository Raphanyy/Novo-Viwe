import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { MapPin, Route, Share2, TrafficCone } from "lucide-react";

interface HomePageProps {
  heroRef: React.RefObject<HTMLDivElement>;
}

const HomePage: React.FC<HomePageProps> = ({ heroRef }) => {
  const [isHeroTextVisible, setIsHeroTextVisible] = useState(false);
  const featuresRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeroTextVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
    <>
      {/* Hero Section with Three.js Background */}
      <section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-white to-gray-50">
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
            <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto tracking-[-0.01em]">
              Viwe é o seu planejador de rotas definitivo. Otimize seus
              trajetos, descubra novos lugares e chegue ao seu destino com
              eficiência e tranquilidade.
            </p>
          </div>
          <div className="mt-12 flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg transform hover:-translate-y-0.5">
              Começar a planejar
            </button>
            <button className="text-foreground px-7 py-3 rounded-full border border-border font-semibold hover:bg-gray-100 transition-colors duration-200">
              Saiba mais
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-lg font-semibold text-gray-600 mb-12">
            Confiança de viajantes e empresas em todo o mundo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M5.895 24h-5.895v-24h18.27c5.939 0 9.873 2.858 9.873 8.358 0 5.432-3.824 8.312-9.674 8.312h-9.844v7.33zm5.895-16.73c2.757 0 4.639-1.325 4.639-3.95 0-2.625-1.879-3.95-4.639-3.95h-5.895v7.9z" />
            </svg>
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M72.245 24.001h-5.748l-8.625-12.75-8.625 12.75h-5.748l12.18-18.001-12.18-18h5.748l8.625 12.75 8.625-12.75h5.748l-12.18 18z" />
            </svg>
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M96.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M116.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M141.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
            <svg
              className="h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 100 24"
            >
              <path d="M166.792 12.001c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-12 7.333c-3.948 0-7.165-3.217-7.165-7.166 0-3.948 3.217-7.165 7.165-7.165 3.948 0 7.166 3.217 7.166 7.165 0 3.949-3.218 7.166-7.166 7.166z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`bg-background py-16 md:py-24 transition-opacity duration-1000 ${isFeaturesVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Recursos para otimizar sua viagem
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Tudo o que você precisa para uma jornada perfeita, num só lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              ref={(el) => (cardRefs.current[0] = el)}
              className="bg-card p-8 rounded-2xl shadow-xl transition-all duration-300"
              onMouseMove={(e) => handleCardMouseMove(e, 0)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            >
              <div className="p-4 inline-block bg-blue-100 rounded-xl text-blue-600">
                <Route className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6">
                Otimização de Rotas
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Calcule o caminho mais rápido e eficiente, economizando tempo e
                combustível.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[1] = el)}
              className="bg-card p-8 rounded-2xl shadow-xl transition-all duration-300"
              onMouseMove={(e) => handleCardMouseMove(e, 1)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 1)}
            >
              <div className="p-4 inline-block bg-green-100 rounded-xl text-green-600">
                <TrafficCone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6">
                Previsão de Trânsito
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Evite engarrafamentos com informações de trânsito em tempo real
                e previsões inteligentes.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[2] = el)}
              className="bg-card p-8 rounded-2xl shadow-xl transition-all duration-300"
              onMouseMove={(e) => handleCardMouseMove(e, 2)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 2)}
            >
              <div className="p-4 inline-block bg-yellow-100 rounded-xl text-yellow-600">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6">
                Pontos de Interesse
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Descubra e adicione locais importantes ao longo do seu caminho,
                como restaurantes e postos de gasolina.
              </p>
            </div>
            <div
              ref={(el) => (cardRefs.current[3] = el)}
              className="bg-card p-8 rounded-2xl shadow-xl transition-all duration-300"
              onMouseMove={(e) => handleCardMouseMove(e, 3)}
              onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            >
              <div className="p-4 inline-block bg-purple-100 rounded-xl text-purple-600">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mt-6">
                Compartilhar Itinerário
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Envie seu trajeto completo para amigos e familiares com apenas
                um toque.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
