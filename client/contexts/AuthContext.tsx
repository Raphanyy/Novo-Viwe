import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  planType: "basic" | "premium" | "interactive";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "viwe_access_token",
  REFRESH_TOKEN: "viwe_refresh_token",
  USER: "viwe_user",
};

// API base URL
const API_BASE = "/api";

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se usuário está autenticado
  const isAuthenticated = !!user;

  // Salvar tokens no localStorage
  const saveTokens = (tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  };

  // Obter access token
  const getAccessToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  };

  // Obter refresh token
  const getRefreshToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  };

  // Limpar dados de autenticação
  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  // Fazer requisição autenticada
  const apiRequest = async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const token = getAccessToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Se token expirou, tentar renovar
    if (response.status === 401 && token) {
      const refreshed = await refreshTokenInternal();
      if (refreshed) {
        // Tentar novamente com token renovado
        const newToken = getAccessToken();
        headers.Authorization = `Bearer ${newToken}`;

        return fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        // Token refresh falhou, fazer logout
        clearAuth();
      }
    }

    return response;
  };

  // Renovar token internamente
  const refreshTokenInternal = async (): Promise<boolean> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        saveTokens(data.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      return false;
    }
  };

  // Login
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log("🔑 Tentando fazer login com:", credentials.email);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("📥 Resposta do servidor:", data);

      if (response.ok) {
        // Salvar tokens
        saveTokens(data.tokens);
        console.log("💾 Tokens salvos no localStorage");

        // Salvar usuário
        console.log("👤 Dados do usuário recebidos:", data.user);
        setUser(data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

        return { success: true };
      } else {
        console.error("❌ Erro no login:", data.error);
        return { success: false, error: data.error || "Erro no login" };
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return { success: false, error: "Erro de conexão" };
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const register = async (
    data: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Salvar tokens
        saveTokens(responseData.tokens);

        // Salvar usuário
        setUser(responseData.user);
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(responseData.user),
        );

        return { success: true };
      } else {
        return {
          success: false,
          error: responseData.error || "Erro no registro",
        };
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: "Erro de conexão" };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      // Tentar fazer logout no servidor
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro no logout do servidor:", error);
    } finally {
      clearAuth();
    }
  };

  // Renovar token (função pública)
  const refreshToken = async (): Promise<boolean> => {
    return refreshTokenInternal();
  };

  // Verificar usuário atual
  const checkCurrentUser = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dados reais do usuário carregados:", data.user);
        setUser(data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      } else {
        console.log("❌ Falha ao carregar dados do usuário, fazendo logout");
        clearAuth();
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // Effect para verificar usuário na inicialização
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const token = getAccessToken();

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Verificar se token ainda é válido
        checkCurrentUser();
      } catch (error) {
        clearAuth();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Effect para auto-refresh do token
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      () => {
        refreshTokenInternal();
      },
      10 * 60 * 1000,
    ); // 10 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Hook para requisições autenticadas
export const useApiRequest = () => {
  const { logout } = useAuth();

  return async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Se não autorizado, fazer logout
    if (response.status === 401) {
      logout();
    }

    return response;
  };
};
