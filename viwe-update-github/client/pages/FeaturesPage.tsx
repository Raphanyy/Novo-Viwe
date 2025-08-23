import React from "react";
import { Route, TrafficCone, MapPin, Share2, Globe, Clock } from "lucide-react";

const FeaturesPage: React.FC = () => (
  <div className="container mx-auto px-6 py-24 md:py-32">
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-16">
      Nossas Funcionalidades
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {/* Route Optimization Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <Route className="h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">
          Otimização de Rotas Inteligente
        </h3>
        <p className="text-gray-600">
          Utilizamos algoritmos avançados para calcular o caminho mais eficiente
          entre múltiplos pontos, considerando variáveis como tempo, distância e
          pedágios.
        </p>
      </div>

      {/* Traffic Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <TrafficCone className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Trânsito em Tempo Real</h3>
        <p className="text-gray-600">
          Acompanhe as condições de trânsito ao vivo para evitar
          congestionamentos e atrasos inesperados, garantindo uma viagem mais
          fluida.
        </p>
      </div>

      {/* Points of Interest Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <MapPin className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">
          Descubra Pontos de Interesse
        </h3>
        <p className="text-gray-600">
          Adicione paradas estratégicas como postos de gasolina, restaurantes,
          hotéis e atrações turísticas ao seu itinerário com facilidade.
        </p>
      </div>

      {/* Sharing Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <Share2 className="h-12 w-12 text-purple-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">
          Compartilhamento Simples
        </h3>
        <p className="text-gray-600">
          Compartilhe seu itinerário completo com amigos e familiares através de
          um link seguro, mantendo todos informados sobre sua chegada.
        </p>
      </div>

      {/* Offline Maps Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <Globe className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Mapas Offline</h3>
        <p className="text-gray-600">
          Acesse seus mapas e rotas mesmo sem conexão à internet, perfeito para
          viagens a áreas remotas ou com sinal instável.
        </p>
      </div>

      {/* ETA Card */}
      <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
        <Clock className="h-12 w-12 text-indigo-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">
          Estimativa Precisa de Chegada
        </h3>
        <p className="text-gray-600">
          Receba estimativas de tempo de chegada precisas, levando em conta
          condições de trânsito e paradas.
        </p>
      </div>
    </div>
  </div>
);

export default FeaturesPage;
