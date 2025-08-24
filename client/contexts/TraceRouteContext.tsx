import React, { createContext, useContext, useState, ReactNode } from "react";

export interface RouteStop {
  id: string;
  name: string;
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
  showTraceConfirmation: () => void;
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

  const startTracing = () => {
    setState((prev) => ({
      ...prev,
      isTracing: true,
      centerPin: {
        coordinates: [-46.6333, -23.5505], // São Paulo center
      },
      routeType: "temporary",
      estimatedCredits: 5, // Default credits estimation
    }));
  };

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
          { limit: '1', language: 'pt' }
        );

        if (!apiUrl) {
          finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
        } else {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              finalAddress = data.features[0].place_name;
            } else {
              finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
            }
          } else {
            finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
          }
        }
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          console.warn("Error fetching address:", error);
        }
        finalAddress = `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}`;
      }
    }

    const newStop: RouteStop = {
      id: `stop-${Date.now()}`,
      name: name || `Parada ${state.stops.length + 1}`,
      coordinates,
      address: finalAddress,
      isCompleted: false,
      order: state.stops.length + 1,
    };

    setState((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop],
      estimatedCredits: Math.min(prev.estimatedCredits + 2, 20), // Increase credits with more stops
    }));
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

  const showTraceConfirmation = () => {
    setState((prev) => ({
      ...prev,
      showConfirmDialog: true,
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
    }));
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

  const updateCenterPin = (coordinates: [number, number]) => {
    setState((prev) => ({
      ...prev,
      centerPin: { coordinates },
    }));
  };

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
    setState((prev) => ({
      ...prev,
      isRouteTraced: traced,
      navigationMode: traced ? "traced" : null,
    }));
  };

  const giveUpNavigation = () => {
    // Limpa o mapa se callback estiver disponível
    if (mapCleanupCallback) {
      mapCleanupCallback();
    }

    // Desiste da navegação e volta ao estado inicial
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
      },
    }));
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

      if (isRouteCompleted) {
        console.log(
          "Todas as paradas foram concluídas! Mostrando opções de resumo e encerramento.",
        );
      }

      return {
        ...prev,
        stops: updatedStops,
        navigationData: {
          ...prev.navigationData,
          currentStopIndex: nextStopIndex,
          remainingDistance: Math.max(0, remainingDistance),
        },
        // Se todas as paradas foram concluídas, mostra estado de conclusão
        isInActiveNavigation: !isRouteCompleted,
        showTraceConfirmed: !isRouteCompleted, // Só mostra se não completou tudo
        allStopsCompleted: isRouteCompleted, // Novo estado para todas paradas concluídas
      };
    });
  };

  const optimizeRoute = async () => {
    try {
      // Utiliza a API de Optimization do Mapbox com configuração centralizada
      const coordinates = state.stops.map((stop) => stop.coordinates);
      const coordinatesString = coordinates
        .map((coord) => `${coord[0]},${coord[1]}`)
        .join(";");

      const { createMapboxApiUrl } = await import("../lib/mapbox-config");
      const apiUrl = createMapboxApiUrl(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinatesString}`,
        { source: 'first', destination: 'last', roundtrip: 'false' }
      );

      if (!apiUrl) {
        console.error("Erro ao otimizar rota: Token do Mapbox não disponível");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.trips && data.trips.length > 0) {
          const optimizedWaypoints = data.waypoints;

          // Reordena as paradas baseado na otimização
          setState((prev) => {
            const reorderedStops = optimizedWaypoints.map(
              (waypoint: any, index: number) => {
                const originalStop = prev.stops[waypoint.waypoint_index];
                return {
                  ...originalStop,
                  order: index + 1,
                };
              },
            );

            return {
              ...prev,
              stops: reorderedStops,
            };
          });

          console.log("Rota otimizada com sucesso!");
        }
      } else if (response.status === 401) {
        console.error("Erro ao otimizar rota: Token Mapbox inválido");
      } else if (response.status === 429) {
        console.error("Erro ao otimizar rota: Limite de requisições excedido");
      } else {
        console.error("Erro ao otimizar rota:", response.statusText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("Otimização de rota cancelada por timeout");
      } else {
        console.error("Erro ao chamar API de otimização:", error);
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
      navigationData: {
        startTime: null,
        totalDistance: 0,
        remainingDistance: 0,
        estimatedFuelConsumption: 0,
        actualFuelConsumption: 0,
        activeTime: 0,
        currentStopIndex: 0,
      },
    }));
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

    // Salvar no localStorage (pode ser substituído por API call)
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
    showTraceConfirmation,
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
  };

  return (
    <TraceRouteContext.Provider value={value}>
      {children}
    </TraceRouteContext.Provider>
  );
};
