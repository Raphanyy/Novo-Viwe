import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Target,
  Plus,
  Minus,
  Layers,
  Navigation2,
  Car,
  Clock,
  Route as RouteIcon,
  X,
  AlertTriangle,
  MoveRight,
  BookmarkPlus,
  RotateCcw,
  Loader2,
  Share2,
} from "lucide-react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import ModalHeader from "../../components/shared/ModalHeader";
import { useRouteModal } from "../../hooks/use-route-modal";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import ViweLoader from "../../components/shared/ViweLoader";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  mapboxConfig,
  isMapboxAvailable,
  getMapboxToken,
  getMapboxError,
  createMapboxApiUrl,
} from "../../lib/mapbox-config";
import {
  useErrorHandler,
  fetchWithErrorHandling,
  ErrorType,
} from "../../lib/error-handling";
import {
  ResourceManager,
  createManagedTimeout,
} from "../../lib/resource-manager";
import {
  useCoordinateThrottle,
  useStableMemo,
  useSearchFilter,
  useStableCallback,
} from "../../lib/performance-utils";

interface SearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
  properties: {
    category?: string;
    address?: string;
  };
}

const MapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { handleError, handleAsyncError } = useErrorHandler();
  const resourceManager = useRef<ResourceManager>();

  // Inicializar ResourceManager
  if (!resourceManager.current) {
    resourceManager.current = new ResourceManager();
  }
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();
  const [mapMode, setMapMode] = useState<"normal" | "satellite" | "traffic">(
    "normal",
  );
  const [isTracingRoute, setIsTracingRoute] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const stopMarkers = useRef<mapboxgl.Marker[]>([]);
  const lastCoordinatesRef = useRef<[number, number] | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const {
    state: traceState,
    updateCenterPin,
    setInPreparation,
    confirmTrace,
    hideTraceConfirmation,
    cancelTrace,
    closeConfiguration,
    setRouteTraced,
    startNavigation,
    stopNavigation,
    setMapCleanupCallback,
  } = useTraceRoute();

  // Pontos de interesse com coordenadas reais de São Paulo
  const pointsOfInterest = [
    {
      id: 1,
      name: "Shopping Center Norte",
      type: "shopping",
      distance: "2.3 km",
      rating: 4.5,
      coordinates: [-46.6177, -23.5072], // lng, lat
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Hospital São Paulo",
      type: "hospital",
      distance: "1.8 km",
      rating: 4.2,
      coordinates: [-46.6444, -23.5505],
      color: "bg-red-500",
    },
    {
      id: 3,
      name: "Restaurante Villa",
      type: "restaurant",
      distance: "0.8 km",
      rating: 4.8,
      coordinates: [-46.6333, -23.5489],
      color: "bg-yellow-500",
    },
    {
      id: 4,
      name: "Posto Shell",
      type: "gas",
      distance: "1.2 km",
      rating: 4.0,
      coordinates: [-46.6511, -23.5575],
      color: "bg-green-500",
    },
    {
      id: 5,
      name: "Parque Central",
      type: "park",
      distance: "3.1 km",
      rating: 4.6,
      coordinates: [-46.6566, -23.5478],
      color: "bg-green-600",
    },
  ];

  const filterOptions = [
    { id: "restaurant", name: "Restaurantes", icon: "🍽️" },
    { id: "gas", name: "Postos", icon: "⛽" },
    { id: "hospital", name: "Hospitais", icon: "🏥" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "park", name: "Parques", icon: "🌳" },
  ];

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
  }, []);

  // Otimizar filteredPOIs usando memoização estável
  const filteredPOIs = useStableMemo(
    () => {
      return pointsOfInterest.filter(
        (poi) => activeFilters.length === 0 || activeFilters.includes(poi.type),
      );
    },
    [activeFilters],
    (prev, current) => {
      // Comparação customizada para arrays de filtros
      const [prevFilters] = prev as [string[]];
      const [currentFilters] = current as [string[]];

      if (prevFilters.length !== currentFilters.length) return false;
      return prevFilters.every(
        (filter: string, index: number) => filter === currentFilters[index],
      );
    },
  );

  // Function to clear all markers and routes from map (optimized)
  const clearAllMarkersAndRoutes = useCallback(() => {
    // Clear route from map inline to avoid circular dependency
    if (map.current && map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    // Clear stop markers
    stopMarkers.current.forEach((marker) => marker.remove());
    stopMarkers.current = [];

    // Reset route traced state
    setRouteTraced(false);
  }, [setRouteTraced]);

  // Initialize Mapbox with error handling
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Mapbox is available and configured
    if (!isMapboxAvailable()) {
      const errorMessage = getMapboxError();
      console.error("Mapbox not available:", errorMessage);
      setMapError(
        errorMessage ||
          "Token do Mapbox não configurado. Entre em contato com o suporte.",
      );
      return;
    }

    // Reset error state when attempting to initialize
    setMapError(null);

    try {
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-46.6333, -23.5505], // São Paulo center
        zoom: 12,
        attributionControl: false,
        fadeDuration: 100, // Reduce animation time to minimize abort scenarios
        preserveDrawingBuffer: false, // Improve performance
        antialias: false, // Reduce GPU usage
        crossSourceCollisions: false, // Reduce conflicts between sources
      });

      // Add comprehensive error handling for map loading
      map.current.on("error", (e) => {
        // Filter out AbortErrors and other expected errors
        if (e.error && e.error.message) {
          const errorMessage = e.error.message.toLowerCase();
          if (
            errorMessage.includes("abort") ||
            errorMessage.includes("cancelled") ||
            errorMessage.includes("signal is aborted") ||
            errorMessage.includes("operation was aborted")
          ) {
            return; // Silently ignore abort-related errors
          }
        }
        console.warn("Mapbox error (non-critical):", e.error);
      });

      // Add handling for source errors (including tile loading issues)
      map.current.on("sourcedataloading", () => {
        // Track source loading to help debug issues
      });

      map.current.on("sourcedata", (e) => {
        if (e.sourceDataType === "content" && e.isSourceLoaded) {
          // Source loaded successfully
        }
      });

      // Add current location marker
      const currentLocationEl = document.createElement("div");
      currentLocationEl.className =
        "w-4 h-4 bg-blue-600 rounded-full shadow-lg border-2 border-white";
      currentLocationEl.innerHTML =
        '<div class="w-full h-full rounded-full bg-blue-400 animate-pulse"></div>';

      new mapboxgl.Marker(currentLocationEl)
        .setLngLat([-46.6333, -23.5505])
        .addTo(map.current);

      // Register cleanup callback after map is initialized
      // Use setTimeout to avoid immediate execution during render
      createManagedTimeout(
        resourceManager.current!,
        "setCleanupCallback",
        () => {
          setMapCleanupCallback(clearAllMarkersAndRoutes);
        },
        0,
      );

      // Auto-activate find my location when entering the map page
      createManagedTimeout(
        resourceManager.current!,
        "autoLocation",
        () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;

                if (map.current) {
                  // Smooth fly to user's actual location
                  map.current.flyTo({
                    center: [longitude, latitude],
                    zoom: 15,
                    duration: 3000,
                  });

                  // Update the current location marker
                  const currentLocationEl = document.createElement("div");
                  currentLocationEl.className =
                    "w-5 h-5 bg-blue-600 rounded-full shadow-lg border-3 border-white relative";
                  currentLocationEl.innerHTML =
                    '<div class="w-full h-full rounded-full bg-blue-400 animate-pulse"></div><div class="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>';

                  // Remove default marker and add user's actual location
                  const existingMarkers =
                    document.querySelectorAll(".mapboxgl-marker");
                  existingMarkers.forEach((marker) => {
                    const markerEl = marker.querySelector(
                      ".w-4.h-4.bg-blue-600, .w-5.h-5.bg-blue-600",
                    );
                    if (markerEl) {
                      marker.remove();
                    }
                  });

                  new mapboxgl.Marker(currentLocationEl)
                    .setLngLat([longitude, latitude])
                    .addTo(map.current);
                }
              },
              (error) => {
                // Silently handle geolocation errors on auto-detect
                console.debug(
                  "Auto-location failed (user can still use manual button):",
                  error.message,
                );
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
              },
            );
          }
        },
        1500,
      ); // Wait 1.5s for map to fully initialize

      // Adicionar o mapa ao ResourceManager para cleanup automático
      if (map.current) {
        resourceManager.current!.addMapboxMap("mainMap", map.current);
      }

      return () => {
        // ResourceManager cuida do cleanup de timeouts e outros recursos
        resourceManager.current!.destroy();
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("aborted") ||
          error.message.includes("AbortError"))
      ) {
        // Silently handle AbortErrors during map initialization
        console.debug(
          "Map initialization AbortError (expected):",
          error.message,
        );
      } else {
        console.error("Failed to initialize map:", error);
        if (error instanceof Error) {
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")
          ) {
            setMapError(
              "Problema de conexão. Verifique sua internet e tente novamente.",
            );
          } else if (
            error.message.includes("token") ||
            error.message.includes("unauthorized")
          ) {
            setMapError(
              "Token do Mapbox inválido. Entre em contato com o suporte.",
            );
          } else {
            setMapError("Erro ao carregar o mapa. Tente atualizar a página.");
          }
        } else {
          setMapError("Erro desconhecido ao carregar o mapa.");
        }
      }
    }
  }, []); // Remove setMapCleanupCallback from dependencies

  // Optimized throttled center pin tracking using performance utils
  const throttledUpdateCenterPin = useCoordinateThrottle(
    updateCenterPin,
    100, // 100ms throttle
    0.0001, // 0.0001 degree tolerance
  );

  // Optimized center pin tracking when tracing starts/stops
  useEffect(() => {
    if (!map.current) return;

    if (traceState.isTracing) {
      // Initialize center coordinates when tracing starts
      const center = map.current.getCenter();
      const initialCoords: [number, number] = [center.lng, center.lat];
      lastCoordinatesRef.current = initialCoords;
      updateCenterPin(initialCoords);

      // Optimized event handler with throttling
      const updateCenterCoords = () => {
        if (map.current) {
          const center = map.current.getCenter();
          throttledUpdateCenterPin([center.lng, center.lat]);
        }
      };

      // Adicionar listeners diretamente ao Mapbox Map
      map.current.on("move", updateCenterCoords);
      map.current.on("zoom", updateCenterCoords);

      // Cleanup function
      return () => {
        // Remover listeners do Mapbox Map
        if (map.current) {
          map.current.off("move", updateCenterCoords);
          map.current.off("zoom", updateCenterCoords);
        }

        // Reset refs on cleanup
        lastUpdateTimeRef.current = 0;
        lastCoordinatesRef.current = null;
      };
    }
  }, [traceState.isTracing, throttledUpdateCenterPin]);

  // Otimizar visibleStops usando memoização estável
  const visibleStops = useStableMemo(() => {
    return traceState.stops.filter((stop) => {
      // During active navigation, only show incomplete stops
      if (traceState.isInActiveNavigation && stop.isCompleted) {
        return false;
      }
      return true;
    });
  }, [traceState.stops, traceState.isInActiveNavigation]);

  // Optimized stop markers update with memoization
  useEffect(() => {
    if (!map.current) return;

    // Clear existing stop markers
    stopMarkers.current.forEach((marker) => marker.remove());
    stopMarkers.current = [];

    // Add stop markers using memoized visible stops
    visibleStops.forEach((stop, index) => {
      const stopEl = document.createElement("div");
      stopEl.className = "relative";

      // Different styling for completed vs incomplete stops
      const isCompleted = stop.isCompleted;
      const backgroundColor = isCompleted ? "bg-gray-400" : "bg-green-500";
      const completedClass = isCompleted ? "opacity-60" : "";

      stopEl.innerHTML = `
        <div class="w-6 h-6 ${backgroundColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${completedClass}">
          ${isCompleted ? "✓" : stop.order || index + 1}
        </div>
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
          ${stop.name}${isCompleted ? " (Concluída)" : ""}
        </div>
      `;

      const marker = new mapboxgl.Marker(stopEl)
        .setLngLat(stop.coordinates)
        .addTo(map.current!);

      stopMarkers.current.push(marker);
    });
  }, [visibleStops]);

  // Handle config modal opening from trace context
  useEffect(() => {
    if (traceState.showConfigModal) {
      openRouteModal();
    }
  }, [traceState.showConfigModal, openRouteModal]);

  // Memoized map style to prevent unnecessary updates
  const mapStyle = useMemo(() => {
    switch (mapMode) {
      case "satellite":
        return "mapbox://styles/mapbox/satellite-v9";
      case "traffic":
        return "mapbox://styles/mapbox/navigation-day-v1";
      default:
        return "mapbox://styles/mapbox/streets-v12";
    }
  }, [mapMode]);

  // Update map style based on mode (optimized)
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyle);
  }, [mapStyle]);

  // Function to trace route between stops (optimized with better error handling)
  const traceRouteOnMap = useCallback(
    async (stops: Array<{ coordinates: [number, number] }>) => {
      if (!map.current || stops.length < 2) return;

      setIsTracingRoute(true);

      const result = await handleAsyncError(async () => {
        // Convert stops to coordinates string for Mapbox Directions API
        const coordinates = stops
          .map((stop) => `${stop.coordinates[0]},${stop.coordinates[1]}`)
          .join(";");

        // Call Mapbox Directions API using centralized config
        const apiUrl = createMapboxApiUrl(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
          { steps: "true", geometries: "geojson" },
        );

        if (!apiUrl) {
          throw new Error("Mapbox token não disponível para traçar rota");
        }

        // Use robust fetch with error handling
        const response = await fetchWithErrorHandling(
          apiUrl,
          {},
          {
            timeout: 15000,
            context: "TraceRoute",
            retries: 2,
            retryDelay: 1000,
          },
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Remove existing route if any
          if (map.current && map.current.getSource("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
          }

          // Add route to map
          if (map.current) {
            map.current.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route.geometry,
              },
            });

            map.current.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.8,
              },
            });

            // Fit map to show entire route
            const coordinates = route.geometry.coordinates;
            const bounds = new mapboxgl.LngLatBounds();
            coordinates.forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });

            map.current.fitBounds(bounds, {
              padding: 50,
              duration: 1000,
            });
          }

          console.log("Rota traçada com sucesso:", {
            distance: route.distance,
            duration: route.duration,
            stops: stops.length,
          });

          // Marcar rota como traçada no contexto
          setRouteTraced(true);
        }
      }, "TraceRoute");

      if (!result.success && result.error) {
        // Só exibir erro para o usuário se necessário
        if (
          result.error.shouldNotifyUser &&
          result.error.type !== ErrorType.ABORT
        ) {
          console.error("Erro ao traçar rota:", result.error.userMessage);
        }
      }

      setIsTracingRoute(false);
    },
    [setRouteTraced, handleAsyncError],
  );

  // Memoized POI click handler to prevent recreation
  const handlePOIClick = useCallback((poi: any) => {
    setSelectedPOI(poi);
  }, []);

  // Optimized POI markers update
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add filtered POI markers with optimized event handling
    filteredPOIs.forEach((poi) => {
      const el = document.createElement("div");
      el.className = `w-8 h-8 ${poi.color} rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform duration-200`;
      el.innerHTML =
        '<div class="w-full h-full rounded-full bg-white/20 flex items-center justify-center"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>';

      el.addEventListener("click", () => handlePOIClick(poi));

      const marker = new mapboxgl.Marker(el)
        .setLngLat(poi.coordinates as [number, number])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [filteredPOIs, handlePOIClick]);

  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  const handleRecenter = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: [-46.6333, -23.5505],
        zoom: 12,
      });
    }
  }, []);

  const findMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada por este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (map.current) {
          // Voa para a localização atual do usuário
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 2000,
          });

          // Atualiza o marcador de localização atual com melhor visual
          const currentLocationEl = document.createElement("div");
          currentLocationEl.className =
            "w-5 h-5 bg-blue-600 rounded-full shadow-lg border-3 border-white relative";
          currentLocationEl.innerHTML =
            '<div class="w-full h-full rounded-full bg-blue-400 animate-pulse"></div><div class="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>';

          // Remove marcador anterior se existir
          const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
          existingMarkers.forEach((marker) => {
            const markerEl = marker.querySelector(
              ".w-4.h-4.bg-blue-600, .w-5.h-5.bg-blue-600",
            );
            if (markerEl) {
              marker.remove();
            }
          });

          // Adiciona novo marcador na localização atual
          new mapboxgl.Marker(currentLocationEl)
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }
      },
      (error) => {
        let errorMessage = "Erro ao obter localização: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Permissão negada pelo usuário.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Localização indisponível.";
            break;
          case error.TIMEOUT:
            errorMessage += "Tempo esgotado para obter localização.";
            break;
          default:
            errorMessage += "Erro desconhecido.";
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  // Enhanced search with business name recognition and robust error handling
  const searchBusinesses = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 3) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);

      // Helper function to enhance query context
      const enhanceQuery = (originalQuery: string): string => {
        const lowerQuery = originalQuery.toLowerCase();

        // Specific establishment recognition
        if (
          lowerQuery.includes("ilha plaza") ||
          lowerQuery.includes("ilha shopping")
        ) {
          return "Ilha Plaza Shopping São Paulo";
        } else if (
          lowerQuery.includes("quiosque zero oito") ||
          lowerQuery.includes("quiosque 08")
        ) {
          return `Quiosque 08 loja comércio São Paulo`;
        } else if (lowerQuery.includes("escola municipal alvaro moreira")) {
          return "Escola Municipal Alvaro Moreira São Paulo";
        }
        // Brazilian cities and states recognition
        else if (
          lowerQuery.includes("são paulo") ||
          lowerQuery.includes("sp")
        ) {
          return originalQuery.includes("SP")
            ? originalQuery
            : `${originalQuery} São Paulo`;
        } else if (
          lowerQuery.includes("rio de janeiro") ||
          lowerQuery.includes("rj")
        ) {
          return originalQuery.includes("RJ")
            ? originalQuery
            : `${originalQuery} Rio de Janeiro`;
        } else if (
          lowerQuery.includes("belo horizonte") ||
          lowerQuery.includes("mg")
        ) {
          return originalQuery.includes("MG")
            ? originalQuery
            : `${originalQuery} Minas Gerais`;
        } else if (
          lowerQuery.includes("brasília") ||
          lowerQuery.includes("df")
        ) {
          return originalQuery.includes("DF")
            ? originalQuery
            : `${originalQuery} Brasília DF`;
        } else if (
          lowerQuery.includes("salvador") ||
          lowerQuery.includes("ba")
        ) {
          return originalQuery.includes("BA")
            ? originalQuery
            : `${originalQuery} Salvador Bahia`;
        }
        // Business type recognition
        else if (
          lowerQuery.includes("shopping") &&
          !lowerQuery.includes("center")
        ) {
          return `${originalQuery} shopping center`;
        } else if (
          lowerQuery.includes("escola") &&
          !lowerQuery.includes("municipal")
        ) {
          return `${originalQuery} escola`;
        } else if (lowerQuery.includes("quiosque")) {
          return `${originalQuery} comercio loja estabelecimento`;
        }

        return originalQuery;
      };

      // Helper function to perform search
      const performSearch = async (
        searchQuery: string,
        types: string,
      ): Promise<any[]> => {
        const apiUrl = createMapboxApiUrl(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`,
          { country: "BR", language: "pt", limit: "8", types },
        );

        if (!apiUrl) {
          return [];
        }

        const result = await handleAsyncError(async () => {
          const response = await fetchWithErrorHandling(
            apiUrl,
            {},
            {
              timeout: 8000,
              context: "Search",
              retries: 1,
              retryDelay: 500,
            },
          );
          return response.json();
        }, "GeocodeSearch");

        if (result.success && result.data?.features) {
          return result.data.features;
        }

        return [];
      };

      // Helper function to deduplicate features
      const deduplicateFeatures = (features: any[]): any[] => {
        const seen = new Set();
        return features.filter((feature) => {
          const key = `${feature.text}-${feature.center[0].toFixed(3)}-${feature.center[1].toFixed(3)}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      };

      try {
        let allFeatures: any[] = [];
        const businessQuery = enhanceQuery(query);

        // Strategy 1: Direct POI search
        const poiFeatures = await performSearch(query, "poi");
        allFeatures.push(...poiFeatures);

        // Strategy 2: Enhanced business search (if needed and query was enhanced)
        if (allFeatures.length < 3 && businessQuery !== query) {
          const enhancedFeatures = await performSearch(
            businessQuery,
            "poi,place,region,district,postcode,locality,neighborhood",
          );
          allFeatures.push(...enhancedFeatures);
        }

        // Strategy 3: General search as fallback (if still need results)
        if (allFeatures.length < 2) {
          const generalFeatures = await performSearch(
            query,
            "place,address,region,district,postcode,locality,neighborhood",
          );
          allFeatures.push(...generalFeatures);
        }

        // Deduplicate and limit results
        const uniqueFeatures = deduplicateFeatures(allFeatures).slice(0, 5);

        if (uniqueFeatures.length > 0) {
          const results: SearchResult[] = uniqueFeatures.map(
            (feature: any) => ({
              id: feature.id,
              place_name: feature.place_name,
              text: feature.text,
              center: feature.center,
              place_type: feature.place_type,
              properties: feature.properties || {},
            }),
          );

          setSearchResults(results);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        const errorInfo = handleError(error, "SearchBusinesses");
        if (errorInfo.shouldNotifyUser && errorInfo.type !== ErrorType.ABORT) {
          console.warn("Erro na busca:", errorInfo.userMessage);
        }
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setIsSearching(false);
      }
    },
    [handleError, handleAsyncError],
  );

  // Optimized debounced search with stable reference
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Remove previous search timeout if exists
      resourceManager.current!.removeResource("searchTimeout");

      // Only search if query has meaningful content
      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      // Create managed timeout for search debouncing
      createManagedTimeout(
        resourceManager.current!,
        "searchTimeout",
        () => {
          searchBusinesses(query);
        },
        300,
      );
    },
    [searchBusinesses],
  );

  // Navigate to selected search result
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    if (map.current) {
      map.current.flyTo({
        center: result.center,
        zoom: 16,
        duration: 2000,
      });

      // Add a marker for the selected place
      const el = document.createElement("div");
      el.className =
        "w-8 h-8 bg-red-500 rounded-full shadow-lg border-2 border-white cursor-pointer flex items-center justify-center";
      el.innerHTML =
        '<svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

      // Remove existing search marker
      const existingSearchMarkers = document.querySelectorAll(".search-marker");
      existingSearchMarkers.forEach((marker) => marker.remove());

      const marker = new mapboxgl.Marker(el)
        .setLngLat(result.center)
        .addTo(map.current);

      // Add class for easy removal
      el.classList.add("search-marker");

      // Create a temporary POI object to show details
      setSelectedPOI({
        id: result.id,
        name: result.text,
        type: result.place_type[0] || "place",
        distance: "0 km",
        rating: null,
        coordinates: result.center,
        color: "bg-red-500",
        fullAddress: result.place_name,
      });
    }

    setSearchQuery(result.text);
    setShowSearchResults(false);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Cleanup all resources on unmount
  useEffect(() => {
    return () => {
      resourceManager.current!.destroy();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Search and Controls */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Buscar cidades, bairros, estabelecimentos..."
          />
          <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
            {isSearching && <ViweLoader size="xs" />}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Filter
              className={`h-5 w-5 transition-colors duration-200 ${showFilters ? "text-blue-600" : "text-gray-400"}`}
            />
          </button>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        result.place_type.includes("poi")
                          ? "bg-green-100"
                          : result.place_type.includes("place") ||
                              result.place_type.includes("locality")
                            ? "bg-purple-100"
                            : result.place_type.includes("region") ||
                                result.place_type.includes("district")
                              ? "bg-orange-100"
                              : result.place_type.includes("neighborhood")
                                ? "bg-yellow-100"
                                : "bg-blue-100"
                      }`}
                    >
                      {result.place_type.includes("poi") ? (
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      ) : (
                        <MapPin
                          className={`h-4 w-4 ${
                            result.place_type.includes("poi")
                              ? "text-green-600"
                              : result.place_type.includes("place") ||
                                  result.place_type.includes("locality")
                                ? "text-purple-600"
                                : result.place_type.includes("region") ||
                                    result.place_type.includes("district")
                                  ? "text-orange-600"
                                  : result.place_type.includes("neighborhood")
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
                          {result.text}
                        </p>
                        {result.place_type.includes("poi") && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Estabelecimento
                          </span>
                        )}
                        {result.place_type.includes("locality") && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Cidade
                          </span>
                        )}
                        {result.place_type.includes("region") && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Estado
                          </span>
                        )}
                        {result.place_type.includes("district") && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Região
                          </span>
                        )}
                        {result.place_type.includes("neighborhood") && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Bairro
                          </span>
                        )}
                        {result.place_type.includes("postcode") && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            CEP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {result.place_name}
                      </p>
                      {result.properties.category && (
                        <p className="text-xs text-gray-400 capitalize">
                          {result.properties.category.replace(/[_,]/g, " ")}
                        </p>
                      )}
                      {!result.properties.category &&
                        result.place_type.length > 0 && (
                          <p className="text-xs text-gray-400 capitalize">
                            {result.place_type[0].replace("_", " ")}
                          </p>
                        )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeFilters.includes(filter.id)
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{filter.icon}</span>
                <span className="text-sm font-medium">{filter.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Map Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setMapMode("normal")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                mapMode === "normal"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setMapMode("satellite")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                mapMode === "satellite"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapMode("traffic")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                mapMode === "traffic"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Trânsito
            </button>
          </div>

          <button
            onClick={handleRecenter}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Mapbox Token Missing Fallback */}
        {!isMapboxAvailable() && (
          <div className="absolute inset-0 z-40 bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="mb-6">
                <ViweLoader size="lg" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Mapa Indisponível
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {getMapboxError() ||
                  "Token do Mapbox não configurado. Configure VITE_MAPBOX_ACCESS_TOKEN para ativar o mapa."}
              </p>
              <div className="text-xs text-muted-foreground/70">
                Esta é uma versão de demonstração da plataforma Viwe.
              </div>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {mapError && (
          <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Mapa Indisponível
              </h3>
              <p className="text-muted-foreground mb-4">{mapError}</p>
              <button
                onClick={() => {
                  setMapError(null);
                  window.location.reload();
                }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Mapbox Container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Fixed Center Pin - Visible from "Traçar" until "Navegar" button appears */}
        {traceState.isTracing && !traceState.showTraceConfirmed && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="relative">
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                Arraste o mapa para posicionar
              </div>
            </div>
          </div>
        )}

        {/* Map Zoom Controls */}
        <div className="absolute right-4 top-4 bg-white rounded-2xl shadow-lg overflow-hidden z-10">
          <button
            onClick={handleZoomIn}
            className="block p-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="block p-3 hover:bg-gray-50 transition-colors duration-200"
          >
            <Minus className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Find My Location Button */}
        <button
          onClick={findMyLocation}
          className="absolute left-4 top-4 bg-white rounded-full p-3 shadow-lg z-10 hover:bg-gray-50 transition-colors duration-200"
        >
          <Target className="h-5 w-5 text-gray-600" />
        </button>

        {/* Route Suggestion Button - Hidden when tracing */}
        {!traceState.isTracing && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <button
              onClick={openRouteModal}
              className="w-full bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RouteIcon className="h-5 w-5" />
              <span className="font-semibold">Criar Nova Rota</span>
            </button>
          </div>
        )}

        {/* Trace Confirmation Dialog - Full Page Modal */}
        {traceState.showConfirmDialog && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <ModalHeader
              title="Traçar Rota"
              showBackButton={true}
              onBack={() => {
                cancelTrace();
                clearAllMarkersAndRoutes();
              }}
              rightContent={<AlertTriangle className="h-5 w-5 text-orange-600" />}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-md mx-auto space-y-6">
                {/* Route Summary Card */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Confirmar Traçado da Rota
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Consome {traceState.estimatedCredits} créditos
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Paradas configuradas</span>
                        <span className="text-lg font-bold text-primary">{traceState.stops.length}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Esta ação irá traçar a rota completa no mapa conectando todas as paradas.
                      </p>
                    </div>

                    {traceState.stops.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Paradas da rota:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {traceState.stops.slice(0, 3).map((stop, index) => (
                            <div key={stop.id} className="flex items-center space-x-2 text-xs">
                              <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-medium">
                                {index + 1}
                              </div>
                              <span className="text-muted-foreground truncate">{stop.name}</span>
                            </div>
                          ))}
                          {traceState.stops.length > 3 && (
                            <div className="text-xs text-muted-foreground ml-6">
                              +{traceState.stops.length - 3} paradas adicionais
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Importante</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        O traçado da rota irá otimizar o caminho entre as paradas para economizar tempo e combustível.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      cancelTrace();
                      clearAllMarkersAndRoutes();
                    }}
                    className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-medium hover:bg-secondary/80 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      confirmTrace();
                      // Traçar a rota no mapa
                      await traceRouteOnMap(traceState.stops);
                    }}
                    disabled={isTracingRoute}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors duration-200 ${
                      isTracingRoute
                        ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isTracingRoute ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traçando...
                      </>
                    ) : (
                      <>
                        <RouteIcon className="h-4 w-4 mr-2" />
                        Confirmar Traçado
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POI Details Modal - Enhanced */}
        {selectedPOI && (
          <div className="fixed inset-x-4 bottom-4 z-45 animate-in slide-in-from-bottom duration-300">
            <div className="bg-card border border-border rounded-xl shadow-xl p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedPOI.name}
                    </h3>
                    {selectedPOI.type && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedPOI.color ? selectedPOI.color.replace('bg-', 'bg-') + '/20 text-' + selectedPOI.color.replace('bg-', '') : 'bg-gray-100 text-gray-700'}`}>
                        {selectedPOI.type === 'restaurant' ? 'Restaurante' :
                         selectedPOI.type === 'gas' ? 'Posto' :
                         selectedPOI.type === 'hospital' ? 'Hospital' :
                         selectedPOI.type === 'shopping' ? 'Shopping' :
                         selectedPOI.type === 'park' ? 'Parque' :
                         selectedPOI.type.charAt(0).toUpperCase() + selectedPOI.type.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {selectedPOI.fullAddress && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {selectedPOI.fullAddress}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {selectedPOI.distance}
                        </span>
                      </div>

                      {selectedPOI.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground">
                            {selectedPOI.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coordinates for reference */}
                    <div className="text-xs text-muted-foreground/70">
                      Coordenadas: {selectedPOI.coordinates[1].toFixed(4)}, {selectedPOI.coordinates[0].toFixed(4)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPOI(null)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors duration-200 flex-shrink-0"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Main Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (map.current) {
                        map.current.flyTo({
                          center: selectedPOI.coordinates,
                          zoom: 18,
                          duration: 2000,
                        });
                        setSelectedPOI(null);
                      }
                    }}
                    className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <MoveRight className="h-4 w-4" />
                    <span>Ir para lá</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await addStop(selectedPOI.coordinates, selectedPOI.name, selectedPOI.fullAddress || selectedPOI.name);
                        setSelectedPOI(null);
                        // Show success feedback
                        console.log(`Parada "${selectedPOI.name}" adicionada à rota!`);
                      } catch (error) {
                        console.error('Erro ao adicionar parada:', error);
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Parada</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Save to localStorage for "later" functionality
                      const savedPOIs = JSON.parse(localStorage.getItem('savedPOIs') || '[]');
                      const poiToSave = {
                        ...selectedPOI,
                        savedAt: new Date().toISOString()
                      };
                      savedPOIs.push(poiToSave);
                      localStorage.setItem('savedPOIs', JSON.stringify(savedPOIs));
                      setSelectedPOI(null);
                      console.log('Local salvo para mais tarde!');
                    }}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-xl font-medium hover:bg-secondary/80 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>

                  <button
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: selectedPOI.name,
                          text: `Confira este local: ${selectedPOI.name}`,
                          url: `https://www.google.com/maps?q=${selectedPOI.coordinates[1]},${selectedPOI.coordinates[0]}`
                        });
                      } else {
                        // Fallback to clipboard
                        const shareText = `${selectedPOI.name} - ${selectedPOI.fullAddress || 'Ver no mapa'}\nhttps://www.google.com/maps?q=${selectedPOI.coordinates[1]},${selectedPOI.coordinates[0]}`;
                        navigator.clipboard.writeText(shareText);
                        console.log('Link copiado para a área de transferência!');
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar (mobile) */}
      <div className="bg-white border-t border-gray-200 p-3 sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <Car className="h-4 w-4" />
              <span>12 min</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>2.3 km</span>
            </div>
          </div>
          <div className="text-green-600 font-medium">Trânsito normal</div>
        </div>
      </div>

      {/* Route Configuration Modal */}
      <RouteConfigurationModal
        isOpen={isRouteModalOpen}
        onClose={() => {
          closeRouteModal();
          closeConfiguration(); // Close the config modal state
          if (traceState.isTracing) {
            setInPreparation(true);
          }
        }}
        prefilledStops={traceState.isTracing ? traceState.stops : undefined}
        isTemporary={traceState.isTracing}
      />
    </div>
  );
};

export default MapPage;
