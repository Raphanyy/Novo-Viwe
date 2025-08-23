import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import ModalHeader from "./ModalHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import {
  CheckCircle,
  Clock,
  Fuel,
  Route,
  MapPin,
  Navigation,
  Calendar,
} from "lucide-react";

interface NavigationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationDetailsModal: React.FC<NavigationDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useTraceRoute();

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getActiveTime = () => {
    if (state.navigationData.startTime && !state.isPaused) {
      const now = new Date();
      const diff = now.getTime() - state.navigationData.startTime.getTime();
      return state.navigationData.activeTime + diff;
    }
    return state.navigationData.activeTime;
  };

  const completedStops = state.stops.filter((stop) => stop.isCompleted);
  const remainingStops = state.stops.filter((stop) => !stop.isCompleted);
  const nextStop = remainingStops[0];

  const getNextStopDistance = () => {
    if (!nextStop) return 0;
    // Cálculo simples de distância para a próxima parada
    // Em uma implementação real, usaria a API do Mapbox para calcular a distância real
    return Math.random() * 5000 + 500; // Simulação
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title="Detalhes da Navegação"
          onClose={onClose}
          rightContent={
            <Navigation className="h-5 w-5 text-blue-600" />
          }
        />

        <div className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {/* Paradas Concluídas */}
            <AccordionItem value="completed-stops">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <span className="font-medium">Paradas Concluídas</span>
                    <p className="text-sm text-muted-foreground">Histórico de paradas.</p>
                  </div>
                  <Badge variant="secondary">{completedStops.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {completedStops.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma parada concluída ainda
                    </p>
                  ) : (
                    completedStops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {stop.order}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {stop.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {stop.address}
                          </p>
                          {stop.completedAt && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Concluída às{" "}
                                {stop.completedAt.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tempo em Atividade */}
            <AccordionItem value="activity-time">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Tempo em Atividade</span>
                    <p className="text-sm text-muted-foreground">Duração total.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Tempo Total</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatTime(getActiveTime())}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="text-lg font-semibold">
                        {state.isPaused ? (
                          <span className="text-yellow-600">Pausado</span>
                        ) : (
                          <span className="text-green-600">Ativo</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {state.navigationData.startTime && (
                    <div className="text-sm text-gray-600">
                      <strong>Iniciado em:</strong>{" "}
                      {state.navigationData.startTime.toLocaleString("pt-BR")}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Consumo de Combustível */}
            <AccordionItem value="fuel-consumption">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Fuel className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-medium">Consumo de Combustível</span>
                    <p className="text-sm text-muted-foreground">Estimado vs real.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Estimado</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {state.navigationData.estimatedFuelConsumption.toFixed(
                          1,
                        )}{" "}
                        L
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Real</div>
                      <div className="text-lg font-semibold text-red-600">
                        {state.navigationData.actualFuelConsumption.toFixed(1)}{" "}
                        L
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Economia:</strong>{" "}
                    {(
                      state.navigationData.estimatedFuelConsumption -
                      state.navigationData.actualFuelConsumption
                    ).toFixed(1)}{" "}
                    L
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Distância Total */}
            <AccordionItem value="total-distance">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Route className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="font-medium">Distância Total</span>
                    <p className="text-sm text-muted-foreground">Percorrida e restante.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {formatDistance(state.navigationData.totalDistance)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Restante</div>
                      <div className="text-lg font-semibold">
                        {formatDistance(state.navigationData.remainingDistance)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((state.navigationData.totalDistance -
                            state.navigationData.remainingDistance) /
                            state.navigationData.totalDistance) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Distância da Próxima Parada */}
            <AccordionItem value="next-stop-distance">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div>
                    <span className="font-medium">Próxima Parada</span>
                    <p className="text-sm text-muted-foreground">Distância e detalhes.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {nextStop ? (
                    <>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {nextStop.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {nextStop.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Distância:
                          </span>
                          <span className="text-lg font-semibold text-red-600">
                            {formatDistance(getNextStopDistance())}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Ordem da parada:</strong> {nextStop.order} de{" "}
                        {state.stops.length}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        Todas as paradas concluídas!
                      </h4>
                      <p className="text-sm text-gray-600">
                        Você completou todas as paradas desta rota.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationDetailsModal;
