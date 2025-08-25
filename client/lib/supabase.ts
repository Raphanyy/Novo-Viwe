import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase para o frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação mais flexível
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas');
}

// Cliente público do Supabase para o frontend
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Tipos para TypeScript
export type { User, Session } from '@supabase/supabase-js';

// Utility functions para autenticação
export const auth = {
  // Login com email/senha
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // Registro
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });
  },

  // Logout
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Obter sessão atual
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Utility functions para operações de dados
export const db = {
  // Obter dados de uma tabela
  from: (table: string) => supabase.from(table),

  // Executar RPC (stored procedures)
  rpc: (fn: string, args?: Record<string, any>) => supabase.rpc(fn, args),

  // Storage
  storage: supabase.storage
};

// Helper para obter token de acesso atual (para chamadas ao Express)
export const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Helper para fazer chamadas autenticadas ao Express
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};
