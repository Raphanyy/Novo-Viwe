import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import ModalHeader from "./ModalHeader";
import SettingsSection from "../profile/SettingsSection";
import {
  Pause,
  Play,
  Trash2,
  StopCircle,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface NavigationAdjustmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enum para os níveis de navegação
enum NavigationLevel {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

// Interface para as seções principais
interface AdjustmentSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType<{ onBack: () => void }>;
}

const NavigationAdjustmentsModal: React.FC<NavigationAdjustmentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, pauseNavigation, resumeNavigation, removeStop, endRoute } =
    useTraceRoute();

  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
  const [showRemoveStopConfirm, setShowRemoveStopConfirm] = useState(false);
  const [selectedStopToRemove, setSelectedStopToRemove] = useState<
    string | null
  >(null);

  // Configuração das seções principais
  const adjustmentSections: AdjustmentSection[] = [
    {
      id: "control",
      title: "Controle de Navegação",
      subtitle: "Pausar ou retomar.",
      icon: state.isPaused ? Play : Pause,
      component: NavigationControlPage,
    },
    {
      id: "stops",
      title: "Gerenciar Paradas",
      subtitle: "Remover paradas.",
      icon: MapPin,
      component: ManageStopsPage,
    },
    {
      id: "route",
      title: "Encerrar Trajeto",
      subtitle: "Finalizar navegação.",
      icon: StopCircle,
      component: EndRoutePage,
    },
  ];

  // Funções de navegação
  const navigateToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentLevel(NavigationLevel.SECONDARY);
  };

  const goBack = () => {
    if (currentLevel === NavigationLevel.SECONDARY) {
      setCurrentLevel(NavigationLevel.PRIMARY);
      setSelectedSection(null);
    }
  };

  const getCurrentSection = () => {
    return adjustmentSections.find((section) => section.id === selectedSection);
  };

  // Renderização condicional baseada no nível atual
  const renderContent = () => {
    switch (currentLevel) {
      case NavigationLevel.PRIMARY:
        return renderPrimaryLevel();
      case NavigationLevel.SECONDARY:
        return renderSecondaryLevel();
      default:
        return renderPrimaryLevel();
    }
  };

  // Nível 1: Tela principal de ajustes
  const renderPrimaryLevel = () => (
    <div className="p-4 space-y-3">
      {adjustmentSections.map((section) => (
        <SettingsSection
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          icon={section.icon}
          onClick={() => navigateToSection(section.id)}
        />
      ))}
    </div>
  );

  // Nível 2: Página específica de ajuste
  const renderSecondaryLevel = () => {
    const section = getCurrentSection();
    if (!section || !section.component) return null;

    const Component = section.component;
    return <Component onBack={goBack} />;
  };

  const getHeaderTitle = () => {
    if (currentLevel === NavigationLevel.PRIMARY) return "Ajustes da Navegação";
    return getCurrentSection()?.title || "Ajustes da Navegação";
  };

  // Componente de Controle de Navegação
  function NavigationControlPage({ onBack }: { onBack: () => void }) {
    const handlePauseResume = () => {
      if (state.isPaused) {
        resumeNavigation();
      } else {
        pauseNavigation();
      }
      onClose();
    };

    return (
      <div className="p-4 space-y-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {state.isPaused ? (
                <Play className="h-6 w-6 text-green-600" />
              ) : (
                <Pause className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <h3 className="font-medium text-foreground">
                  {state.isPaused ? "Retomar" : "Pausar"} Navegação
                </h3>
                <p className="text-sm text-muted-foreground">
                  {state.isPaused
                    ? "Continue sua navegação de onde parou"
                    : "Pause temporariamente sua navegação"}
                </p>
              </div>
            </div>
            <Badge variant={state.isPaused ? "destructive" : "secondary"}>
              {state.isPaused ? "Pausado" : "Ativo"}
            </Badge>
          </div>
          <Button
            onClick={handlePauseResume}
            variant={state.isPaused ? "default" : "outline"}
            className="w-full"
          >
            {state.isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Retomar Navegação
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar Navegação
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Componente de Gerenciar Paradas
  function ManageStopsPage({ onBack }: { onBack: () => void }) {
    const incompleteStops = state.stops.filter((stop) => !stop.isCompleted);

    const handleRemoveStop = (stopId: string) => {
      setSelectedStopToRemove(stopId);
      setShowRemoveStopConfirm(true);
    };

    return (
      <div className="p-4 space-y-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-medium text-foreground">Remover Paradas</h3>
              <p className="text-sm text-muted-foreground">
                Remova paradas que não são mais necessárias
              </p>
            </div>
          </div>

          {incompleteStops.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">
                Todas as paradas foram concluídas
              </h4>
              <p className="text-sm text-muted-foreground">
                Não há paradas pendentes para remover.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incompleteStops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {stop.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {stop.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {stop.address}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveStop(stop.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Componente de Encerrar Rota
  function EndRoutePage({ onBack }: { onBack: () => void }) {
    const handleEndRoute = () => {
      setShowEndRouteConfirm(true);
    };

    return (
      <div className="p-4 space-y-4">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <StopCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Encerrar Trajeto</h3>
              <p className="text-sm text-red-700">
                Finaliza completamente a navegação atual
              </p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-red-100 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Atenção!</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Toda a navegação será finalizada</li>
              <li>• Você retornará ao início</li>
              <li>• Esta ação não pode ser desfeita</li>
            </ul>
          </div>

          <Button
            onClick={handleEndRoute}
            variant="destructive"
            className="w-full"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Encerrar Trajeto
          </Button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Full Page Modal */}
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <ModalHeader
          title={getHeaderTitle()}
          showBackButton={currentLevel !== NavigationLevel.PRIMARY}
          onBack={currentLevel === NavigationLevel.PRIMARY ? onClose : goBack}
        />

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>

      {/* Confirmation Overlays */}
      {showRemoveStopConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-foreground">
                Remover Parada
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja remover esta parada da sua rota? Esta ação
              não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRemoveStopConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedStopToRemove) {
                    removeStop(selectedStopToRemove);
                    setSelectedStopToRemove(null);
                    setShowRemoveStopConfirm(false);
                  }
                }}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEndRouteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center space-x-2 mb-4">
              <StopCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">
                Encerrar Trajeto
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja encerrar este trajeto? Toda a navegação
              será finalizada e você retornará ao início.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowEndRouteConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  endRoute();
                  setShowEndRouteConfirm(false);
                  onClose();
                }}
                className="flex-1"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Encerrar Trajeto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationAdjustmentsModal;
