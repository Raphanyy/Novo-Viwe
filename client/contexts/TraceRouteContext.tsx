import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  useErrorHandler,
  fetchWithErrorHandling,
  ErrorType,
} from "../lib/error-handling";

export interface RouteStop {
  id: string;
  name: string;
  code?: string; // Código/ID da parada
  notes?: string; // Anotação da parada
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  isCompleted?: boolean;
  completedAt?: Date;
  order: number; // Ordem da parada na rota
}

export interface NavigationData {
  startTime: Date | null;
  totalDistance: number; // em metros
  remainingDistance: number; // em metros
  estimatedFuelConsumption: number; // em litros
  actualFuelConsumption: number; // em litros
  activeTime: number; // em milissegundos
  currentStopIndex: number; // índice da próxima parada a ser concluída
  lastOptimizationTime?: Date; // última otimização realizada
  optimizationCount: number; // número de otimizações realizadas
  averageStopTime: number; // tempo médio por parada em milissegundos
}

export interface TraceRouteState {
  isTracing: boolean;
  isInPreparation: boolean;
  showConfirmDialog: boolean;
  showConfigModal: boolean;
  centerPin: {
    coordinates: [number, number];
  } | null;
  stops: RouteStop[];
  routeType: "temporary" | "direct" | null;
  estimatedCredits: number;
  isRouteTraced: boolean;
  isNavigating: boolean;
  navigationMode: "traced" | "active" | null;
  showTraceConfirmed: boolean; // Nova: mostra se a rota foi confirmada e está pronta para navegar
  isInActiveNavigation: boolean; // Nova: indica se está navegando ativamente
  navigationData: NavigationData; // Dados da navegação ativa
  showDetailsModal: boolean; // Modal de detalhes da navegação
  showAdjustmentsModal: boolean; // Modal de ajustes da navegação
  isPaused: boolean; // Se a navegação está pausada
  allStopsCompleted: boolean; // Nova: indica se todas as paradas foram concluídas
  showFinalSummaryModal: boolean; // Modal do resumo final da rota
}

interface TraceRouteContextType {
  state: TraceRouteState;
  startTracing: () => void;
  stopTracing: () => void;
  addStop: (
    coordinates: [number, number],
    name?: string,
    address?: string,
  ) => Promise<void>;
  removeLastStop: () => void;
  clearAllStops: () => void;
  openConfiguration: () => void;
  closeConfiguration: () => void;
  setInPreparation: (value: boolean) => void;
  hideTraceConfirmation: () => void;
  confirmTrace: () => void;
  cancelTrace: () => void;
  updateCenterPin: (coordinates: [number, number]) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  setRouteTraced: (traced: boolean) => void;
  giveUpNavigation: () => void; // Nova: função para desistir da navegação
  startActiveNavigation: () => void; // Nova: inicia navegação ativa
  stopActiveNavigation: () => void; // Nova: para navegação ativa
  completeCurrentStop: () => void; // Concluir parada atual em ordem
  optimizeRoute: () => Promise<void>; // Otimizar rota com API Mapbox
  openDetailsModal: () => void; // Abrir modal de detalhes
  closeDetailsModal: () => void; // Fechar modal de detalhes
  openAdjustmentsModal: () => void; // Abrir modal de ajustes
  closeAdjustmentsModal: () => void; // Fechar modal de ajustes
  pauseNavigation: () => void; // Pausar navegação
  resumeNavigation: () => void; // Retomar navegação
  removeStop: (stopId: string) => void; // Remover parada específica
  endRoute: () => void; // Encerrar trajeto
  openFinalSummaryModal: () => void; // Abrir modal de resumo final
  closeFinalSummaryModal: () => void; // Fechar modal de resumo final
  saveAndCompleteRoute: () => void; // Salvar e marcar rota como concluída
  // Callbacks para limpeza do mapa
  setMapCleanupCallback: (callback: () => void) => void;
  // Atualizar dados de navegação com métricas reais do Mapbox
  updateNavigationData: (data: Partial<NavigationData>) => void;
  // Sugerir otimização inteligente baseada no comportamento
  suggestSmartOptimization: () => boolean;
}

const TraceRouteContext = createContext<TraceRouteContextType | undefined>(
  undefined,
);

export const useTraceRoute = () => {
  const context = useContext(TraceRouteContext);
  if (!context) {
    throw new Error("useTraceRoute must be used within a TraceRouteProvider");
  }
  return context;
};

interface TraceRouteProviderProps {
  children: ReactNode;
}

export const TraceRouteProvider: React.FC<TraceRouteProviderProps> = ({
  children,
}) => {
  const { handleError, handleAsyncError } = useErrorHandler();
  const [state, setState] = useState<TraceRouteState>({
    isTracing: false,
    isInPreparation: false,
    showConfirmDialog: false,
    showConfigModal: false,
    centerPin: null,
    stops: [],
    routeType: null,
    estimatedCredits: 0,
    isRouteTraced: false,
    isNavigating: false,
    navigationMode: null,
    showTraceConfirmed: false,
    isInActiveNavigation: false,
    navigationData: {
      startTime: null,
      totalDistance: 0,
      remainingDistance: 0,
      estimatedFuelConsumption: 0,
      actualFuelConsumption: 0,
      activeTime: 0,
      currentStopIndex: 0,
      optimizationCount: 0,
      averageStopTime: 0,
    },
    showDetailsModal: false,
    showAdjustmentsModal: false,
    isPaused: false,
    allStopsCompleted: false,
    showFinalSummaryModal: false,
  });

  // Callback para limpeza do mapa
  const [mapCleanupCallback, setMapCleanupCallback] = useState<
    (() => void) | null
  >(null);

  const startTracing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isTracing: true,
      centerPin: {
        coordinates: [-46.6333, -23.5505], // São Paulo center
      },
      routeType: "temporary",
      estimatedCredits: 5, // Default credits estimation
    }));
  }, []);

  const stopTracing = () => {
    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    setState((prev) => ({
      ...prev,
      isTracing: false,
      isInPreparation: false,
      showConfirmDialog: false,
      showConfigModal: false,
      centerPin: null,
      stops: [],
      routeType: null,
      estimatedCredits: 0,
      isRouteTraced: false,
      isNavigating: false,
      navigationMode: null,
      showTraceConfirmed: false,
      isInActiveNavigation: false,
      showDetailsModal: false,
      showAdjustmentsModal: false,
      isPaused: false,
      allStopsCompleted: false,
      showFinalSummaryModal: false,
      navigationData: {
        startTime: null,
      totalDistance: 0,
      remainingDistance: 0,
      estimatedFuelConsumption: 0,
      actualFuelConsumption: 0,
      activeTime: 0,
      currentStopIndex: 0,
      optimizationCount: 0,
      averageStopTime: 0,
      },
    }));
  };

  const addStop = async (
    coordinates: [number, number],
    name?: string,
    address?: string,
  ) => {
    // If no address provided, try to get one from coordinates
    let finalAddress = address;
    if (!finalAddress) {
      try {
        // Use Mapbox Geocoding API to get address from coordinates with centralized config
        const { createMapboxApiUrl } = await import("../lib/mapbox-config");
        const apiUrl = createMapboxApiUrl(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json`,
          { limit: "1", language: "pt" },
        );

        if (!apiUrl) {
          finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
        } else {
          const result = await handleAsyncError(async () => {
            const response = await fetchWithErrorHandling(
              apiUrl,
              {},
              {
                timeout: 8000,
                context: "AddressLookup",
                retries: 1,
                retryDelay: 500,
              },
            );
            return response.json();
          }, "AddressLookup");

          if (result.success && result.data?.features?.length > 0) {
            finalAddress = result.data.features[0].place_name;
          } else {
            finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
          }
        }
      } catch (error) {
        const errorInfo = handleError(error, "AddStopAddress");
        if (errorInfo.type !== ErrorType.ABORT) {
          console.debug(
            "Error fetching address, using coordinates:",
            errorInfo.message,
          );
        }
        finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
      }
    }

    const newStop: RouteStop = {
      id: `stop-${Date.now()}`,
      name: name || `Parada ${state.stops.length + 1}`,
      code: "", // Campo vazio para ser preenchido pelo usuário
      notes: "", // Campo vazio para ser preenchido pelo usuário
      coordinates,
      address: finalAddress,
      isCompleted: false,
      order: state.stops.length + 1,
    };

    setState((prev) => {
      const newStops = [...prev.stops, newStop];

      return {
        ...prev,
        stops: newStops,
        estimatedCredits: Math.min(prev.estimatedCredits + 2, 20), // Increase credits with more stops
      };
    });
  };

  const removeLastStop = () => {
    setState((prev) => ({
      ...prev,
      stops: prev.stops.slice(0, -1),
      estimatedCredits: Math.max(prev.estimatedCredits - 2, 5), // Decrease credits
    }));
  };

  const clearAllStops = () => {
    setState((prev) => ({
      ...prev,
      stops: [],
      estimatedCredits: 5,
    }));
  };

  const openConfiguration = () => {
    setState((prev) => ({
      ...prev,
      showConfigModal: true,
    }));
  };

  const closeConfiguration = () => {
    setState((prev) => ({
      ...prev,
      showConfigModal: false,
    }));
  };

  const setInPreparation = (value: boolean) => {
    setState((prev) => ({
      ...prev,
      isInPreparation: value,
    }));
  };

  const hideTraceConfirmation = () => {
    setState((prev) => ({
      ...prev,
      showConfirmDialog: false,
    }));
  };

  const confirmTrace = () => {
    // This will trigger the actual route tracing
    setState((prev) => ({
      ...prev,
      showConfirmDialog: false,
      isRouteTraced: true,
      navigationMode: "traced",
      showTraceConfirmed: true, // Ativa o modo "Navegar/Desistir"
      isTracing: false, // Sai do modo de tra��amento
    }));

    // Dispatcha evento para que o mapa trace a rota automaticamente
    window.dispatchEvent(
      new CustomEvent("traceRoute", {
        detail: { stops: state.stops },
      }),
    );

    console.log("Tracing confirmed! Drawing route...");
  };

  const cancelTrace = () => {
    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    // Cancel everything and reset
    stopTracing();
  };

  const updateCenterPin = useCallback((coordinates: [number, number]) => {
    setState((prev) => ({
      ...prev,
      centerPin: { coordinates },
    }));
  }, []);

  const startNavigation = () => {
    setState((prev) => ({
      ...prev,
      isNavigating: true,
      navigationMode: "active",
    }));
  };

  const stopNavigation = () => {
    setState((prev) => ({
      ...prev,
      isNavigating: false,
      navigationMode: "traced",
    }));
  };

  const setRouteTraced = (traced: boolean) => {
    setState((prev) => {
      // Evita re-renders desnecessários quando o valor não mudou
      if (prev.isRouteTraced === traced) {
        return prev;
      }
      return {
        ...prev,
        isRouteTraced: traced,
        navigationMode: traced ? "traced" : null,
      };
    });
  };

  const giveUpNavigation = () => {
    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    // Desiste da navegaç��o e volta ao estado inicial
    setState((prev) => ({
      ...prev,
      showTraceConfirmed: false,
      isInActiveNavigation: false,
      isNavigating: false,
      navigationMode: null,
      isRouteTraced: false,
      showDetailsModal: false,
      showAdjustmentsModal: false,
      isPaused: false,
      allStopsCompleted: false,
      showFinalSummaryModal: false,
      navigationData: {
        startTime: null,
      totalDistance: 0,
      remainingDistance: 0,
      estimatedFuelConsumption: 0,
      actualFuelConsumption: 0,
      activeTime: 0,
      currentStopIndex: 0,
      optimizationCount: 0,
      averageStopTime: 0,
      },
    }));
  };

  const startActiveNavigation = () => {
    // Inicia a navegação ativa com os controles "Concluir Parada, Otimizar, Detalhes, Ajustes"
    const totalDistance = state.stops.reduce((acc, stop, index) => {
      if (index < state.stops.length - 1) {
        // Cálculo simples de distância (pode ser melhorado com a API real)
        const [lng1, lat1] = stop.coordinates;
        const [lng2, lat2] = state.stops[index + 1].coordinates;
        const distance =
          Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)) *
          111000; // Aproximação
        return acc + distance;
      }
      return acc;
    }, 0);

    setState((prev) => ({
      ...prev,
      showTraceConfirmed: false,
      isInActiveNavigation: true,
      isNavigating: true,
      navigationMode: "active",
      navigationData: {
        ...prev.navigationData,
        startTime: new Date(),
        totalDistance,
        remainingDistance: totalDistance,
        estimatedFuelConsumption: totalDistance / 10000, // Estimativa simples
        currentStopIndex: 0,
        activeTime: 0,
      },
    }));
    console.log("Navegação ativa iniciada com", state.stops.length, "paradas");
  };

  const stopActiveNavigation = () => {
    // Para a navegação ativa e volta ao estado de rota traçada
    setState((prev) => ({
      ...prev,
      isInActiveNavigation: false,
      showTraceConfirmed: true,
      navigationMode: "traced",
    }));
  };

  const completeCurrentStop = () => {
    setState((prev) => {
      const currentStopIndex = prev.navigationData.currentStopIndex;
      if (currentStopIndex >= prev.stops.length) return prev;

      const updatedStops = prev.stops.map((stop, index) => {
        if (index === currentStopIndex) {
          return {
            ...stop,
            isCompleted: true,
            completedAt: new Date(),
          };
        }
        return stop;
      });

      const nextStopIndex = currentStopIndex + 1;
      const isRouteCompleted = nextStopIndex >= prev.stops.length;

      // Contar paradas restantes
      const remainingStops = updatedStops.filter((stop) => !stop.isCompleted);

      // Calcular tempo médio por parada para melhorar estimativas
      const completedStopsWithTime = updatedStops.filter(stop =>
        stop.isCompleted && stop.completedAt && prev.navigationData.startTime
      );

      let averageStopTime = prev.navigationData.averageStopTime;
      if (completedStopsWithTime.length > 0 && prev.navigationData.startTime) {
        const totalTimeSpent = Date.now() - prev.navigationData.startTime.getTime();
        averageStopTime = totalTimeSpent / completedStopsWithTime.length;
      }

      // Calculate remaining distance from completed stops
      const completedStopsCount = updatedStops.filter(
        (stop) => stop.isCompleted,
      ).length;
      const totalStops = updatedStops.length;
      const remainingDistance =
        prev.navigationData.totalDistance *
        ((totalStops - completedStopsCount) / totalStops);

      console.log(
        `Parada ${currentStopIndex + 1} concluída! Próxima: ${nextStopIndex + 1}/${totalStops}`,
      );

      // Usar inteligência adaptativa para decidir se deve otimizar
      if (!isRouteCompleted && remainingStops.length > 0) {
        // Aguardar atualização do estado antes de analisar
        setTimeout(() => {
          // Tentar usar inteligência adaptativa primeiro
          const optimizedIntelligently = state.isInActiveNavigation; // Será executado pela função externa

          // Se não otimizou inteligentemente e há poucas paradas, apenas re-traçar
          if (!optimizedIntelligently && remainingStops.length < 3) {
            window.dispatchEvent(
              new CustomEvent("traceRoute", {
                detail: { stops: remainingStops },
              })
            );
          }
        }, 500);
      }

      if (isRouteCompleted) {
        console.log("Todas as paradas foram concluídas! Abrindo resumo final.");
        // Quando todas as paradas são concluídas, abrir modal de resumo final após um pequeno delay
        setTimeout(() => {
          setState((current) => ({
            ...current,
            showFinalSummaryModal: true,
          }));
        }, 500);

        return {
          ...prev,
          stops: updatedStops,
          navigationData: {
            ...prev.navigationData,
            currentStopIndex: nextStopIndex,
            remainingDistance: 0,
          },
          isInActiveNavigation: false,
          allStopsCompleted: true,
        };
      }

      return {
        ...prev,
        stops: updatedStops,
        navigationData: {
          ...prev.navigationData,
          currentStopIndex: nextStopIndex,
          remainingDistance: Math.max(0, remainingDistance),
          averageStopTime,
        },
      };
    });
  };

  const optimizeRoute = async () => {
    try {
      // Durante navegação ativa, otimizar apenas paradas restantes
      const stopsToOptimize = state.isInActiveNavigation
        ? state.stops.filter((stop) => !stop.isCompleted)
        : state.stops;

      if (stopsToOptimize.length < 2) {
        console.log("Não há paradas suficientes para otimizar (mínimo 2)");
        return;
      }

      // Utiliza a API de Optimization do Mapbox com configuração centralizada
      const coordinates = stopsToOptimize.map((stop) => stop.coordinates);
      const coordinatesString = coordinates
        .map((coord) => `${coord[0]},${coord[1]}`)
        .join(";");

      const { createMapboxApiUrl } = await import("../lib/mapbox-config");
      const apiUrl = createMapboxApiUrl(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinatesString}`,
        { source: "first", destination: "last", roundtrip: "false" },
      );

      if (!apiUrl) {
        console.error("Erro ao otimizar rota: Token do Mapbox não disponível");
        return;
      }

      console.log(`Otimizando ${stopsToOptimize.length} paradas...`);

      const result = await handleAsyncError(async () => {
        const response = await fetchWithErrorHandling(
          apiUrl,
          {},
          {
            timeout: 15000,
            context: "OptimizeRoute",
            retries: 1,
            retryDelay: 1000,
          },
        );
        return response.json();
      }, "OptimizeRoute");

      if (result.success && result.data?.trips?.length > 0) {
        const optimizedWaypoints = result.data.waypoints;
        const trip = result.data.trips[0];

        setState((prev) => {
          let reorderedStops: RouteStop[];

          if (prev.isInActiveNavigation) {
            // Durante navegação, manter paradas concluídas no início e reordenar apenas as restantes
            const completedStops = prev.stops.filter((stop) => stop.isCompleted);
            const optimizedRemainingStops = optimizedWaypoints.map(
              (waypoint: any, index: number) => {
                const originalStop = stopsToOptimize[waypoint.waypoint_index];
                return {
                  ...originalStop,
                  order: completedStops.length + index + 1,
                };
              },
            );
            reorderedStops = [...completedStops, ...optimizedRemainingStops];
          } else {
            // Fora de navegação, reordenar todas as paradas
            reorderedStops = optimizedWaypoints.map(
              (waypoint: any, index: number) => {
                const originalStop = stopsToOptimize[waypoint.waypoint_index];
                return {
                  ...originalStop,
                  order: index + 1,
                };
              },
            );
          }

          // Atualizar dados de navegação com métricas reais do Mapbox
          const updatedNavigationData = {
            ...prev.navigationData,
            totalDistance: trip.distance || prev.navigationData.totalDistance,
            estimatedFuelConsumption: trip.distance
              ? (trip.distance / 1000) * 0.08 // 8L/100km estimativa
              : prev.navigationData.estimatedFuelConsumption,
            lastOptimizationTime: new Date(),
            optimizationCount: prev.navigationData.optimizationCount + 1,
          };

          return {
            ...prev,
            stops: reorderedStops,
            navigationData: updatedNavigationData,
          };
        });

        // Automaticamente re-traçar a rota no mapa após otimização
        setTimeout(() => {
          const updatedStops = state.isInActiveNavigation
            ? state.stops.filter((stop) => !stop.isCompleted)
            : state.stops;

          window.dispatchEvent(
            new CustomEvent("traceRoute", {
              detail: { stops: updatedStops },
            })
          );
        }, 100);

        console.log(`Rota otimizada com sucesso! Distância: ${trip.distance}m, Duração: ${trip.duration}s`);
      } else if (result.error) {
        if (
          result.error.shouldNotifyUser &&
          result.error.type !== ErrorType.ABORT
        ) {
          console.warn("Erro ao otimizar rota:", result.error.userMessage);
        }
      }
    } catch (error) {
      const errorInfo = handleError(error, "OptimizeRoute");
      if (errorInfo.shouldNotifyUser && errorInfo.type !== ErrorType.ABORT) {
        console.warn("Erro ao otimizar rota:", errorInfo.userMessage);
      }
    }
  };

  const openDetailsModal = () => {
    setState((prev) => ({ ...prev, showDetailsModal: true }));
  };

  const closeDetailsModal = () => {
    setState((prev) => ({ ...prev, showDetailsModal: false }));
  };

  const openAdjustmentsModal = () => {
    setState((prev) => ({ ...prev, showAdjustmentsModal: true }));
  };

  const closeAdjustmentsModal = () => {
    setState((prev) => ({ ...prev, showAdjustmentsModal: false }));
  };

  const pauseNavigation = () => {
    setState((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeNavigation = () => {
    setState((prev) => ({ ...prev, isPaused: false }));
  };

  const removeStop = (stopId: string) => {
    setState((prev) => {
      const updatedStops = prev.stops
        .filter((stop) => stop.id !== stopId)
        .map((stop, index) => ({ ...stop, order: index + 1 })); // Reordena as paradas

      return {
        ...prev,
        stops: updatedStops,
      };
    });
  };

  const endRoute = () => {
    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    // Se tem paradas incompletas, perguntar se deseja salvar no histórico
    const incompletedStops = state.stops.filter((stop) => !stop.isCompleted);
    if (incompletedStops.length > 0) {
      console.log(
        "Rota finalizada com",
        incompletedStops.length,
        "paradas não concluídas",
      );
    }

    // Encerra toda a navegação e volta ao estado inicial
    setState((prev) => ({
      ...prev,
      isInActiveNavigation: false,
      showTraceConfirmed: false,
      isNavigating: false,
      navigationMode: null,
      isRouteTraced: false,
      showDetailsModal: false,
      showAdjustmentsModal: false,
      isPaused: false,
      allStopsCompleted: false,
      showFinalSummaryModal: false,
      // Reset to initial state
      isTracing: false,
      stops: [],
      centerPin: null,
      routeType: null,
      estimatedCredits: 0,
      navigationData: {
        startTime: null,
      totalDistance: 0,
      remainingDistance: 0,
      estimatedFuelConsumption: 0,
      actualFuelConsumption: 0,
      activeTime: 0,
      currentStopIndex: 0,
      optimizationCount: 0,
      averageStopTime: 0,
      },
    }));
    console.log("Rota finalizada e estado resetado");
  };

  const openFinalSummaryModal = () => {
    setState((prev) => ({ ...prev, showFinalSummaryModal: true }));
  };

  const closeFinalSummaryModal = () => {
    setState((prev) => ({ ...prev, showFinalSummaryModal: false }));
  };

  const saveAndCompleteRoute = () => {
    // Aqui você pode salvar a rota no localStorage, banco de dados, etc.
    const routeSummary = {
      routeId: `route-${Date.now()}`,
      completedAt: new Date(),
      stops: state.stops,
      navigationData: state.navigationData,
      totalStops: state.stops.length,
      completedStops: state.stops.filter((stop) => stop.isCompleted).length,
      routeType: state.routeType,
      estimatedCredits: state.estimatedCredits,
    };

    // Salvar no localStorage (pode ser substitu��do por API call)
    const existingRoutes = JSON.parse(
      localStorage.getItem("completedRoutes") || "[]",
    );
    existingRoutes.push(routeSummary);
    localStorage.setItem("completedRoutes", JSON.stringify(existingRoutes));

    console.log("Rota salva e marcada como concluída:", routeSummary);

    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    // Resetar todo o estado após salvar
    setState((prev) => ({
      ...prev,
      isTracing: false,
      isInPreparation: false,
      showConfirmDialog: false,
      showConfigModal: false,
      centerPin: null,
      stops: [],
      routeType: null,
      estimatedCredits: 0,
      isRouteTraced: false,
      isNavigating: false,
      navigationMode: null,
      showTraceConfirmed: false,
      isInActiveNavigation: false,
      showDetailsModal: false,
      showAdjustmentsModal: false,
      isPaused: false,
      allStopsCompleted: false,
      showFinalSummaryModal: false,
      navigationData: {
        startTime: null,
      totalDistance: 0,
      remainingDistance: 0,
      estimatedFuelConsumption: 0,
      actualFuelConsumption: 0,
      activeTime: 0,
      currentStopIndex: 0,
      optimizationCount: 0,
      averageStopTime: 0,
      },
    }));
  };

  const value: TraceRouteContextType = {
    state,
    startTracing,
    stopTracing,
    addStop,
    removeLastStop,
    clearAllStops,
    openConfiguration,
    closeConfiguration,
    setInPreparation,
    hideTraceConfirmation,
    confirmTrace,
    cancelTrace,
    updateCenterPin,
    startNavigation,
    stopNavigation,
    setRouteTraced,
    giveUpNavigation,
    startActiveNavigation,
    stopActiveNavigation,
    completeCurrentStop,
    optimizeRoute,
    openDetailsModal,
    closeDetailsModal,
    openAdjustmentsModal,
    closeAdjustmentsModal,
    pauseNavigation,
    resumeNavigation,
    removeStop,
    endRoute,
    openFinalSummaryModal,
    closeFinalSummaryModal,
    saveAndCompleteRoute,
    setMapCleanupCallback: (callback: () => void) =>
      setMapCleanupCallback(() => callback),
    updateNavigationData: (data: Partial<NavigationData>) => {
      setState((prev) => ({
        ...prev,
        navigationData: {
          ...prev.navigationData,
          ...data,
        },
      }));
      console.log("Dados de navegação atualizados:", data);
    },
    suggestSmartOptimization: () => {
      const remainingStops = state.stops.filter((stop) => !stop.isCompleted);
      const completedStops = state.stops.filter((stop) => stop.isCompleted);
      const now = new Date();

      // Verificar se otimizou recentemente (evitar spam de otimizações)
      const lastOptimization = state.navigationData.lastOptimizationTime;
      const timeSinceLastOptimization = lastOptimization
        ? now.getTime() - lastOptimization.getTime()
        : Infinity;
      const minTimeBetweenOptimizations = 5 * 60 * 1000; // 5 minutos

      // Análise inteligente mais sofisticada
      const hasEnoughStops = remainingStops.length >= 3;
      const isActiveNavigation = state.isInActiveNavigation;
      const hasCompletedStops = completedStops.length >= 1;
      const notOptimizedRecently = timeSinceLastOptimization > minTimeBetweenOptimizations;
      const notOptimizedTooMuch = state.navigationData.optimizationCount < 5; // Máximo 5 otimizações por rota
      const hasGoodPerformanceData = state.navigationData.averageStopTime > 0;

      const shouldOptimize =
        hasEnoughStops &&
        isActiveNavigation &&
        hasCompletedStops &&
        notOptimizedRecently &&
        notOptimizedTooMuch &&
        !state.isTracing;

      if (shouldOptimize) {
        const reason = hasGoodPerformanceData
          ? `Padrão de navegação detectado (tempo médio: ${Math.round(state.navigationData.averageStopTime / 1000 / 60)}min/parada)`
          : "Condições ideais para re-otimização detectadas";

        console.log("🤖 Inteligência adaptativa: Sugerindo otimização inteligente", {
          remainingStops: remainingStops.length,
          completedStops: completedStops.length,
          optimizationCount: state.navigationData.optimizationCount,
          timeSinceLastOptimization: Math.round(timeSinceLastOptimization / 1000 / 60), // em minutos
          averageStopTime: Math.round(state.navigationData.averageStopTime / 1000 / 60), // em minutos
          reason
        });

        // Auto-otimizar com delay inteligente baseado no comportamento
        const smartDelay = hasGoodPerformanceData
          ? Math.min(2000, state.navigationData.averageStopTime / 10) // Delay proporcional ao tempo médio
          : 1000;

        setTimeout(() => {
          optimizeRoute();
        }, smartDelay);

        return true;
      }

      return false;
    },
  };

  return (
    <TraceRouteContext.Provider value={value}>
      {children}
    </TraceRouteContext.Provider>
  );
};
