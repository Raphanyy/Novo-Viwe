/**
 * Gerenciador de recursos para prevenir memory leaks
 * Centraliza cleanup de timeouts, intervals, listeners e outros recursos
 */

// Tipos para diferentes tipos de recursos
export enum ResourceType {
  TIMEOUT = "TIMEOUT",
  INTERVAL = "INTERVAL",
  EVENT_LISTENER = "EVENT_LISTENER",
  ABORT_CONTROLLER = "ABORT_CONTROLLER",
  MAPBOX_MAP = "MAPBOX_MAP",
  CUSTOM = "CUSTOM",
}

export interface Resource {
  id: string;
  type: ResourceType;
  cleanup: () => void;
  metadata?: any;
}

/**
 * Classe para gerenciar recursos de um componente ou contexto
 */
export class ResourceManager {
  private resources: Map<string, Resource> = new Map();
  private isDestroyed = false;

  /**
   * Adiciona um timeout para gerenciamento
   */
  addTimeout(id: string, timeoutId: NodeJS.Timeout): void {
    this.addResource({
      id,
      type: ResourceType.TIMEOUT,
      cleanup: () => clearTimeout(timeoutId),
      metadata: { timeoutId },
    });
  }

  /**
   * Adiciona um interval para gerenciamento
   */
  addInterval(id: string, intervalId: NodeJS.Timeout): void {
    this.addResource({
      id,
      type: ResourceType.INTERVAL,
      cleanup: () => clearInterval(intervalId),
      metadata: { intervalId },
    });
  }

  /**
   * Adiciona um event listener para gerenciamento
   */
  addEventListener(
    id: string,
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    this.addResource({
      id,
      type: ResourceType.EVENT_LISTENER,
      cleanup: () => target.removeEventListener(event, listener, options),
      metadata: { target, event, listener, options },
    });
  }

  /**
   * Adiciona um AbortController para gerenciamento
   */
  addAbortController(id: string, controller: AbortController): void {
    this.addResource({
      id,
      type: ResourceType.ABORT_CONTROLLER,
      cleanup: () => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      },
      metadata: { controller },
    });
  }

  /**
   * Adiciona um mapa Mapbox para gerenciamento
   */
  addMapboxMap(id: string, map: any): void {
    this.addResource({
      id,
      type: ResourceType.MAPBOX_MAP,
      cleanup: () => {
        try {
          if (map && typeof map.remove === "function") {
            map.stop(); // Para operações pendentes
            map.remove(); // Remove o mapa
          }
        } catch (error) {
          // Silenciar erros de cleanup do Mapbox
          console.debug("Mapbox cleanup warning:", error);
        }
      },
      metadata: { map },
    });
  }

  /**
   * Adiciona um recurso customizado
   */
  addCustomResource(id: string, cleanup: () => void, metadata?: any): void {
    this.addResource({
      id,
      type: ResourceType.CUSTOM,
      cleanup,
      metadata,
    });
  }

  /**
   * Adiciona um recurso genérico
   */
  private addResource(resource: Resource): void {
    if (this.isDestroyed) {
      console.warn(
        `Tentativa de adicionar recurso ${resource.id} após destruição do ResourceManager`,
      );
      resource.cleanup(); // Cleanup imediato se já foi destruído
      return;
    }

    // Se já existe um recurso com esse ID, limpar o anterior
    const existing = this.resources.get(resource.id);
    if (existing) {
      this.cleanupResource(existing);
    }

    this.resources.set(resource.id, resource);
  }

  /**
   * Remove e limpa um recurso específico
   */
  removeResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (resource) {
      this.cleanupResource(resource);
      this.resources.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Limpa um recurso específico
   */
  private cleanupResource(resource: Resource): void {
    try {
      resource.cleanup();
    } catch (error) {
      console.warn(`Erro ao limpar recurso ${resource.id}:`, error);
    }
  }

  /**
   * Verifica se tem recursos de um tipo específico
   */
  hasResourcesOfType(type: ResourceType): boolean {
    return Array.from(this.resources.values()).some((r) => r.type === type);
  }

  /**
   * Obtém todos os recursos de um tipo específico
   */
  getResourcesOfType(type: ResourceType): Resource[] {
    return Array.from(this.resources.values()).filter((r) => r.type === type);
  }

  /**
   * Limpa todos os recursos de um tipo específico
   */
  cleanupResourcesOfType(type: ResourceType): void {
    const resources = this.getResourcesOfType(type);
    resources.forEach((resource) => {
      this.cleanupResource(resource);
      this.resources.delete(resource.id);
    });
  }

  /**
   * Obtém estatísticas dos recursos
   */
  getStats(): Record<ResourceType, number> {
    const stats = Object.values(ResourceType).reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<ResourceType, number>,
    );

    this.resources.forEach((resource) => {
      stats[resource.type]++;
    });

    return stats;
  }

  /**
   * Destrói o resource manager e limpa todos os recursos
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    // Limpar todos os recursos
    this.resources.forEach((resource) => {
      this.cleanupResource(resource);
    });

    this.resources.clear();
  }

  /**
   * Verifica se o resource manager foi destruído
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * Obtém o número total de recursos
   */
  get size(): number {
    return this.resources.size;
  }
}

/**
 * Fábrica para criar hook useResourceManager em componentes React
 * Use esta função em componentes onde você tem acesso ao React
 */
export function createResourceManagerHook(React: any) {
  return function useResourceManager(): ResourceManager {
    const managerRef = React.useRef<ResourceManager>();

    if (!managerRef.current) {
      managerRef.current = new ResourceManager();
    }

    React.useEffect(() => {
      const manager = managerRef.current!;

      return () => {
        manager.destroy();
      };
    }, []);

    return managerRef.current;
  };
}

/**
 * Utilitário para criar timeouts gerenciados
 */
export function createManagedTimeout(
  manager: ResourceManager,
  id: string,
  callback: () => void,
  delay: number,
): void {
  const timeoutId = setTimeout(() => {
    callback();
    manager.removeResource(id); // Auto-remove após execução
  }, delay);

  manager.addTimeout(id, timeoutId);
}

/**
 * Utilitário para criar intervals gerenciados
 */
export function createManagedInterval(
  manager: ResourceManager,
  id: string,
  callback: () => void,
  interval: number,
): void {
  const intervalId = setInterval(callback, interval);
  manager.addInterval(id, intervalId);
}

/**
 * Utilitário para criar AbortController gerenciado
 */
export function createManagedAbortController(
  manager: ResourceManager,
  id: string,
): AbortController {
  const controller = new AbortController();
  manager.addAbortController(id, controller);
  return controller;
}

/**
 * Utilitário para fetch com AbortController gerenciado
 */
export async function managedFetch(
  manager: ResourceManager,
  id: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = createManagedAbortController(manager, id);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    // Remove o controller após sucesso
    manager.removeResource(id);
    return response;
  } catch (error) {
    // Remove o controller após erro (exceto se foi abortado pelo manager)
    if (!controller.signal.aborted) {
      manager.removeResource(id);
    }
    throw error;
  }
}

// Exportar para uso em componentes React
export { ResourceManager as default };
