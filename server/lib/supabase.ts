import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase para uso no backend
// Este cliente usa a service role key para operações administrativas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

// Cliente administrativo - para uso apenas no backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente público - para operações que respeitam RLS
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Variável de ambiente SUPABASE_ANON_KEY é obrigatória');
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Função helper para criar cliente com token do usuário
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}
