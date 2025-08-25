import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

interface SupabaseConfigCheckProps {
  showOnlyIfNotConfigured?: boolean;
}

export const SupabaseConfigCheck: React.FC<SupabaseConfigCheckProps> = ({ 
  showOnlyIfNotConfigured = true 
}) => {
  const isConfigured = !!supabase;
  
  // Se está configurado e só deve mostrar quando não configurado, não renderiza
  if (isConfigured && showOnlyIfNotConfigured) {
    return null;
  }

  if (!isConfigured) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex flex-col gap-3">
          <div>
            <strong className="text-orange-800 dark:text-orange-200">
              Supabase não configurado
            </strong>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
              Para usar a autenticação real, configure as variáveis de ambiente do Supabase.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-xs text-orange-600 dark:text-orange-400">
            <div>
              <strong>Variáveis necessárias:</strong>
            </div>
            <div className="font-mono bg-orange-100 dark:bg-orange-900 p-2 rounded">
              VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('https://app.supabase.com', '_blank')}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Criar projeto Supabase
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/supabase-demo'}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              Ver demo
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Se configurado e deve mostrar status
  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <AlertTriangle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <strong className="text-green-800 dark:text-green-200">
          Supabase configurado
        </strong>
        <p className="text-green-700 dark:text-green-300 text-sm mt-1">
          Autenticação real ativa. Sistema pronto para uso.
        </p>
      </AlertDescription>
    </Alert>
  );
};
