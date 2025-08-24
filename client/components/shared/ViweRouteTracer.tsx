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
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white rounded-xl p-3 shadow-lg mx-auto max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {isTracing ? (
            <ViweLoaderInline size="sm" className="text-white" />
          ) : (
            <Zap className="h-5 w-5 text-yellow-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Route className="h-4 w-4" />
            <span className="font-medium text-sm">
              {isTracing ? "Traçando rota..." : "Rota traçada!"}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-blue-100">
            <MapPin className="h-3 w-3" />
            <span>{stopsCount} paradas conectadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViweRouteTracer;
