import React, { useState, useEffect } from "react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";
import {
  MapPin,
  Plus,
  Clock,
  Route as RouteIcon,
  Navigation,
  Star,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Filter,
  Search,
  Car,
  Zap,
  Calendar,
  MoreVertical,
  ArrowRight,
  Target,
} from "lucide-react";

const RoutesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "recent" | "favorites" | "planned" | "history"
  >("recent");
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [completedRoutes, setCompletedRoutes] = useState<any[]>([]);

  // Carregar rotas concluídas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("completedRoutes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedRoutes(parsed.sort((a: any, b: any) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        ));
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        setCompletedRoutes([]);
      }
    }
  }, []);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return "Hoje";
    } else if (diffInHours < 48) {
      return "Ontem";
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Formatar duração
  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "--";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.abs(end.getTime() - start.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.round(diffInMinutes)} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = Math.round(diffInMinutes % 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Rotas mockadas
  const routes = {
    recent: [
      {
        id: 1,
        name: "Casa → Trabalho",
        from: "Rua das Flores, 123",
        to: "Av. Paulista, 1000",
        duration: "25 min",
        distance: "12.5 km",
        traffic: "normal",
        savings: "8 min",
        lastUsed: "2 horas atrás",
        isFavorite: true,
      },
      {
        id: 2,
        name: "Shopping Center Norte",
        from: "Casa",
        to: "Shopping Center Norte",
        duration: "18 min",
        distance: "8.2 km",
        traffic: "light",
        savings: "5 min",
        lastUsed: "1 dia atrás",
        isFavorite: false,
      },
      {
        id: 3,
        name: "Viagem Aeroporto",
        from: "Hotel Plaza",
        to: "Aeroporto Internacional",
        duration: "45 min",
        distance: "28.7 km",
        traffic: "heavy",
        savings: "12 min",
        lastUsed: "3 dias atrás",
        isFavorite: true,
      },
    ],
    favorites: [
      {
        id: 1,
        name: "Casa → Trabalho",
        from: "Rua das Flores, 123",
        to: "Av. Paulista, 1000",
        duration: "25 min",
        distance: "12.5 km",
        traffic: "normal",
        savings: "8 min",
        lastUsed: "2 horas atrás",
        isFavorite: true,
      },
      {
        id: 3,
        name: "Viagem Aeroporto",
        from: "Hotel Plaza",
        to: "Aeroporto Internacional",
        duration: "45 min",
        distance: "28.7 km",
        traffic: "heavy",
        savings: "12 min",
        lastUsed: "3 dias atrás",
        isFavorite: true,
      },
    ],
    planned: [
      {
        id: 4,
        name: "Reunião Cliente",
        from: "Escritório",
        to: "Centro Empresarial",
        duration: "22 min",
        distance: "9.8 km",
        traffic: "normal",
        scheduledFor: "Amanhã 14:30",
        isFavorite: false,
      },
      {
        id: 5,
        name: "Fim de Semana - Praia",
        from: "Casa",
        to: "Santos - Praia",
        duration: "1h 15min",
        distance: "65.2 km",
        traffic: "light",
        scheduledFor: "Sábado 08:00",
        isFavorite: false,
      },
    ],
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case "light":
        return "text-green-600 bg-green-100";
      case "normal":
        return "text-yellow-600 bg-yellow-100";
      case "heavy":
        return "text-red-600 bg-red-100";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const tabs = [
    { id: "recent", name: "Recentes", count: routes.recent.length },
    { id: "favorites", name: "Favoritas", count: routes.favorites.length },
    { id: "planned", name: "Agendadas", count: routes.planned.length },
  ];

  const currentRoutes = routes[activeTab] || [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Search */}
      <div className="bg-card border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Minhas Rotas</h1>
          <button
            onClick={openRouteModal}
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Buscar rotas..."
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-card text-blue-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-blue-100" : "bg-gray-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Routes List */}
      <div className="flex-1 overflow-auto p-4">
        {currentRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <RouteIcon className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma rota encontrada
            </h3>
            <p className="text-sm text-center mb-4">
              {activeTab === "recent" && "Suas rotas recentes aparecerão aqui"}
              {activeTab === "favorites" &&
                "Marque rotas como favoritas para acesso rápido"}
              {activeTab === "planned" && "Agende suas viagens futuras"}
            </p>
            <button
              onClick={openRouteModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Nova Rota</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-card rounded-2xl p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {route.name}
                      </h3>
                      {route.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{route.from}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{route.to}</span>
                      </div>
                    </div>
                  </div>

                  <button className="p-1 hover:bg-muted rounded-lg transition-colors duration-200">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {route.duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {route.distance}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(route.traffic)}`}
                    >
                      {route.traffic === "light" && "Livre"}
                      {route.traffic === "normal" && "Normal"}
                      {route.traffic === "heavy" && "Intenso"}
                    </span>
                  </div>

                  {route.savings && (
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                      -{route.savings}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {activeTab === "planned"
                      ? `Agendada para ${(route as any).scheduledFor}`
                      : `Última vez: ${(route as any).lastUsed}`}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors duration-200">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors duration-200">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1">
                      <Navigation className="h-4 w-4" />
                      <span className="text-sm font-medium">Navegar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border-t border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={openRouteModal}
            className="flex flex-col items-center space-y-2 p-3 bg-muted rounded-2xl hover:bg-secondary transition-colors duration-200"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Nova Rota</span>
          </button>

          <button className="flex flex-col items-center space-y-2 p-3 bg-muted rounded-2xl hover:bg-secondary transition-colors duration-200">
            <Zap className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium text-green-600">Otimizar</span>
          </button>

          <button className="flex flex-col items-center space-y-2 p-3 bg-muted rounded-2xl hover:bg-secondary transition-colors duration-200">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Agendar</span>
          </button>
        </div>
      </div>

      {/* Route Configuration Modal */}
      <RouteConfigurationModal
        isOpen={isRouteModalOpen}
        onClose={closeRouteModal}
      />

      {/* Bottom padding for mobile navigation */}
      <div className="h-2 sm:hidden"></div>
    </div>
  );
};

export default RoutesPage;
