import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  dashboardService,
  DashboardData,
  useLoading,
} from "../../services/api";
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
  Users,
  FolderOpen,
  Heart,
} from "lucide-react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";
import { Progress } from "../../components/ui/progress";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const { loading, error, execute } = useLoading();

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    const result = await execute(() => dashboardService.getDashboardData());
    if (result) {
      setDashboardData(result);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="text-destructive mb-4 text-center">
          <p className="text-xl font-semibold">Erro ao carregar dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Carregando..." : "Tentar novamente"}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-black rounded-2xl p-6 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="flex items-center space-x-3 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-card/20 flex items-center justify-center">
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
              <p className="text-gray-300 text-sm">Bem-vindo de volta!</p>
              <h2 className="text-xl font-bold">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-300 text-sm mb-1">Próxima viagem</p>
              <p className="font-semibold">Casa → Trabalho em 8h</p>
            </div>
            <button
              onClick={openRouteModal}
              className="bg-card/20 hover:bg-card/30 transition-colors duration-200 rounded-xl p-3"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        {dashboardData?.stats && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Estatísticas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  name: "Rotas este mês",
                  value: dashboardData.stats.routes.thisMonth,
                  change: dashboardData.stats.routes.change,
                  icon: Route,
                  color: "text-blue-600",
                  description: "Total de rotas criadas",
                },
                {
                  name: "Tempo economizado",
                  value: dashboardData.stats.timeSaved.formatted,
                  change: dashboardData.stats.timeSaved.change,
                  icon: Clock,
                  color: "text-green-600",
                  description: "Otimização de trajetos",
                },
                {
                  name: "Distância total",
                  value: dashboardData.stats.distance.formatted,
                  change: dashboardData.stats.distance.change,
                  icon: Car,
                  color: "text-purple-600",
                  description: "Percorridos este mês",
                },
                {
                  name: "Eficiência",
                  value: dashboardData.stats.efficiency.formatted,
                  change: dashboardData.stats.efficiency.change,
                  icon: TrendingUp,
                  color: "text-yellow-600",
                  description: "Média de otimização",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="bg-card rounded-2xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-xs text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground relative z-10">
                      {stat.value}
                    </p>
                    <h4 className="font-semibold text-foreground text-sm mb-1 relative z-10">
                      {stat.name}
                    </h4>
                    <p className="text-xs text-muted-foreground relative z-10">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Painel de Consumo */}
        {dashboardData?.stats.usage && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Painel de Consumo
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Rotas Permanentes",
                  current: dashboardData.stats.usage.routes.current,
                  limit: dashboardData.stats.usage.routes.limit,
                  percentage: dashboardData.stats.usage.routes.percentage,
                  icon: Route,
                  color: "text-blue-600",
                  description: `${dashboardData.stats.usage.routes.current} de ${dashboardData.stats.usage.routes.limit} rotas utilizadas`,
                },
                {
                  label: "Clientes Adicionados",
                  current: dashboardData.stats.usage.clients.current,
                  limit: dashboardData.stats.usage.clients.limit,
                  percentage: dashboardData.stats.usage.clients.percentage,
                  icon: Users,
                  color: "text-green-600",
                  description: `${dashboardData.stats.usage.clients.current} de ${dashboard.stats.usage.clients.limit} clientes`,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="bg-card rounded-2xl p-5 border border-l-4 border-l-primary border-border relative overflow-hidden"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${item.color}`} />
                          <h4 className="font-semibold text-foreground">
                            {item.label}
                          </h4>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {item.current}/{item.limit}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Progress value={item.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Routes */}
        {dashboardData?.recentRoutes && dashboardData.recentRoutes.length > 0 && (
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
              {dashboardData.recentRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-card rounded-2xl p-4 hover:shadow-md transition-shadow duration-200 border border-l-4 border-l-primary border-border relative overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {route.name}
                        </h4>
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
                          <span>{new Date(route.time).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips & Insights */}
        <div className="bg-black rounded-2xl p-6 border border-l-4 border-l-primary border-border relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="flex items-start space-x-3 relative z-10">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                Dica do Dia
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Evite a Rua das Palmeiras entre 17h-19h. Trânsito intenso pode
                aumentar seu tempo de viagem em até 15 minutos.
              </p>
              <Link
                to="/app/mapa"
                className="text-primary text-sm font-medium hover:text-primary/80 transition-colors duration-200"
              >
                Ver rotas alternativas →
              </Link>
            </div>
          </div>
        </div>

        {/* Avaliação da Tela */}
        <div className="bg-card rounded-2xl p-4 border border-l-4 border-l-primary relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Heart className="h-6 w-6 text-blue-600 fill-current" />
            <p className="text-sm font-medium text-foreground">
              Avalie esta tela
            </p>
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
