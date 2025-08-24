/**
 * Utilitários para otimização de performance
 * Throttling, debouncing, memoização e outras otimizações
 */

import { useCallback, useRef, useMemo, useState, useEffect } from 'react';

/**
 * Hook para throttling de funções com controle de tempo
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastExecRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T>>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    lastArgsRef.current = args;

    if (now - lastExecRef.current >= delay) {
      // Se passou tempo suficiente, executar imediatamente
      lastExecRef.current = now;
      return func(...args);
    } else {
      // Se não passou tempo suficiente, agendar execução
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastExecRef.current = Date.now();
        if (lastArgsRef.current) {
          func(...lastArgsRef.current);
        }
      }, delay - (now - lastExecRef.current));
    }
  }, [func, delay]) as T;
}

/**
 * Hook para debouncing de funções
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]) as T;
}

/**
 * Hook para memoização de valores baseado em dependências específicas
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  compareFn?: (prev: React.DependencyList, current: React.DependencyList) => boolean
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  return useMemo(() => {
    if (!ref.current) {
      ref.current = { deps, value: factory() };
      return ref.current.value;
    }

    const hasChanged = compareFn 
      ? !compareFn(ref.current.deps, deps)
      : !areArraysEqual(ref.current.deps, deps);

    if (hasChanged) {
      ref.current = { deps, value: factory() };
    }

    return ref.current.value;
  }, deps);
}

/**
 * Compara arrays de dependências
 */
function areArraysEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * Hook para throttling de coordenadas com tolerância de movimento
 */
export function useCoordinateThrottle(
  callback: (coords: [number, number]) => void,
  delay: number = 100,
  tolerance: number = 0.0001
) {
  const lastCoordsRef = useRef<[number, number] | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const throttledCallback = useCallback((coords: [number, number]) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // Verificar se tempo suficiente passou
    if (timeSinceLastUpdate < delay) return;

    // Verificar se movimento é significativo
    const lastCoords = lastCoordsRef.current;
    if (lastCoords) {
      const deltaLng = Math.abs(coords[0] - lastCoords[0]);
      const deltaLat = Math.abs(coords[1] - lastCoords[1]);

      if (deltaLng < tolerance && deltaLat < tolerance) {
        return; // Movimento muito pequeno, ignorar
      }
    }

    lastUpdateRef.current = now;
    lastCoordsRef.current = coords;
    callback(coords);
  }, [callback, delay, tolerance]);

  return throttledCallback;
}

/**
 * Hook para memoização de cálculos pesados de distância
 */
export function useDistanceCalculation() {
  const cache = useRef<Map<string, number>>(new Map());

  const calculateDistance = useCallback((
    point1: [number, number],
    point2: [number, number]
  ): number => {
    // Criar chave única para o cache
    const key = `${point1[0].toFixed(6)},${point1[1].toFixed(6)}-${point2[0].toFixed(6)},${point2[1].toFixed(6)}`;
    
    // Verificar cache
    if (cache.current.has(key)) {
      return cache.current.get(key)!;
    }

    // Calcular distância usando fórmula de Haversine
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    const R = 6371000; // Raio da Terra em metros
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Cachear resultado
    cache.current.set(key, distance);
    
    // Limitar tamanho do cache
    if (cache.current.size > 1000) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }

    return distance;
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { calculateDistance, clearCache };
}

/**
 * Converter graus para radianos
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Hook para otimização de renderização de listas grandes
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange
  };
}

/**
 * Hook para memoização de filtros de busca
 */
export function useSearchFilter<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Filtrar itens com memoização
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const lowercaseSearch = debouncedSearchTerm.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowercaseSearch);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowercaseSearch);
        }
        return false;
      });
    });
  }, [items, debouncedSearchTerm, searchFields]);

  return filteredItems;
}

/**
 * Hook para otimização de callbacks com dependências estáveis
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef<React.DependencyList>(deps);

  // Atualizar callback apenas se as dependências mudaram
  if (!areArraysEqual(depsRef.current, deps)) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Hook para otimização de re-renders com shallow comparison
 */
export function useShallowMemo<T extends Record<string, any>>(obj: T): T {
  const cache = useRef<{ obj: T; result: T }>();

  return useMemo(() => {
    if (!cache.current) {
      cache.current = { obj, result: obj };
      return obj;
    }

    // Shallow comparison
    const prevObj = cache.current.obj;
    const keys = Object.keys(obj);
    const prevKeys = Object.keys(prevObj);

    if (keys.length !== prevKeys.length) {
      cache.current = { obj, result: obj };
      return obj;
    }

    for (const key of keys) {
      if (obj[key] !== prevObj[key]) {
        cache.current = { obj, result: obj };
        return obj;
      }
    }

    return cache.current.result;
  }, [obj]);
}

/**
 * Hook para lazy loading de dados
 */
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, deps);

  return { data, loading, error, load };
}
