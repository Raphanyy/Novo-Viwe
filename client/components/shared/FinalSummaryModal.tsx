import React from "react";
import AdaptiveModal from "./AdaptiveModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import {
  CheckCircle,
  Clock,
  Fuel,
  Route,
  MapPin,
  Calendar,
  Trophy,
  Star,
  TrendingUp,
  Save,
  Award,
} from "lucide-react";

interface FinalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndComplete: () => void;
}

const FinalSummaryModal: React.FC<FinalSummaryModalProps> = ({
  isOpen,
  onClose,
  onSaveAndComplete,
}) => {
  const handleSaveAndComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      onSaveAndComplete();
    } catch (error) {
      console.error("Erro ao salvar e completar rota:", error);
    }
  };

  const { endRoute } = useTraceRoute();

  const handleClose = () => {
    endRoute(); // Limpa tudo incluindo o mapa
    onClose();
  };

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
    return state.navigationData.activeTime || 0;
  };

  const completedStops = state.stops.filter((stop) => stop.isCompleted);
  const hasValidFuelData = state.navigationData.estimatedFuelConsumption > 0;
  const actualFuel =
    state.navigationData.actualFuelConsumption ||
    (hasValidFuelData
      ? state.navigationData.estimatedFuelConsumption * 0.85
      : 0);
  const fuelEconomy = hasValidFuelData
    ? state.navigationData.estimatedFuelConsumption - actualFuel
    : 0;
  const routeEfficiency =
    state.stops.length > 0
      ? (completedStops.length / state.stops.length) * 100
      : 0;
  const hasValidData = state.stops.length > 0 && completedStops.length > 0;

  const routeStats = {
    totalStops: state.stops.length,
    completedStops: completedStops.length,
    totalTime: getActiveTime(),
    totalDistance: state.navigationData.totalDistance || 0,
    fuelUsed: actualFuel,
    fuelSaved: fuelEconomy,
    efficiency: routeEfficiency,
    creditsUsed: state.estimatedCredits || 0,
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rota Concluída!"
      showBackButton={true}
      onBack={handleClose}
      rightContent={<Trophy className="h-5 w-5 text-yellow-600" />}
      fullPage={false}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Aviso se não há dados suficientes */}
        {!hasValidData && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-full">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  Rota Finalizada
                </div>
                <div className="text-sm text-muted-foreground">
                  {state.stops.length === 0
                    ? "Nenhuma parada foi configurada nesta rota."
                    : "A rota foi encerrada, mas pode não ter dados completos de navegação."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Detalhado */}
        <Accordion type="multiple" className="w-full">
          {/* Estatísticas Gerais da Rota */}
          <AccordionItem value="general-stats">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-2">
                <Route className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium">Estatísticas Gerais</span>
                  <p className="text-sm text-muted-foreground">
                    Resumo principal da rota.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Paradas Concluídas</div>
                    <div className="text-lg font-semibold text-green-600">
                      {routeStats.completedStops} de {routeStats.totalStops}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tempo Total</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {routeStats.totalTime > 0 ? formatTime(routeStats.totalTime) : "N/A"}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Distância Percorrida</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {routeStats.totalDistance > 0 ? formatDistance(routeStats.totalDistance) : "N/A"}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Combustível Usado</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {routeStats.fuelUsed > 0 ? `${routeStats.fuelUsed.toFixed(1)}L` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Conquistas e Badges */}
          {hasValidData && (
            <AccordionItem value="achievements">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <div>
                    <span className="font-medium">Conquistas</span>
                    <p className="text-sm text-muted-foreground">
                      Badges e reconhecimentos.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {routeStats.efficiency === 100 && (
                    <Badge className="bg-green-600/10 text-green-600 border-green-600/20">
                      <Star className="h-3 w-3 mr-1" />
                      Rota 100% Completa
                    </Badge>
                  )}
                  {routeStats.fuelSaved > 0 && (
                    <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Economia de Combustível
                    </Badge>
                  )}
                  {routeStats.totalTime > 0 && routeStats.totalTime < 60 * 60 * 1000 && (
                    <Badge className="bg-purple-600/10 text-purple-600 border-purple-600/20">
                      <Clock className="h-3 w-3 mr-1" />
                      Rota Rápida
                    </Badge>
                  )}
                  {routeStats.efficiency >= 80 && routeStats.efficiency < 100 && (
                    <Badge className="bg-yellow-600/10 text-yellow-600 border-yellow-600/20">
                      <Award className="h-3 w-3 mr-1" />
                      Boa Eficiência
                    </Badge>
                  )}
                  {(routeStats.efficiency < 80 || routeStats.efficiency === 0) && (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma conquista obtida nesta rota.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
            {/* Desempenho da Viagem */}
            <AccordionItem value="performance">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Desempenho da Viagem</span>
                    <p className="text-sm text-muted-foreground">
                      Eficiência e créditos.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Eficiência</div>
                      <div className="text-lg font-semibold text-foreground">
                        {routeStats.efficiency.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Créditos Usados
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {routeStats.creditsUsed}
                      </div>
                    </div>
                  </div>

                  {state.navigationData.startTime && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Viagem realizada:</strong>{" "}
                      {state.navigationData.startTime.toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                      às{" "}
                      {state.navigationData.startTime.toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Todas as Paradas Concluídas */}
            <AccordionItem value="all-stops">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <span className="font-medium">Paradas Realizadas</span>
                    <p className="text-sm text-muted-foreground">
                      Detalhes das paradas.
                    </p>
                  </div>
                  <Badge variant="secondary">{completedStops.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {completedStops.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium text-foreground mb-2">
                        Nenhuma parada concluída
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A rota foi encerrada sem paradas concluídas.
                      </p>
                    </div>
                  ) : (
                    completedStops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className="flex items-start space-x-3 p-3 bg-green-600/10 border border-green-600/20 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {stop.order}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {stop.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {stop.address}
                          </p>
                          {stop.completedAt && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
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

            {/* Economia e Sustentabilidade */}
            <AccordionItem value="economy">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Fuel className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-medium">
                      Economia e Sustentabilidade
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Consumo de combustível.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {hasValidFuelData ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-orange-600/10 border border-orange-600/20 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            Combustível Estimado
                          </div>
                          <div className="text-lg font-semibold text-orange-600">
                            {state.navigationData.estimatedFuelConsumption.toFixed(
                              1,
                            )}{" "}
                            L
                          </div>
                        </div>
                        <div className="bg-green-600/10 border border-green-600/20 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            Combustível Real
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            {actualFuel.toFixed(1)} L
                          </div>
                        </div>
                      </div>

                      {fuelEconomy > 0 ? (
                        <div className="bg-green-600/10 border border-green-600/20 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              Você economizou {fuelEconomy.toFixed(1)}L de
                              combustível!
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-600/10 border border-blue-600/20 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Fuel className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              Consumo dentro do esperado.
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium text-foreground mb-2">
                        Dados de combustível não disponíveis
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A rota foi muito curta para calcular o consumo de
                        combustível.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Apenas Fechar
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar e Encerrar
          </Button>
        </div>
      </div>
    </AdaptiveModal>
  );
};

export default FinalSummaryModal;
