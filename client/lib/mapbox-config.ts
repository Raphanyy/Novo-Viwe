/**
 * Configuração centralizada e segura para o Mapbox
 * Gerencia validação, configuração e disponibilidade do token
 */

import mapboxgl from "mapbox-gl";

// Tipos para configuração do Mapbox
export interface MapboxConfig {
  token: string | null;
  isValid: boolean;
  isAvailable: boolean;
  errorMessage: string | null;
}

// Classe singleton para gerenciar configuração do Mapbox
class MapboxConfigManager {
  private static instance: MapboxConfigManager;
  private config: MapboxConfig;
  private initialized: boolean = false;

  private constructor() {
    this.config = {
      token: null,
      isValid: false,
      isAvailable: false,
      errorMessage: null,
    };
  }

  public static getInstance(): MapboxConfigManager {
    if (!MapboxConfigManager.instance) {
      MapboxConfigManager.instance = new MapboxConfigManager();
    }
    return MapboxConfigManager.instance;
  }

  /**
   * Inicializa e valida a configuração do Mapbox
   */
  public initialize(): MapboxConfig {
    if (this.initialized) {
      return this.config;
    }

    try {
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

      if (!token) {
        this.config = {
          token: null,
          isValid: false,
          isAvailable: false,
          errorMessage: "Token do Mapbox não configurado. Configure VITE_MAPBOX_ACCESS_TOKEN no arquivo .env",
        };
      } else if (!this.isValidMapboxToken(token)) {
        this.config = {
          token: null,
          isValid: false,
          isAvailable: false,
          errorMessage: "Token do Mapbox inválido. Verifique o formato do token.",
        };
      } else {
        // Token válido - configurar globalmente
        mapboxgl.accessToken = token;
        this.config = {
          token,
          isValid: true,
          isAvailable: true,
          errorMessage: null,
        };
      }
    } catch (error) {
      this.config = {
        token: null,
        isValid: false,
        isAvailable: false,
        errorMessage: `Erro ao inicializar Mapbox: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }

    this.initialized = true;
    return this.config;
  }

  /**
   * Valida se um token Mapbox tem formato válido
   */
  private isValidMapboxToken(token: string): boolean {
    // Token Mapbox deve começar com 'pk.' e ter pelo menos 50 caracteres
    const tokenRegex = /^pk\.[a-zA-Z0-9_-]{40,}$/;
    return tokenRegex.test(token);
  }

  /**
   * Obtém a configuração atual do Mapbox
   */
  public getConfig(): MapboxConfig {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.config;
  }

  /**
   * Verifica se o Mapbox está disponível e configurado
   */
  public isMapboxAvailable(): boolean {
    return this.getConfig().isAvailable;
  }

  /**
   * Obtém o token do Mapbox (null se não disponível)
   */
  public getToken(): string | null {
    return this.getConfig().token;
  }

  /**
   * Obtém mensagem de erro se houver
   */
  public getErrorMessage(): string | null {
    return this.getConfig().errorMessage;
  }

  /**
   * Redefine a configuração (útil para testes)
   */
  public reset(): void {
    this.initialized = false;
    this.config = {
      token: null,
      isValid: false,
      isAvailable: false,
      errorMessage: null,
    };
  }

  /**
   * Testa conectividade com a API do Mapbox
   */
  public async testConnectivity(): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    
    if (!config.isAvailable || !config.token) {
      return { 
        success: false, 
        error: config.errorMessage || "Token não disponível" 
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${config.token}&limit=1`,
        { 
          signal: controller.signal,
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: "Token Mapbox inválido ou expirado" };
      } else if (response.status === 429) {
        return { success: false, error: "Limite de requisições do Mapbox excedido" };
      } else {
        return { success: false, error: `Erro da API Mapbox: ${response.status}` };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: "Timeout na conexão com Mapbox" };
      }
      return { 
        success: false, 
        error: `Erro de conectividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Cria uma URL da API Mapbox com o token
   */
  public createApiUrl(endpoint: string, params: Record<string, string> = {}): string | null {
    const config = this.getConfig();
    
    if (!config.isAvailable || !config.token) {
      return null;
    }

    const url = new URL(endpoint);
    url.searchParams.set('access_token', config.token);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }
}

// Export da instância singleton
export const mapboxConfig = MapboxConfigManager.getInstance();

// Funções de conveniência
export const isMapboxAvailable = () => mapboxConfig.isMapboxAvailable();
export const getMapboxToken = () => mapboxConfig.getToken();
export const getMapboxError = () => mapboxConfig.getErrorMessage();
export const createMapboxApiUrl = (endpoint: string, params?: Record<string, string>) => 
  mapboxConfig.createApiUrl(endpoint, params);

// Inicializar automaticamente
mapboxConfig.initialize();
