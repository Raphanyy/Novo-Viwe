/**
 * VIWE UI COMPONENTS LIBRARY
 *
 * Componentes padronizados seguindo o Design System oficial.
 * OBRIGATÓRIO usar estes componentes para manter consistência.
 *
 * Baseado no padrão estabelecido da aplicação Viwe.
 */

import React, { useRef, useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";

// ========================================
// BOTÕES PADRONIZADOS
// ========================================

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-blue-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`text-gray-900 px-7 py-3 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`border border-gray-400 text-gray-400 px-7 py-3 rounded-full font-semibold hover:bg-gray-800 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// ========================================
// CARDS INTERATIVOS
// ========================================

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotationX = (y / rect.height - 0.5) * -10;
    const rotationY = (x / rect.width - 0.5) * 10;
    card.style.transform = `scale(1.05) perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  };

  const handleCardMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <div
      ref={cardRef}
      className={`bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ${className}`}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
    >
      {children}
    </div>
  );
};

// ========================================
// ÍCONES DE FUNCIONALIDADES
// ========================================

interface FeatureIconProps {
  icon: LucideIcon;
  variant?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
  size?: "sm" | "md" | "lg";
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({
  icon: Icon,
  variant = "blue",
  size = "md",
}) => {
  const variantClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={`inline-block rounded-xl ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
};

// ========================================
// COMPONENTES DE TEXTO
// ========================================

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroTitle: React.FC<TextProps> = ({
  children,
  className = "",
}) => (
  <h1
    className={`text-4xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-[-0.05em] ${className}`}
  >
    {children}
  </h1>
);

export const PageTitle: React.FC<TextProps> = ({
  children,
  className = "",
}) => (
  <h1
    className={`text-4xl md:text-5xl font-extrabold text-gray-900 text-center ${className}`}
  >
    {children}
  </h1>
);

export const SectionTitle: React.FC<TextProps> = ({
  children,
  className = "",
}) => (
  <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export const CardTitle: React.FC<TextProps> = ({
  children,
  className = "",
}) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;

export const SubsectionTitle: React.FC<TextProps> = ({
  children,
  className = "",
}) => <h3 className={`text-2xl font-semibold ${className}`}>{children}</h3>;

export const BodyLarge: React.FC<TextProps> = ({
  children,
  className = "",
}) => (
  <p
    className={`text-lg md:text-xl text-gray-600 tracking-[-0.01em] ${className}`}
  >
    {children}
  </p>
);

export const BodyMedium: React.FC<TextProps> = ({
  children,
  className = "",
}) => <p className={`text-lg text-gray-600 ${className}`}>{children}</p>;

export const BodySmall: React.FC<TextProps> = ({
  children,
  className = "",
}) => <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;

// ========================================
// LAYOUTS E CONTAINERS
// ========================================

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
}) => <div className={`container mx-auto px-6 ${className}`}>{children}</div>;

interface SectionProps {
  children: React.ReactNode;
  background?: "white" | "gray" | "dark";
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  background = "white",
  className = "",
}) => {
  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    dark: "bg-gray-900",
  };

  return (
    <section
      className={`py-16 md:py-24 ${backgroundClasses[background]} ${className}`}
    >
      {children}
    </section>
  );
};

export const HeroSection: React.FC<{
  children: React.ReactNode;
  heroRef?: React.RefObject<HTMLDivElement>;
}> = ({ children, heroRef }) => (
  <section className="relative overflow-hidden py-32 md:py-48 text-center bg-gradient-to-br from-white to-gray-50">
    {heroRef && (
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        ref={heroRef}
      ></div>
    )}
    <Container className="relative z-10">{children}</Container>
  </section>
);

export const CTASection: React.FC<ContainerProps> = ({
  children,
  className = "",
}) => (
  <section className={`bg-gray-900 py-20 text-white text-center ${className}`}>
    <Container>{children}</Container>
  </section>
);

// ========================================
// GRIDS RESPONSIVOS
// ========================================

interface GridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

export const FeaturesGrid: React.FC<GridProps> = ({
  children,
  columns = 4,
  className = "",
}) => {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-8 ${className}`}>
      {children}
    </div>
  );
};

export const ContentGrid: React.FC<GridProps> = ({
  children,
  columns = 2,
  className = "",
}) => {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-12 ${className}`}>
      {children}
    </div>
  );
};

// ========================================
// COMPONENTES DE ANIMAÇÃO
// ========================================

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  threshold = 0.2,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "0px", threshold },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const FadeInSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  threshold = 0.2,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "0px", threshold },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={`transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ========================================
// CARDS DE FUNCIONALIDADES PRÉ-MONTADOS
// ========================================

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  variant = "blue",
  index = 0,
}) => (
  <InteractiveCard index={index}>
    <FeatureIcon icon={icon} variant={variant} />
    <CardTitle className="mt-6">{title}</CardTitle>
    <BodySmall className="mt-2">{description}</BodySmall>
  </InteractiveCard>
);

interface SimpleFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
}

export const SimpleFeatureCard: React.FC<SimpleFeatureCardProps> = ({
  icon,
  title,
  description,
  variant = "blue",
}) => (
  <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
    <FeatureIcon icon={icon} variant={variant} size="lg" />
    <SubsectionTitle className="mb-2 mt-4">{title}</SubsectionTitle>
    <BodyMedium>{description}</BodyMedium>
  </div>
);

// ========================================
// PRICING CARDS
// ========================================

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  currency?: string;
  period?: string;
  features: string[];
  buttonText: string;
  isHighlighted?: boolean;
  onButtonClick?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  currency = "R$",
  period = "/mês",
  features,
  buttonText,
  isHighlighted = false,
  onButtonClick,
}) => (
  <div
    className={`p-8 rounded-3xl shadow-xl flex flex-col text-center transition-transform hover:scale-105 duration-300 ${
      isHighlighted ? "bg-blue-600 text-white shadow-2xl" : "bg-gray-50"
    }`}
  >
    <h3
      className={`text-2xl font-bold ${isHighlighted ? "text-white" : "text-gray-900"}`}
    >
      {title}
    </h3>
    <p className={`mt-2 ${isHighlighted ? "text-blue-200" : "text-gray-600"}`}>
      {subtitle}
    </p>
    <div className="my-6">
      <span
        className={`text-5xl font-extrabold ${isHighlighted ? "text-white" : "text-gray-900"}`}
      >
        {price === "Grátis" ? price : `${currency} ${price}`}
      </span>
      {price !== "Grátis" && (
        <span className={isHighlighted ? "text-blue-200" : "text-gray-600"}>
          {period}
        </span>
      )}
    </div>
    <ul
      className={`text-left space-y-2 flex-grow ${
        isHighlighted ? "text-blue-100" : "text-gray-600"
      }`}
    >
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <span
            className={`h-5 w-5 mr-2 ${
              isHighlighted ? "text-blue-300" : "text-blue-500"
            }`}
          >
            ✓
          </span>
          {feature}
        </li>
      ))}
    </ul>
    <button
      onClick={onButtonClick}
      className={`mt-8 w-full px-6 py-3 rounded-full font-semibold transition-colors duration-200 ${
        isHighlighted
          ? "bg-white text-blue-600 hover:bg-gray-100"
          : price === "Grátis"
            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
            : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {buttonText}
    </button>
  </div>
);

// ========================================
// CURSOR DOT COMPONENT
// ========================================

export const CursorDot: React.FC = () => {
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [isDotVisible, setIsDotVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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

  if (!isDotVisible) return null;

  return (
    <div
      className="fixed w-3 h-3 rounded-full bg-blue-500 pointer-events-none transition-transform duration-75 ease-out z-[9999]"
      style={{
        transform: `translate(${dotPosition.x}px, ${dotPosition.y}px)`,
        opacity: 0.8,
      }}
    />
  );
};

// ========================================
// LOGO COMPONENT
// ========================================

interface LogoProps {
  onClick?: () => void;
  className?: string;
  showText?: boolean;
}

export const ViweLogo: React.FC<LogoProps> = ({
  onClick,
  className = "",
  showText = true,
}) => (
  <div
    className={`flex items-center cursor-pointer ${className}`}
    onClick={onClick}
  >
    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-lg">V</span>
    </div>
    {showText && (
      <span className="font-bold text-xl ml-2 text-gray-900">Viwe</span>
    )}
  </div>
);
