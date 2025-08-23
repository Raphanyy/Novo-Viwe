import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import {
  Pause,
  Play,
  Trash2,
  StopCircle,
  Settings,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface NavigationAdjustmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationAdjustmentsModal: React.FC<NavigationAdjustmentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, pauseNavigation, resumeNavigation, removeStop, endRoute } =
    useTraceRoute();

  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
  const [showRemoveStopConfirm, setShowRemoveStopConfirm] = useState(false);
  const [selectedStopToRemove, setSelectedStopToRemove] = useState<
    string | null
  >(null);

  const handlePauseResume = () => {
    if (state.isPaused) {
      resumeNavigation();
    } else {
      pauseNavigation();
    }
    onClose();
  };

  const handleRemoveStop = (stopId: string) => {
    setSelectedStopToRemove(stopId);
    setShowRemoveStopConfirm(true);
  };

  const confirmRemoveStop = () => {
    if (selectedStopToRemove) {
      removeStop(selectedStopToRemove);
      setSelectedStopToRemove(null);
      setShowRemoveStopConfirm(false);
    }
  };

  const handleEndRoute = () => {
    setShowEndRouteConfirm(true);
  };

  const confirmEndRoute = () => {
    endRoute();
    setShowEndRouteConfirm(false);
    onClose();
  };

  const incompleteStops = state.stops.filter((stop) => !stop.isCompleted);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Ajustes da Navegação</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Pausar/Retomar Rota */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {state.isPaused ? (
                    <Play className="h-5 w-5 text-green-600" />
                  ) : (
                    <Pause className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {state.isPaused ? "Retomar" : "Pausar"} Navegação
                    </h3>
                    <p className="text-sm text-gray-600">
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

            {/* Remover Paradas */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Remover Paradas</h3>
                  <p className="text-sm text-gray-600">
                    Remova paradas que não são mais necessárias
                  </p>
                </div>
              </div>

              {incompleteStops.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Todas as paradas foram concluídas
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {incompleteStops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {stop.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {stop.name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
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

            {/* Encerrar Trajeto */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center space-x-3 mb-3">
                <StopCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-900">Encerrar Trajeto</h3>
                  <p className="text-sm text-red-700">
                    Finaliza completamente a navegação atual
                  </p>
                </div>
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
        </DialogContent>
      </Dialog>

      {/* Confirmação de Remoção de Parada */}
      <AlertDialog
        open={showRemoveStopConfirm}
        onOpenChange={setShowRemoveStopConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Remover Parada</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta parada da sua rota? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveStopConfirm(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveStop}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Encerramento */}
      <AlertDialog
        open={showEndRouteConfirm}
        onOpenChange={setShowEndRouteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <StopCircle className="h-5 w-5 text-red-600" />
              <span>Encerrar Trajeto</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar este trajeto? Toda a navegação
              será finalizada e você retornará ao início.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEndRouteConfirm(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndRoute}
              className="bg-red-600 hover:bg-red-700"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Encerrar Trajeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NavigationAdjustmentsModal;
