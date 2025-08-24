import React from "react";
import { ViweLoaderInline } from "./ViweLoader";
import { Route, Zap, MapPin } from "lucide-react";

interface ViweRouteTracerProps {
  isVisible: boolean;
  stopsCount: number;
  isTracing: boolean;
}

/**
 * Componente que mostra feedback visual durante o traçamento de rota
 * Aparece na parte superior da tela quando a rota está sendo traçada
 */
const ViweRouteTracer: React.FC<ViweRouteTracerProps> = ({
  isVisible,
  stopsCount,
  isTracing,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {isTracing ? (
            <ViweLoaderInline text="" />
          ) : (
            <Zap className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Route className="h-4 w-4 text-gray-700" />
            <span className="font-medium text-sm text-gray-900">
              {isTracing ? "Traçando rota..." : "Rota traçada!"}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span>
              {isTracing
                ? `Da sua localização → ${stopsCount} paradas`
                : `Localização atual → ${stopsCount} paradas conectadas`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViweRouteTracer;
