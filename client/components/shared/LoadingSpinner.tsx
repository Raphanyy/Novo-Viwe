import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Carregando...",
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  loadingText?: string;
  retryAction?: () => void;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  loadingText = "Carregando...",
  retryAction,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">Oops! Algo deu errado</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        {retryAction && (
          <button
            onClick={retryAction}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
