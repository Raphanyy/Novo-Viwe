import React from "react";
import { ExternalLink, MapPin, Key, CheckCircle } from "lucide-react";

const MapboxSetupGuide: React.FC = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Configurar Mapbox Token
        </h3>
      </div>

      <p className="text-muted-foreground mb-6 text-sm">
        A aplicação já vem com um token Mapbox pré-configurado. Se você quiser
        usar seu próprio token, siga os passos abaixo:
      </p>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <span className="text-white text-xs font-semibold">1</span>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Criar conta no Mapbox
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Acesse o site oficial do Mapbox e crie uma conta gratuita.
            </p>
            <a
              href="https://account.mapbox.com/auth/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Criar conta no Mapbox
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <span className="text-white text-xs font-semibold">2</span>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Obter Access Token
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              No painel do Mapbox, acesse a seção "Access tokens" e copie seu
              token público.
            </p>
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Key className="h-4 w-4 mr-1" />
              Acessar tokens
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <span className="text-white text-xs font-semibold">3</span>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Configurar variável de ambiente (opcional)
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Para usar seu próprio token, adicione-o ao arquivo .env na raiz do projeto:
            </p>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono text-foreground">
              VITE_MAPBOX_ACCESS_TOKEN="seu_token_aqui"
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Token padrão:</strong> A aplicação já possui um token pré-configurado e funcionará sem configuração adicional.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Reiniciar aplicação
            </h4>
            <p className="text-sm text-muted-foreground">
              Reinicie o servidor de desenvolvimento para que as mudanças tenham
              efeito.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> O plano gratuito do Mapbox permite até
          50.000 visualizações de mapa por mês, suficiente para desenvolvimento
          e teste.
        </p>
      </div>
    </div>
  );
};

export default MapboxSetupGuide;
