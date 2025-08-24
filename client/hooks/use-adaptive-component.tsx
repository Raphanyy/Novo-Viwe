import React, { Suspense, useMemo } from "react";
import { usePlatform } from "../contexts/PlatformContext";

/**
 * Hook para carregar componentes específicos por plataforma dinamicamente
 */
export function useAdaptiveComponent<T = React.ComponentType<any>>(
  componentName: string,
  fallbackComponent?: React.ComponentType<any>,
): {
  Component: React.ComponentType<any> | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { device, isSSR } = usePlatform();

  const [Component, setComponent] =
    React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (isSSR) return;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load device-specific component first
        let module;
        try {
          module = await import(`../components/${device}/${componentName}`);
        } catch (deviceError) {
          // If device-specific component doesn't exist, try shared
          try {
            module = await import(`../components/shared/${componentName}`);
          } catch (sharedError) {
            // If neither exists and fallback is provided, use fallback
            if (fallbackComponent) {
              setComponent(fallbackComponent);
              setIsLoading(false);
              return;
            }
            throw new Error(
              `Component ${componentName} not found in ${device}/ or shared/ directories`,
            );
          }
        }

        setComponent(module.default);
      } catch (err) {
        setError(err as Error);
        console.error(
          `Failed to load adaptive component ${componentName}:`,
          err,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [componentName, device, isSSR, fallbackComponent]);

  // During SSR, try to use fallback or return null
  if (isSSR) {
    return {
      Component: fallbackComponent || null,
      isLoading: false,
      error: null,
    };
  }

  return { Component, isLoading, error };
}

/**
 * Componente wrapper que carrega automaticamente a versão correta de um componente
 * baseado na plataforma atual
 */
interface AdaptiveComponentProps {
  name: string;
  fallback?: React.ComponentType<any>;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  [key: string]: any;
}

export const AdaptiveComponent: React.FC<AdaptiveComponentProps> = ({
  name,
  fallback,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  ...props
}) => {
  const { Component, isLoading, error } = useAdaptiveComponent(name, fallback);

  // Default loading component
  const DefaultLoading = () => (
    <ViweLoaderCenter />
  );

  // Default error component
  const DefaultError = ({
    error,
    retry,
  }: {
    error: Error;
    retry: () => void;
  }) => (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <p className="text-red-600 text-sm mb-2">Erro ao carregar componente</p>
      <p className="text-gray-500 text-xs mb-3">{error.message}</p>
      <button
        onClick={retry}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );

  if (isLoading) {
    return LoadingComponent ? <LoadingComponent /> : <DefaultLoading />;
  }

  if (error) {
    const ErrorComp = ErrorComponent || DefaultError;
    return <ErrorComp error={error} retry={() => window.location.reload()} />;
  }

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};

/**
 * Higher-order component para criar componentes adaptativos
 */
export function withAdaptiveComponent<P extends object>(
  componentName: string,
  fallbackComponent?: React.ComponentType<P>,
) {
  return function AdaptiveWrapper(props: P) {
    return (
      <AdaptiveComponent
        name={componentName}
        fallback={fallbackComponent}
        {...props}
      />
    );
  };
}

/**
 * Hook para determinar se um componente específico existe para a plataforma atual
 */
export function useHasAdaptiveComponent(componentName: string): boolean {
  const { device } = usePlatform();
  const [exists, setExists] = React.useState(false);

  React.useEffect(() => {
    const checkComponent = async () => {
      try {
        await import(`../components/${device}/${componentName}`);
        setExists(true);
      } catch {
        try {
          await import(`../components/shared/${componentName}`);
          setExists(true);
        } catch {
          setExists(false);
        }
      }
    };

    checkComponent();
  }, [componentName, device]);

  return exists;
}
