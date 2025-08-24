import React from "react";
import { cn } from "@/lib/utils";

interface ViweLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  withText?: string | null;
  className?: string;
  centered?: boolean;
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const ViweLoader: React.FC<ViweLoaderProps> = ({
  size = "md",
  withText,
  className,
  centered = false,
  fullScreen = false,
}) => {
  const logoSize = sizeClasses[size];

  const LogoAnimation = () => (
    <div className={cn("relative overflow-hidden", logoSize, className)}>
      {/* Overlay que se move da esquerda para direita */}
      <div
        className="absolute inset-0 bg-background z-10"
        style={{
          transform: "translateX(-100%)",
          animation: "viweSlideRight 1.5s ease-out infinite",
        }}
      />
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fd5c53ac52fed4b2bb10c3c1f5dacdb73%2F83e633ef02914957b822f0c6a448850f?format=webp&width=800"
        alt="Viwe Logo"
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{
          filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
        draggable={false}
      />
      <style>{`
        @keyframes viweSlideRight {
          0% {
            transform: translateX(-100%);
          }
          70% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <LogoAnimation />
        {withText && (
          <p className="mt-4 text-sm text-muted-foreground">{withText}</p>
        )}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LogoAnimation />
        {withText && (
          <p className="mt-2 text-sm text-muted-foreground">{withText}</p>
        )}
      </div>
    );
  }

  // Inline version
  return (
    <div className="flex items-center">
      <LogoAnimation />
      {withText && <span className="ml-2 text-sm">{withText}</span>}
    </div>
  );
};

// Componente específico para botões inline
export const ViweLoaderInline: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center">
    <ViweLoader size="sm" className="mr-2" />
    {text && <span>{text}</span>}
  </div>
);

// Componente para fallbacks de Suspense
export const ViweLoaderCenter: React.FC<{ text?: string }> = ({ text }) => (
  <ViweLoader size="lg" withText={text} centered />
);

// Componente para tela cheia
export const ViweLoaderFullScreen: React.FC<{ text?: string }> = ({ text }) => (
  <ViweLoader size="xl" withText={text} fullScreen />
);

export default ViweLoader;
