import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';

// Interface compatível com o sistema anterior (demo)
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateAvatar: (avatarUrl: string) => void;
  isLoading: boolean;
  // Novos campos do Supabase
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  register: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Converter usuário do Supabase para interface compatível
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || 
            supabaseUser.email?.split('@')[0] || 
            'Usuário',
      email: supabaseUser.email || '',
      avatar: supabaseUser.user_metadata?.avatar_url || 
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.email}`
    };
  };

  useEffect(() => {
    // Verificar se Supabase está configurado
    if (!supabase) {
      console.warn('Supabase não configurado - usando modo offline');
      setLoading(false);
      return;
    }

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { session, error } = await auth.getCurrentSession();
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        } else {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
          
          if (session?.user) {
            setUser(convertSupabaseUser(session.user));
          }
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          setUser(convertSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return false;
    }

    setLoading(true);
    try {
      const result = await auth.signIn(email, password);
      if (result.error) {
        console.error('Erro no login:', result.error.message);
        return false;
      }
      
      // O estado será atualizado automaticamente pelo listener
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return false;
    }

    setLoading(true);
    try {
      const result = await auth.signUp(email, password);
      if (result.error) {
        console.error('Erro no registro:', result.error.message);
        return false;
      }
      
      // O estado será atualizado automaticamente pelo listener
      return true;
    } catch (error: any) {
      console.error('Erro no registro:', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase) {
      // Modo offline - limpar estado local
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      localStorage.removeItem("viwe_user");
      return;
    }

    setLoading(true);
    try {
      const { error } = await auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
      
      // Limpar dados locais também
      localStorage.removeItem("viwe_user");
    } catch (error: any) {
      console.error('Erro no logout:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!supabase || !supabaseUser) {
      // Modo offline - atualizar apenas localmente
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem("viwe_user", JSON.stringify(updatedUser));
      }
      return;
    }

    try {
      // Atualizar metadados do usuário no Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          avatar_url: userData.avatar
        }
      });

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        return;
      }

      // O estado será atualizado automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    await updateUser({ avatar: avatarUrl });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    updateAvatar,
    isLoading: loading,
    // Novos campos Supabase
    supabaseUser,
    session,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook adicional para verificar se o usuário está autenticado
export const useAuthCheck = () => {
  const { user, isLoading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    user
  };
};
