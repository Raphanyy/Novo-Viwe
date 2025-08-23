import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configure Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA";

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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();
  const [mapMode, setMapMode] = useState<"normal" | "satellite" | "traffic">(
    "normal",
  );
  const [isTracingRoute, setIsTracingRoute] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const stopMarkers = useRef<mapboxgl.Marker[]>([]);

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

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
  };

  const filteredPOIs = pointsOfInterest.filter(
    (poi) => activeFilters.length === 0 || activeFilters.includes(poi.type),
  );

  // Function to clear all markers and routes from map
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

    try {
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-46.6333, -23.5505], // São Paulo center
        zoom: 12,
        attributionControl: false,
        optimizeForTerrain: false, // Reduce complex tile operations
        fadeDuration: 100, // Reduce animation time to minimize abort scenarios
      });

      // Add comprehensive error handling for map loading
      map.current.on('error', (e) => {
        // Filter out non-critical AbortErrors
        if (e.error && e.error.message && e.error.message.includes('aborted')) {
          return; // Silently ignore abort errors as they're expected during normal operation
        }
        console.warn('Mapbox error (non-critical):', e.error);
      });

      // Add handling for source errors (including tile loading issues)
      map.current.on('sourcedataloading', () => {
        // Track source loading to help debug issues
      });

      map.current.on('sourcedata', (e) => {
        if (e.sourceDataType === 'content' && e.isSourceLoaded) {
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
      const timeoutId = setTimeout(() => {
        setMapCleanupCallback(clearAllMarkersAndRoutes);
      }, 0);

      // Auto-activate find my location when entering the map page
      const autoLocationTimeout = setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;

              if (map.current) {
                // Smooth fly to user's actual location
                map.current.flyTo({
                  center: [longitude, latitude],
                  zoom: 15,
                  duration: 3000
                });

                // Update the current location marker
                const currentLocationEl = document.createElement("div");
                currentLocationEl.className =
                  "w-5 h-5 bg-blue-600 rounded-full shadow-lg border-3 border-white relative";
                currentLocationEl.innerHTML =
                  '<div class="w-full h-full rounded-full bg-blue-400 animate-pulse"></div><div class="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>';

                // Remove default marker and add user's actual location
                const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
                existingMarkers.forEach(marker => {
                  const markerEl = marker.querySelector('.w-4.h-4.bg-blue-600, .w-5.h-5.bg-blue-600');
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
              console.debug('Auto-location failed (user can still use manual button):', error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes cache
            }
          );
        }
      }, 1500); // Wait 1.5s for map to fully initialize

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(autoLocationTimeout);
        if (map.current) {
          try {
            // Clear all event listeners first
            map.current.off();

            // Stop any ongoing operations before removing the map
            map.current.stop();

            // Remove the map safely with a small delay to allow cleanup
            setTimeout(() => {
              try {
                if (map.current) {
                  map.current.remove();
                  map.current = null;
                }
              } catch (cleanupError) {
                // Silently handle cleanup errors (often AbortErrors from pending tile requests)
                if (!(cleanupError instanceof Error) ||
                    (!cleanupError.message.includes('aborted') &&
                     !cleanupError.message.includes('AbortError'))) {
                  console.warn("Map cleanup warning:", cleanupError);
                }
              }
            }, 100);
          } catch (error) {
            // Suppress AbortError and other cleanup errors
            if (error instanceof Error &&
                (error.message.includes('aborted') || error.message.includes('AbortError'))) {
              // Silently ignore AbortErrors during cleanup
            } else {
              console.warn("Map cleanup warning:", error);
            }
          }
          map.current = null;
        }
      };
    } catch (error) {
      if (error instanceof Error &&
          (error.message.includes('aborted') || error.message.includes('AbortError'))) {
        // Silently handle AbortErrors during map initialization
        console.debug('Map initialization AbortError (expected):', error.message);
      } else {
        console.error('Failed to initialize map:', error);
      }
    }
  }, []); // Remove setMapCleanupCallback from dependencies

  // Manage center pin tracking when tracing starts/stops
  useEffect(() => {
    if (!map.current) return;

    if (traceState.isTracing) {
      // Initialize center coordinates when tracing starts
      const center = map.current.getCenter();
      updateCenterPin([center.lng, center.lat]);

      // Add event listeners for dynamic tracking
      const updateCenterCoords = () => {
        if (map.current) {
          const center = map.current.getCenter();
          updateCenterPin([center.lng, center.lat]);
        }
      };

      map.current.on("move", updateCenterCoords);
      map.current.on("zoom", updateCenterCoords);

      // Cleanup function to remove listeners when tracing stops
      return () => {
        if (map.current) {
          map.current.off("move", updateCenterCoords);
          map.current.off("zoom", updateCenterCoords);
        }
      };
    }
  }, [traceState.isTracing]); // Only depend on isTracing to prevent loop

  // Update stop markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing stop markers
    stopMarkers.current.forEach((marker) => marker.remove());
    stopMarkers.current = [];

    // Add stop markers - only for incomplete stops during active navigation
    traceState.stops.forEach((stop, index) => {
      // During active navigation, only show incomplete stops
      if (traceState.isInActiveNavigation && stop.isCompleted) {
        return; // Skip completed stops during navigation
      }

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
  }, [traceState.stops, traceState.isInActiveNavigation]);

  // Handle config modal opening from trace context
  useEffect(() => {
    if (traceState.showConfigModal) {
      openRouteModal();
    }
  }, [traceState.showConfigModal, openRouteModal]);

  // Update map style based on mode
  useEffect(() => {
    if (!map.current) return;

    let style = "mapbox://styles/mapbox/streets-v12";

    switch (mapMode) {
      case "satellite":
        style = "mapbox://styles/mapbox/satellite-v9";
        break;
      case "traffic":
        style = "mapbox://styles/mapbox/navigation-day-v1";
        break;
      default:
        style = "mapbox://styles/mapbox/streets-v12";
    }

    map.current.setStyle(style);
  }, [mapMode]);

  // Function to trace route between stops
  const traceRouteOnMap = useCallback(
    async (stops: Array<{ coordinates: [number, number] }>) => {
      if (!map.current || stops.length < 2) return;

      setIsTracingRoute(true);

      try {
        // Convert stops to coordinates string for Mapbox Directions API
        const coordinates = stops
          .map((stop) => `${stop.coordinates[0]},${stop.coordinates[1]}`)
          .join(";");

        // Call Mapbox Directions API
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Remove existing route if any
          if (map.current.getSource("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
          }

          // Add route to map
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

          console.log("Rota traçada com sucesso:", {
            distance: route.distance,
            duration: route.duration,
            stops: stops.length,
          });

          // Marcar rota como traçada no contexto
          setRouteTraced(true);
        }
      } catch (error) {
        console.error("Erro ao traçar rota:", error);
      } finally {
        setIsTracingRoute(false);
      }
    },
    [setRouteTraced],
  );

  // Update POI markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add filtered POI markers
    filteredPOIs.forEach((poi) => {
      const el = document.createElement("div");
      el.className = `w-8 h-8 ${poi.color} rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform duration-200`;
      el.innerHTML =
        '<div class="w-full h-full rounded-full bg-white/20 flex items-center justify-center"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>';

      el.addEventListener("click", () => {
        setSelectedPOI(poi);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(poi.coordinates)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [filteredPOIs]);

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
      alert('Geolocalização não é suportada por este navegador.');
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
            duration: 2000
          });

          // Atualiza o marcador de localização atual
          const currentLocationEl = document.createElement("div");
          currentLocationEl.className =
            "w-4 h-4 bg-blue-600 rounded-full shadow-lg border-2 border-white";
          currentLocationEl.innerHTML =
            '<div class="w-full h-full rounded-full bg-blue-400 animate-pulse"></div>';

          // Remove marcador anterior se existir
          const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
          existingMarkers.forEach(marker => {
            const markerEl = marker.querySelector('.w-4.h-4.bg-blue-600');
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
        let errorMessage = 'Erro ao obter localização: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permissão negada pelo usuário.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Localização indisponível.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Tempo esgotado para obter localização.';
            break;
          default:
            errorMessage += 'Erro desconhecido.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);


  // Enhanced search with business name recognition and robust error handling
  const searchBusinesses = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Enhanced context recognition for better establishment search
      let businessQuery = query;
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('ilha plaza') || lowerQuery.includes('ilha shopping')) {
        businessQuery = 'Ilha Plaza Shopping São Paulo';
      } else if (lowerQuery.includes('quiosque zero oito') || lowerQuery.includes('quiosque 08')) {
        businessQuery = `Quiosque 08 loja comércio São Paulo`;
      } else if (lowerQuery.includes('escola municipal alvaro moreira')) {
        businessQuery = 'Escola Municipal Alvaro Moreira São Paulo';
      } else if (lowerQuery.includes('shopping') && !lowerQuery.includes('center')) {
        businessQuery = `${query} shopping center`;
      } else if (lowerQuery.includes('escola') && !lowerQuery.includes('municipal')) {
        businessQuery = `${query} escola`;
      } else if (lowerQuery.includes('quiosque')) {
        businessQuery = `${query} comercio loja estabelecimento`;
      }

      let allFeatures: any[] = [];

      // Strategy 1: Direct POI search with error handling and timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const poiResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxgl.accessToken}&country=BR&language=pt&limit=10&types=poi`,
          {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          }
        );

        clearTimeout(timeoutId);

        if (poiResponse.ok) {
          const poiData = await poiResponse.json();
          if (poiData.features) {
            allFeatures = [...poiData.features];
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('POI search timed out');
        } else {
          console.warn('POI search failed, continuing with other strategies:', error);
        }
      }

      // Strategy 2: Enhanced business search (only if we need more results)
      if (allFeatures.length < 3 && businessQuery !== query) {
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 8000);

          const enhancedResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              businessQuery
            )}.json?access_token=${mapboxgl.accessToken}&country=BR&language=pt&limit=8&types=poi,place,region,district,postcode,locality,neighborhood`,
            {
              signal: controller2.signal,
              headers: { 'Accept': 'application/json' }
            }
          );

          clearTimeout(timeoutId2);

          if (enhancedResponse.ok) {
            const enhancedData = await enhancedResponse.json();
            if (enhancedData.features) {
              enhancedData.features.forEach((feature: any) => {
                if (!allFeatures.find(f =>
                  f.text === feature.text ||
                  (Math.abs(f.center[0] - feature.center[0]) < 0.001 &&
                   Math.abs(f.center[1] - feature.center[1]) < 0.001)
                )) {
                  allFeatures.push(feature);
                }
              });
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Enhanced search timed out');
          } else {
            console.warn('Enhanced search failed:', error);
          }
        }
      }

      // Strategy 3: General search as fallback (only if we still need results)
      if (allFeatures.length < 2) {
        try {
          const controller3 = new AbortController();
          const timeoutId3 = setTimeout(() => controller3.abort(), 8000);

          const generalResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              query
            )}.json?access_token=${mapboxgl.accessToken}&country=BR&language=pt&limit=8&types=place,address,region,district,postcode,locality,neighborhood`,
            {
              signal: controller3.signal,
              headers: { 'Accept': 'application/json' }
            }
          );

          clearTimeout(timeoutId3);

          if (generalResponse.ok) {
            const generalData = await generalResponse.json();
            if (generalData.features) {
              const remainingSlots = 5 - allFeatures.length;
              generalData.features.slice(0, remainingSlots).forEach((feature: any) => {
                if (!allFeatures.find(f =>
                  f.text === feature.text ||
                  (Math.abs(f.center[0] - feature.center[0]) < 0.001 &&
                   Math.abs(f.center[1] - feature.center[1]) < 0.001)
                )) {
                  allFeatures.push(feature);
                }
              });
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('General search timed out');
          } else {
            console.warn('General search failed:', error);
          }
        }
      }

      if (allFeatures.length > 0) {
        const results: SearchResult[] = allFeatures.slice(0, 5).map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          text: feature.text,
          center: feature.center,
          place_type: feature.place_type,
          properties: feature.properties || {},
        }));

        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Erro geral na busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchBusinesses(query);
    }, 300);
  }, [searchBusinesses]);

  // Navigate to selected search result
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    if (map.current) {
      map.current.flyTo({
        center: result.center,
        zoom: 16,
        duration: 2000
      });

      // Add a marker for the selected place
      const el = document.createElement('div');
      el.className = 'w-8 h-8 bg-red-500 rounded-full shadow-lg border-2 border-white cursor-pointer flex items-center justify-center';
      el.innerHTML = '<svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

      // Remove existing search marker
      const existingSearchMarkers = document.querySelectorAll('.search-marker');
      existingSearchMarkers.forEach(marker => marker.remove());

      const marker = new mapboxgl.Marker(el)
        .setLngLat(result.center)
        .addTo(map.current);

      // Add class for easy removal
      el.classList.add('search-marker');

      // Create a temporary POI object to show details
      setSelectedPOI({
        id: result.id,
        name: result.text,
        type: result.place_type[0] || 'place',
        distance: '0 km',
        rating: null,
        coordinates: result.center,
        color: 'bg-red-500',
        fullAddress: result.place_name
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

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Clear search timeout on unmount and add comprehensive error filtering
  useEffect(() => {
    // Store original console.error to restore later
    const originalConsoleError = console.error;

    // Override console.error temporarily to filter Mapbox AbortErrors
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('AbortError') &&
          (message.includes('signal is aborted') || message.includes('mapbox'))) {
        // Silently ignore Mapbox AbortErrors
        return;
      }
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // Add global error handler for network issues and filter out expected AbortErrors
    const handleGlobalError = (event: ErrorEvent) => {
      // Filter out AbortErrors from Mapbox (they're expected during normal tile loading)
      if (event.message.includes('AbortError') || event.message.includes('aborted without reason')) {
        event.preventDefault(); // Prevent the error from being logged to console
        return;
      }

      if (event.message.includes('Failed to fetch') || event.message.includes('NetworkError')) {
        console.warn('Network error detected, search may be affected:', event.message);
      }
    };

    // Handle unhandled promise rejections (including AbortErrors from async operations)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason &&
          (event.reason.name === 'AbortError' ||
           (event.reason.message && event.reason.message.includes('aborted')))) {
        event.preventDefault(); // Prevent the error from being logged
        return;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Restore original console.error
      console.error = originalConsoleError;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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
            placeholder="Buscar locais, endereços..."
          />
          <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
            {isSearching && (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            )}
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto"
                 onClick={(e) => e.stopPropagation()}>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      result.place_type.includes('poi')
                        ? 'bg-green-100'
                        : result.place_type.includes('place')
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}>
                      {result.place_type.includes('poi') ? (
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      ) : (
                        <MapPin className={`h-4 w-4 ${
                          result.place_type.includes('poi')
                            ? 'text-green-600'
                            : result.place_type.includes('place')
                            ? 'text-purple-600'
                            : 'text-blue-600'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
                          {result.text}
                        </p>
                        {result.place_type.includes('poi') && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Estabelecimento
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {result.place_name}
                      </p>
                      {result.properties.category && (
                        <p className="text-xs text-gray-400 capitalize">
                          {result.properties.category.replace(/[_,]/g, ' ')}
                        </p>
                      )}
                      {!result.properties.category && result.place_type.length > 0 && (
                        <p className="text-xs text-gray-400 capitalize">
                          {result.place_type[0].replace('_', ' ')}
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

        {/* Trace Confirmation Dialog */}
        {traceState.showConfirmDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Deseja Traçar Esta Rota?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Consome {traceState.estimatedCredits} Créditos
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Você tem {traceState.stops.length} parada(s) marcada(s). Esta
                  ação irá traçar a rota completa no mapa.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    cancelTrace();
                    clearAllMarkersAndRoutes();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Desistir
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
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isTracingRoute ? "Traçando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POI Details Modal */}
        {selectedPOI && (
          <div className="absolute inset-x-4 bottom-4 bg-white rounded-2xl shadow-xl p-4 z-30 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPOI.name}
                </h3>
                <div className="space-y-1 mt-1">
                  {selectedPOI.fullAddress && (
                    <p className="text-sm text-gray-600">
                      {selectedPOI.fullAddress}
                    </p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {selectedPOI.distance}
                    </span>
                    {selectedPOI.rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">
                          {selectedPOI.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPOI(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                <MoveRight className="h-4 w-4" />
                <span>Ir para lá</span>
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
                <BookmarkPlus className="h-4 w-4" />
                <span>Mais tarde</span>
              </button>
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
        onSave={() => {
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
