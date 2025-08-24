/**
 * Sistema centralizado de tratamento de erros
 * Gerencia AbortErrors, erros de rede e outros erros comuns
 */

// Tipos para categorização de erros
export enum ErrorType {
  ABORT = "ABORT",
  NETWORK = "NETWORK",
  MAPBOX_API = "MAPBOX_API",
  TIMEOUT = "TIMEOUT",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN",
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: Error;
  shouldLog: boolean;
  shouldNotifyUser: boolean;
  userMessage?: string;
}

/**
 * Analisa um erro e retorna informações estruturadas
 */
export function analyzeError(error: unknown): ErrorInfo {
  // AbortError - geralmente esperado durante cleanup
  if (error instanceof Error && error.name === "AbortError") {
    return {
      type: ErrorType.ABORT,
      message: error.message,
      originalError: error,
      shouldLog: false, // AbortErrors são esperados
      shouldNotifyUser: false,
    };
  }

  // TypeError - geralmente erro de rede
  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return {
      type: ErrorType.NETWORK,
      message: "Erro de conectividade de rede",
      originalError: error,
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: "Verifique sua conexão com a internet e tente novamente.",
    };
  }

  // Timeout customizado
  if (
    error instanceof Error &&
    error.message.toLowerCase().includes("timeout")
  ) {
    return {
      type: ErrorType.TIMEOUT,
      message: "Operação expirou por timeout",
      originalError: error,
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: "A operação demorou muito para responder. Tente novamente.",
    };
  }

  // Erro de validação
  if (error instanceof Error && error.message.includes("validation")) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      originalError: error,
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: "Dados inválidos fornecidos.",
    };
  }

  // Erro genérico
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: "Ocorreu um erro inesperado. Tente novamente.",
    };
  }

  // Erro não é uma instância de Error
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    shouldLog: true,
    shouldNotifyUser: true,
    userMessage: "Ocorreu um erro inesperado. Tente novamente.",
  };
}

/**
 * Logger centralizado que filtra AbortErrors desnecessários
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;

  private constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Loga um erro de forma inteligente baseado no tipo
   */
  public logError(error: unknown, context?: string): ErrorInfo {
    const errorInfo = analyzeError(error);

    if (errorInfo.shouldLog) {
      const prefix = context ? `[${context}]` : "";

      if (errorInfo.type === ErrorType.NETWORK) {
        this.originalConsoleWarn(`${prefix} Network error:`, errorInfo.message);
      } else if (errorInfo.type === ErrorType.TIMEOUT) {
        this.originalConsoleWarn(`${prefix} Timeout:`, errorInfo.message);
      } else {
        this.originalConsoleError(
          `${prefix} Error:`,
          errorInfo.message,
          errorInfo.originalError,
        );
      }
    }

    return errorInfo;
  }

  /**
   * Instala filtros globais para AbortErrors
   */
  public installGlobalFilters(): void {
    // Filtrar console.error para AbortErrors
    console.error = (...args: any[]) => {
      const message = args.join(" ");

      // Filtrar AbortErrors conhecidos do Mapbox
      if (
        message.includes("AbortError") &&
        (message.includes("signal is aborted") ||
          message.includes("mapbox") ||
          message.includes("aborted without reason") ||
          message.includes("operation was aborted"))
      ) {
        return; // Silenciar
      }

      this.originalConsoleError.apply(console, args);
    };

    // Handler global para erros não capturados
    window.addEventListener("error", (event: ErrorEvent) => {
      const errorInfo = this.logError(event.error, "Global");

      // Prevenir que AbortErrors sejam exibidos no console
      if (errorInfo.type === ErrorType.ABORT) {
        event.preventDefault();
      }
    });

    // Handler global para promises rejeitadas
    window.addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        const errorInfo = this.logError(event.reason, "Unhandled Promise");

        // Prevenir que AbortErrors sejam exibidos no console
        if (errorInfo.type === ErrorType.ABORT) {
          event.preventDefault();
        }
      },
    );
  }

  /**
   * Remove filtros globais
   */
  public removeGlobalFilters(): void {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }
}

/**
 * Utilitário para fetch com tratamento robusto de erros
 */
export interface FetchWithErrorHandlingOptions {
  timeout?: number;
  context?: string;
  retries?: number;
  retryDelay?: number;
}

export async function fetchWithErrorHandling(
  url: string,
  init?: RequestInit,
  options: FetchWithErrorHandlingOptions = {},
): Promise<Response> {
  const {
    timeout = 10000,
    context = "Fetch",
    retries = 0,
    retryDelay = 1000,
  } = options;

  const logger = ErrorLogger.getInstance();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Combinar signals se um já foi fornecido
      const signal = init?.signal
        ? AbortSignal.any([init.signal, controller.signal])
        : controller.signal;

      const response = await fetch(url, {
        ...init,
        signal,
        headers: {
          Accept: "application/json",
          ...init?.headers,
        },
      });

      clearTimeout(timeoutId);

      // Verificar se a resposta é válida
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded: ${response.statusText}`);
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${response.statusText}`);
        } else {
          throw new Error(
            `HTTP error ${response.status}: ${response.statusText}`,
          );
        }
      }

      return response;
    } catch (error) {
      const errorInfo = logger.logError(error, context);

      // Se é o último attempt ou é um AbortError, relançar
      if (attempt === retries || errorInfo.type === ErrorType.ABORT) {
        throw error;
      }

      // Se é um erro de rede e ainda temos tentativas, tentar novamente
      if (
        errorInfo.type === ErrorType.NETWORK ||
        errorInfo.type === ErrorType.TIMEOUT
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1)),
        );
        continue;
      }

      // Para outros tipos de erro, falhar imediatamente
      throw error;
    }
  }

  throw new Error("Máximo de tentativas excedido");
}

/**
 * Hook para tratamento de erros em componentes React
 */
export function useErrorHandler() {
  const logger = ErrorLogger.getInstance();

  const handleError = (error: unknown, context?: string): ErrorInfo => {
    return logger.logError(error, context);
  };

  const handleAsyncError = async (
    asyncFn: () => Promise<any>,
    context?: string,
  ): Promise<{ success: boolean; error?: ErrorInfo; data?: any }> => {
    try {
      const data = await asyncFn();
      return { success: true, data };
    } catch (error) {
      const errorInfo = handleError(error, context);
      return { success: false, error: errorInfo };
    }
  };

  return { handleError, handleAsyncError };
}

// Instalar filtros globais automaticamente
export const errorLogger = ErrorLogger.getInstance();
errorLogger.installGlobalFilters();

// Cleanup na saída da página
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    errorLogger.removeGlobalFilters();
  });
}
