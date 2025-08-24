import { useState, useCallback, useRef } from "react";
import { handleError, handleAsyncError, ErrorType, fetchWithErrorHandling } from "../lib/error-handling";
import { createMapboxApiUrl } from "../lib/mapbox-config";
import { ResourceManager } from "../lib/resource-manager";

export interface SearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
  properties: any;
}

export interface UseAddressSearchReturn {
  searchResults: SearchResult[];
  isSearching: boolean;
  showResults: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowResults: (show: boolean) => void;
  handleSearchChange: (query: string) => void;
  handleSelectResult: (result: SearchResult) => void;
  clearResults: () => void;
}

interface UseAddressSearchOptions {
  onSelectResult?: (result: SearchResult) => void;
  minQueryLength?: number;
  debounceMs?: number;
}

export const useAddressSearch = (options: UseAddressSearchOptions = {}): UseAddressSearchReturn => {
  const {
    onSelectResult,
    minQueryLength = 3,
    debounceMs = 300
  } = options;

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const resourceManagerRef = useRef(new ResourceManager());

  // Helper function to enhance query context
  const enhanceQuery = useCallback((originalQuery: string): string => {
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
  }, []);

  // Helper function to perform search
  const performSearch = useCallback(async (
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
  }, []);

  // Helper function to deduplicate features
  const deduplicateFeatures = useCallback((features: any[]): any[] => {
    const seen = new Set();
    return features.filter((feature) => {
      const key = `${feature.text}-${feature.center[0].toFixed(3)}-${feature.center[1].toFixed(3)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  // Main search function
  const searchBusinesses = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < minQueryLength) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);

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
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch (error) {
        const errorInfo = handleError(error, "SearchBusinesses");
        if (errorInfo.shouldNotifyUser && errorInfo.type !== ErrorType.ABORT) {
          console.warn("Erro na busca:", errorInfo.userMessage);
        }
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    },
    [enhanceQuery, performSearch, deduplicateFeatures, minQueryLength],
  );

  // Optimized debounced search with stable reference
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Remove previous search timeout if exists
      resourceManagerRef.current.removeResource("searchTimeout");

      // Create new debounced search
      const timeoutId = setTimeout(() => {
        searchBusinesses(query);
      }, debounceMs);

      // Register timeout for cleanup
      resourceManagerRef.current.addTimeout("searchTimeout", timeoutId);
    },
    [searchBusinesses, debounceMs],
  );

  // Handle result selection
  const handleSelectResult = useCallback((result: SearchResult) => {
    setSearchQuery(result.text);
    setShowResults(false);
    
    if (onSelectResult) {
      onSelectResult(result);
    }
  }, [onSelectResult]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setShowResults(false);
    setSearchQuery("");
  }, []);

  return {
    searchResults,
    isSearching,
    showResults,
    searchQuery,
    setSearchQuery,
    setShowResults,
    handleSearchChange,
    handleSelectResult,
    clearResults,
  };
};
