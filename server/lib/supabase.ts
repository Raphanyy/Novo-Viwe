import { createClient } from "@supabase/supabase-js";

// Configuração do cliente Supabase para uso no backend
// Este cliente usa a service role key para operações administrativas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificação mais flexível para permitir builds sem variáveis de ambiente
if (
  process.env.NODE_ENV !== "development" &&
  (!supabaseUrl || !supabaseServiceRoleKey)
) {
  console.warn(
    "Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas",
  );
}

// Cliente administrativo - para uso apenas no backend
export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Cliente público - para operações que respeitam RLS
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (process.env.NODE_ENV !== "development" && !supabaseAnonKey) {
  console.warn("Variável de ambiente SUPABASE_ANON_KEY não configurada");
}

export const supabasePublic =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Função helper para criar cliente com token do usuário
export function createUserClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configurações do Supabase não disponíveis");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
