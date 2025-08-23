import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MapPin,
  Route,
  Clock,
  TrendingUp,
  Car,
  Navigation,
  Plus,
  ChevronRight,
  Zap,
  Star,
  Calendar,
  Activity,
} from "lucide-react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();

  // Dados mockados para demonstração
  const recentRoutes = [
    {
      id: 1,
      name: "Casa → Trabalho",
      duration: "25 min",
      distance: "12.5 km",
      savings: "8 min",
      time: "08:30",
    },
    {
      id: 2,
      name: "Shopping Center",
      duration: "18 min",
      distance: "8.2 km",
      savings: "5 min",
      time: "14:15",
    },
    {
      id: 3,
      name: "Aeroporto",
      duration: "45 min",
      distance: "28.7 km",
      savings: "12 min",
      time: "Ontem",
    },
  ];

  const quickActions = [
    {
      name: "Nova Rota",
      icon: Plus,
      action: openRouteModal,
      color: "bg-blue-100 text-blue-600",
      description: "Planejar viagem",
    },
    {
      name: "Mapa",
      icon: MapPin,
      path: "/app/mapa",
      color: "bg-green-100 text-green-600",
      description: "Ver localizações",
    },
    {
      name: "Atividade",
      icon: Activity,
      path: "/app/atividade",
      color: "bg-purple-100 text-purple-600",
      description: "Histórico",
    },
    {
      name: "Configurar",
      icon: Navigation,
      path: "/app/opcoes",
      color: "bg-yellow-100 text-yellow-600",
      description: "Preferências",
    },
  ];

  const stats = [
    {
      label: "Rotas este mês",
      value: "47",
      change: "+12%",
      icon: Route,
      color: "text-blue-600",
    },
    {
      label: "Tempo economizado",
      value: "3.2h",
      change: "+18%",
      icon: Clock,
      color: "text-green-600",
    },
    {
      label: "Distância total",
      value: "342km",
      change: "+8%",
      icon: Car,
      color: "text-purple-600",
    },
    {
      label: "Eficiência",
      value: "89%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {user?.name?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-blue-100 text-sm">Bem-vindo de volta!</p>
              <h2 className="text-xl font-bold">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Próxima viagem</p>
              <p className="font-semibold">Casa → Trabalho em 8h</p>
            </div>
            <button
              onClick={openRouteModal}
              className="bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-xl p-3"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              if (action.action) {
                // Para ações que usam modal (Nova Rota)
                return (
                  <button
                    key={action.name}
                    onClick={action.action}
                    className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow duration-200 group text-left w-full"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {action.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </button>
                );
              } else {
                // Para ações que usam Link (outras ações)
                return (
                  <Link
                    key={action.name}
                    to={action.path}
                    className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow duration-200 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {action.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </Link>
                );
              }
            })}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Routes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              Rotas Recentes
            </h3>
            <Link
              to="/app/atividade"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {recentRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {route.name}
                      </h4>
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        -{route.savings}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{route.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{route.distance}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{route.time}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips & Insights */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Dica do Dia</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Evite a Rua das Palmeiras entre 17h-19h. Trânsito intenso pode
                aumentar seu tempo de viagem em até 15 minutos.
              </p>
              <Link
                to="/app/mapa"
                className="text-yellow-700 text-sm font-medium hover:text-yellow-800 transition-colors duration-200"
              >
                Ver rotas alternativas →
              </Link>
            </div>
          </div>
        </div>

        {/* Weather & Traffic (Simplified) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">☀️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Clima</p>
                <p className="text-xs text-muted-foreground">Bom para viajar</p>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">24°C</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Trânsito</p>
                <p className="text-xs text-muted-foreground">Condições normais</p>
              </div>
            </div>
            <p className="text-lg font-bold text-green-600">Fluindo</p>
          </div>
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>

      {/* Modal de Configuração de Rotas */}
      <RouteConfigurationModal
        isOpen={isRouteModalOpen}
        onClose={closeRouteModal}
      />
    </div>
  );
};

export default DashboardPage;
