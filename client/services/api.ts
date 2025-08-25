import React from "react";
import { ApiResponse } from "@shared/api";

// Base URL da API
const API_BASE = window.location.origin;

// Tipos para as APIs
export interface RouteData {
  id: number;
  name: string;
  stopCount: number;
  createdAt: string;
  scheduledDate?: string;
  status: "active" | "scheduled" | "draft";
  description?: string;
  estimatedDuration: string;
  totalDistance: string;
  isFavorite: boolean;
  linkedSet?: string;
  lastModified: string;
}

export interface NotificationData {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserStats {
  totalRoutes: number;
  totalDistance: string;
  timeSaved: string;
  fuelSaved: string;
}

export interface DashboardData {
  recentRoutes: RouteData[];
  stats: UserStats;
  notifications: NotificationData[];
}

// Utilitário para fazer requests com tratamento de erro
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("authToken");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado - fazer logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }

    const errorData = await response
      .json()
      .catch(() => ({ error: "Erro de conexão" }));
    throw new Error(errorData.error || `Erro ${response.status}`);
  }

  return response.json();
}

// API Services
export const routesService = {
  // Listar todas as rotas do usuário
  async getRoutes(): Promise<RouteData[]> {
    return apiRequest<RouteData[]>("/api/routes");
  },

  // Criar nova rota
  async createRoute(routeData: Partial<RouteData>): Promise<RouteData> {
    return apiRequest<RouteData>("/api/routes", {
      method: "POST",
      body: JSON.stringify(routeData),
    });
  },

  // Atualizar rota existente
  async updateRoute(
    id: number,
    routeData: Partial<RouteData>,
  ): Promise<RouteData> {
    return apiRequest<RouteData>(`/api/routes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(routeData),
    });
  },

  // Deletar rota
  async deleteRoute(id: number): Promise<void> {
    return apiRequest<void>(`/api/routes/${id}`, {
      method: "DELETE",
    });
  },

  // Obter estatísticas das rotas
  async getRouteStats(): Promise<any> {
    return apiRequest<any>("/api/routes/stats");
  },
};

export const dashboardService = {
  // Dados do dashboard principal
  async getDashboardData(): Promise<DashboardData> {
    const [routes, stats] = await Promise.all([
      apiRequest<RouteData[]>("/api/dashboard/recent-routes"),
      apiRequest<UserStats>("/api/dashboard/stats"),
    ]);

    return {
      recentRoutes: routes,
      stats,
      notifications: [], // Por enquanto vazio, implementar depois
    };
  },

  // Estatísticas de consumo
  async getConsumptionStats(): Promise<any> {
    return apiRequest<any>("/api/dashboard/consumption");
  },

  // Atividade recente
  async getActivity(): Promise<any> {
    return apiRequest<any>("/api/dashboard/activity");
  },

  // Insights e análises
  async getInsights(): Promise<any> {
    return apiRequest<any>("/api/dashboard/insights");
  },
};

export const notificationsService = {
  // Listar notificações
  async getNotifications(): Promise<NotificationData[]> {
    return apiRequest<NotificationData[]>("/api/notifications");
  },

  // Marcar como lida
  async markAsRead(id: string): Promise<void> {
    return apiRequest<void>(`/api/notifications/${id}/read`, {
      method: "POST",
    });
  },

  // Marcar todas como lidas
  async markAllAsRead(): Promise<void> {
    return apiRequest<void>("/api/notifications/mark-all-read", {
      method: "POST",
    });
  },

  // Deletar notificação
  async deleteNotification(id: string): Promise<void> {
    return apiRequest<void>(`/api/notifications/${id}`, {
      method: "DELETE",
    });
  },

  // Estatísticas das notificações
  async getNotificationStats(): Promise<any> {
    return apiRequest<any>("/api/notifications/stats");
  },
};

export const userService = {
  // Obter dados do usuário atual
  async getCurrentUser(): Promise<any> {
    return apiRequest<any>("/api/auth/me");
  },

  // Atualizar perfil
  async updateProfile(userData: any): Promise<any> {
    return apiRequest<any>("/api/user", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  },

  // Obter estatísticas do usuário
  async getUserStats(): Promise<UserStats> {
    return apiRequest<UserStats>("/api/user/stats");
  },

  // Atualizar preferências
  async updatePreferences(preferences: any): Promise<any> {
    return apiRequest<any>("/api/user/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    });
  },
};

export const authService = {
  // Login
  async login(email: string, password: string): Promise<any> {
    const response = await apiRequest<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Salvar token no localStorage
    if (response.tokens?.accessToken) {
      localStorage.setItem("authToken", response.tokens.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiRequest<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      // Limpar dados locais mesmo se a API falhar
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  },

  // Obter usuário atual do localStorage
  getCurrentUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// Hook para loading states com retry
export const useLoading = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);

      // Log error for debugging
      console.error("API Error:", {
        error: errorMessage,
        retryCount,
        timestamp: new Date().toISOString(),
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  const retry = (apiCall: () => Promise<any>) => {
    setRetryCount((prev) => prev + 1);
    return execute(apiCall);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
  };

  return { loading, error, execute, retry, reset, retryCount };
};

export default {
  routes: routesService,
  dashboard: dashboardService,
  notifications: notificationsService,
  user: userService,
  auth: authService,
};
