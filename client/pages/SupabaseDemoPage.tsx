import React from "react";
import { AuthProvider as SupabaseAuthProvider } from "../contexts/SupabaseAuthContext";
import { SupabaseDemo } from "../components/SupabaseDemo";

const SupabaseDemoPage: React.FC = () => {
  return (
    <SupabaseAuthProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Demonstração Supabase Híbrido
            </h1>
            <p className="text-muted-foreground">
              Teste da integração completa entre Express + Supabase
            </p>
          </div>

          <SupabaseDemo />

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Como funciona:</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <strong>Frontend direto → Supabase:</strong> Para operações
                  simples de CRUD, autenticação e realtime
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <strong>Frontend → Express → Supabase:</strong> Para lógica de
                  negócio complexa, validações e operações administrativas
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <strong>Autenticação unificada:</strong> JWT tokens
                  compartilhados entre frontend e backend
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              Variáveis de Ambiente Necessárias:
            </h3>
            <div className="space-y-2 text-sm font-mono bg-muted p-3 rounded">
              <div># Frontend (.env)</div>
              <div>VITE_SUPABASE_URL=your_supabase_url</div>
              <div>VITE_SUPABASE_ANON_KEY=your_anon_key</div>
              <div className="mt-2"># Backend (.env)</div>
              <div>SUPABASE_URL=your_supabase_url</div>
              <div>SUPABASE_ANON_KEY=your_anon_key</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</div>
            </div>
          </div>
        </div>
      </div>
    </SupabaseAuthProvider>
  );
};

export default SupabaseDemoPage;
