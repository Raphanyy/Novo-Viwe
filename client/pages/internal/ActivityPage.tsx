import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Car,
  Route,
  DollarSign,
  Zap,
  Filter,
  Search,
  Download,
  Share2,
  Star,
  ChevronDown,
  ChevronRight,
  Award,
  Target,
  Fuel,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Progress } from "../../components/ui/progress";
import AdaptiveModal from "../../components/shared/AdaptiveModal";

type RouteStatus = "completed" | "paused" | "configured" | "forgotten";

interface RouteDetails {
  id: number;
  name: string;
  date: string;
  time: string;
  duration: string;
  distance: string;
  startAddress: string;
  endAddress: string;
  route: string;
  savings: { time: string; fuel: string; money: string };
  efficiency: number;
  traffic: "light" | "normal" | "heavy";
  cost: string;
  status: RouteStatus;
  description?: string;
}

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const ActivityPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedStatus, setSelectedStatus] = useState<RouteStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados de estatísticas
  const stats: StatCard[] = [
    {
      label: "Rotas Concluídas",
      value: "47",
      change: "+12%",
      icon: CheckCircle,
      color: "text-green-600",
      description: "Total de rotas finalizadas",
    },
    {
      label: "Tempo Total",
      value: "18.3h",
      change: "-5%",
      icon: Clock,
      color: "text-blue-600",
      description: "Tempo gasto em viagens",
    },
    {
      label: "Distância Percorrida",
      value: "342km",
      change: "+8%",
      icon: MapPin,
      color: "text-purple-600",
      description: "Total de quilômetros",
    },
    {
      label: "Economia Total",
      value: "R$ 127",
      change: "+18%",
      icon: DollarSign,
      color: "text-green-600",
      description: "Valor economizado",
    },
    {
      label: "Eficiência Média",
      value: "89%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-yellow-600",
      description: "Média de otimização",
    },
    {
      label: "Combustível Poupado",
      value: "24.5L",
      change: "+15%",
      icon: Fuel,
      color: "text-orange-600",
      description: "Litros economizados",
    },
  ];

  // Dados mockados de rotas com diferentes status
  const routes: RouteDetails[] = [
    {
      id: 1,
      name: "Casa → Trabalho",
      date: "2024-01-15",
      time: "08:30",
      duration: "25 min",
      distance: "12.5 km",
      startAddress: "Rua das Flores, 123",
      endAddress: "Av. Paulista, 1000",
      route: "Rota otimizada",
      savings: { time: "8 min", fuel: "0.8L", money: "R$ 4,40" },
      efficiency: 92,
      traffic: "normal",
      cost: "R$ 12,50",
      status: "completed",
      description: "Rota diária para o trabalho, otimizada para evitar trânsito",
    },
    {
      id: 2,
      name: "Shopping Center Norte",
      date: "2024-01-14",
      time: "14:15",
      duration: "18 min",
      distance: "8.2 km",
      startAddress: "Casa",
      endAddress: "Shopping Center Norte",
      route: "Rota pausada",
      savings: { time: "5 min", fuel: "0.5L", money: "R$ 2,75" },
      efficiency: 88,
      traffic: "light",
      cost: "R$ 8,20",
      status: "paused",
      description: "Viagem pausada no meio do percurso devido a imprevisto",
    },
    {
      id: 3,
      name: "Reunião - Centro",
      date: "2024-01-13",
      time: "16:45",
      duration: "32 min",
      distance: "15.8 km",
      startAddress: "Escritório Regional",
      endAddress: "Centro Empresarial",
      route: "Rota configurada",
      savings: { time: "12 min", fuel: "1.2L", money: "R$ 6,60" },
      efficiency: 95,
      traffic: "heavy",
      cost: "R$ 15,80",
      status: "configured",
      description: "Rota configurada mas ainda não iniciada",
    },
    {
      id: 4,
      name: "Aeroporto Internacional",
      date: "2024-01-12",
      time: "06:00",
      duration: "45 min",
      distance: "28.7 km",
      startAddress: "Hotel Plaza",
      endAddress: "Terminal 3 - Aeroporto",
      route: "Rota esquecida",
      savings: { time: "15 min", fuel: "2.1L", money: "R$ 11,55" },
      efficiency: 87,
      traffic: "light",
      cost: "R$ 28,70",
      status: "forgotten",
      description: "Rota esquecida - não foi finalizada adequadamente",
    },
  ];

  const periods = [
    { id: "week", name: "Semana" },
    { id: "month", name: "Mês" },
    { id: "quarter", name: "Trimestre" },
    { id: "year", name: "Ano" },
  ];

  const statusFilters = [
    { id: "all", name: "Todas", count: routes.length },
    { id: "completed", name: "Concluídas", count: routes.filter(r => r.status === "completed").length },
    { id: "paused", name: "Pausadas", count: routes.filter(r => r.status === "paused").length },
    { id: "configured", name: "Configuradas", count: routes.filter(r => r.status === "configured").length },
    { id: "forgotten", name: "Esquecidas", count: routes.filter(r => r.status === "forgotten").length },
  ];

  const getStatusConfig = (status: RouteStatus) => {
    switch (status) {
      case "completed":
        return {
          color: "text-green-600 bg-green-100",
          icon: CheckCircle,
          label: "Concluída",
          borderColor: "border-l-green-500"
        };
      case "paused":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: Pause,
          label: "Pausada",
          borderColor: "border-l-yellow-500"
        };
      case "configured":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: Settings,
          label: "Configurada",
          borderColor: "border-l-blue-500"
        };
      case "forgotten":
        return {
          color: "text-red-600 bg-red-100",
          icon: XCircle,
          label: "Esquecida",
          borderColor: "border-l-red-500"
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: Info,
          label: "Desconhecido",
          borderColor: "border-l-gray-500"
        };
    }
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
        return "text-muted-foreground bg-gray-100";
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredRoutes = routes.filter(route => {
    const matchesStatus = selectedStatus === "all" || route.status === selectedStatus;
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-6 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Histórico de Atividades</h1>
                <p className="text-gray-300 text-sm">Acompanhe todas as suas rotas e viagens</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-xl transition-colors duration-200 ${
                    showFilters ? "bg-primary/20" : "bg-card/20 hover:bg-card/30"
                  }`}
                >
                  <Filter className="h-5 w-5" />
                </button>
                <button className="p-3 bg-card/20 hover:bg-card/30 transition-colors duration-200 rounded-xl">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex space-x-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? "bg-primary/20 text-white border border-primary/30"
                      : "bg-card/20 text-gray-300 hover:bg-card/30"
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card rounded-2xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            <div className="relative z-10 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Buscar rotas..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedStatus(filter.id as RouteStatus | "all")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedStatus === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{filter.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedStatus === filter.id ? "bg-primary-foreground/20" : "bg-border"
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Estatísticas do Período</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-xs text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {stat.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Histórico de Rotas ({filteredRoutes.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredRoutes.map((route) => {
              const statusConfig = getStatusConfig(route.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={route.id}
                  className={`bg-card rounded-2xl border border-l-4 ${statusConfig.borderColor} border-border relative overflow-hidden`}
                >
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                  
                  <button
                    onClick={() =>
                      setExpandedTrip(expandedTrip === route.id ? null : route.id)
                    }
                    className="w-full p-4 hover:bg-accent/50 transition-colors duration-200 relative z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {route.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(route.efficiency)} bg-opacity-10`}>
                            {route.efficiency}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(route.date).toLocaleDateString("pt-BR")} • {route.time}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{route.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{route.distance}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoute(route);
                          }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <span className="text-green-600 text-sm font-medium">
                          -{route.savings.time}
                        </span>
                        {expandedTrip === route.id ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {expandedTrip === route.id && (
                    <div className="border-t border-border p-4 bg-background/50 relative z-10">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Origem</p>
                            <p className="text-foreground font-medium">{route.startAddress}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Destino</p>
                            <p className="text-foreground font-medium">{route.endAddress}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Tempo Economizado</p>
                            <p className="text-green-600 font-bold">{route.savings.time}</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <Fuel className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Combustível Poupado</p>
                            <p className="text-blue-600 font-bold">{route.savings.fuel}</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Economia</p>
                            <p className="text-purple-600 font-bold">{route.savings.money}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTrafficColor(route.traffic)}`}>
                              {route.traffic === "light" && "Trânsito Livre"}
                              {route.traffic === "normal" && "Trânsito Normal"}
                              {route.traffic === "heavy" && "Trânsito Intenso"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Custo: {route.cost}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoute(route);
                              }}
                              className="flex items-center space-x-1 text-primary text-sm hover:text-primary/80 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Detalhes</span>
                            </button>
                            <button className="flex items-center space-x-1 text-blue-600 text-sm hover:text-blue-700 transition-colors duration-200">
                              <Share2 className="h-4 w-4" />
                              <span>Compartilhar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredRoutes.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma rota encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar sua busca ou filtros" : "Nenhuma rota corresponde aos filtros selecionados"}
              </p>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-black rounded-2xl p-6 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4">Resumo de Performance</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-300 text-sm mb-1">Melhor eficiência</p>
                <p className="text-2xl font-bold mb-1">95%</p>
                <p className="text-gray-400 text-xs">Reunião - Centro</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm mb-1">Maior economia</p>
                <p className="text-2xl font-bold mb-1">R$ 11,55</p>
                <p className="text-gray-400 text-xs">Aeroporto Internacional</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-card/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">Meta do próximo mês</p>
                <span className="text-xs text-gray-400">75%</span>
              </div>
              <p className="font-medium mb-3">Alcançar 50 viagens com 90%+ de eficiência</p>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>

      {/* Route Details Modal */}
      <AdaptiveModal
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        title="Detalhes da Rota"
        showBackButton={true}
        onBack={() => setSelectedRoute(null)}
        className="max-w-2xl"
      >
        {selectedRoute && (
          <div className="p-6 space-y-6">
            {/* Status Header */}
            <div className="flex items-center space-x-3">
              {(() => {
                const statusConfig = getStatusConfig(selectedRoute.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <>
                    <div className={`p-3 rounded-xl ${statusConfig.color}`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedRoute.name}</h3>
                      <p className="text-sm text-muted-foreground">{statusConfig.label}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Description */}
            {selectedRoute.description && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-foreground">{selectedRoute.description}</p>
              </div>
            )}

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Origem</p>
                <p className="text-sm text-muted-foreground">{selectedRoute.startAddress}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Destino</p>
                <p className="text-sm text-muted-foreground">{selectedRoute.endAddress}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Data e Hora</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedRoute.date).toLocaleDateString("pt-BR")} às {selectedRoute.time}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Duração</p>
                <p className="text-sm text-muted-foreground">{selectedRoute.duration}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Métricas de Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Eficiência</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedRoute.efficiency} className="flex-1 h-2" />
                    <span className={`text-sm font-medium ${getEfficiencyColor(selectedRoute.efficiency)}`}>
                      {selectedRoute.efficiency}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Distância</p>
                  <p className="text-lg font-semibold text-foreground">{selectedRoute.distance}</p>
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Tempo Economizado</p>
                <p className="font-bold text-green-600">{selectedRoute.savings.time}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Fuel className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Combustível Poupado</p>
                <p className="font-bold text-blue-600">{selectedRoute.savings.fuel}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Valor Economizado</p>
                <p className="font-bold text-purple-600">{selectedRoute.savings.money}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-border">
              <button className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Repetir Rota
              </button>
              <button className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                Compartilhar
              </button>
            </div>
          </div>
        )}
      </AdaptiveModal>
    </div>
  );
};

export default ActivityPage;
