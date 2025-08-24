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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

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
  details: {
    subtitle: string;
    items: { label: string; value: string }[];
    trend: string;
  };
}

const ActivityPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedStatus, setSelectedStatus] = useState<RouteStatus | "all">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados de estatísticas
  const stats: StatCard[] = [
    {
      label: "Rotas",
      value: "47",
      change: "+12%",
      icon: CheckCircle,
      color: "text-green-600",
      description: "Concluídas",
      details: {
        subtitle: "Análise detalhada das rotas",
        items: [
          { label: "Este mês", value: "47 rotas" },
          { label: "Mês anterior", value: "42 rotas" },
          { label: "Média diária", value: "1.6 rotas" },
          { label: "Taxa de sucesso", value: "94%" },
        ],
        trend: "Aumento consistente no número de rotas concluídas",
      },
    },
    {
      label: "Tempo",
      value: "18.3h",
      change: "-5%",
      icon: Clock,
      color: "text-blue-600",
      description: "Economizado",
      details: {
        subtitle: "Tempo economizado em viagens",
        items: [
          { label: "Tempo total economizado", value: "18.3h" },
          { label: "Economia média por rota", value: "23 min" },
          { label: "Maior economia", value: "45 min" },
          { label: "Eficiência temporal", value: "85%" },
        ],
        trend: "Melhor otimização de rotas resulta em maior economia",
      },
    },
    {
      label: "Distância",
      value: "342km",
      change: "+8%",
      icon: MapPin,
      color: "text-purple-600",
      description: "Percorrida",
      details: {
        subtitle: "Distâncias percorridas",
        items: [
          { label: "Total percorrido", value: "342 km" },
          { label: "Média por rota", value: "7.3 km" },
          { label: "Rota mais longa", value: "28.7 km" },
          { label: "Rota mais curta", value: "2.1 km" },
        ],
        trend: "Aumento gradual na distância total percorrida",
      },
    },
    {
      label: "Economia",
      value: "R$ 127",
      change: "+18%",
      icon: DollarSign,
      color: "text-green-600",
      description: "Total",
      details: {
        subtitle: "Economia financeira",
        items: [
          { label: "Economia total", value: "R$ 127,80" },
          { label: "Economia em combustível", value: "R$ 89,40" },
          { label: "Economia em pedágio", value: "R$ 38,40" },
          { label: "Média por rota", value: "R$ 2,72" },
        ],
        trend: "Significativo aumento na economia mensal",
      },
    },
    {
      label: "Eficiência",
      value: "89%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-yellow-600",
      description: "Média",
      details: {
        subtitle: "Índice de eficiência",
        items: [
          { label: "Eficiência média", value: "89%" },
          { label: "Melhor eficiência", value: "95%" },
          { label: "Rotas acima 90%", value: "28 rotas" },
          { label: "Meta mensal", value: "85%" },
        ],
        trend: "Melhoria constante na eficiência das rotas",
      },
    },
    {
      label: "Combustível",
      value: "24.5L",
      change: "+15%",
      icon: Fuel,
      color: "text-orange-600",
      description: "Poupado",
      details: {
        subtitle: "Economia de combustível",
        items: [
          { label: "Total poupado", value: "24.5 L" },
          { label: "Valor economizado", value: "R$ 147,00" },
          { label: "Economia por rota", value: "0.52 L" },
          { label: "Redução CO2", value: "57.8 kg" },
        ],
        trend: "Excelente economia de combustível e impacto ambiental",
      },
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
      description:
        "Rota diária para o trabalho, otimizada para evitar trânsito",
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
    {
      id: "completed",
      name: "Concluídas",
      count: routes.filter((r) => r.status === "completed").length,
    },
    {
      id: "paused",
      name: "Pausadas",
      count: routes.filter((r) => r.status === "paused").length,
    },
    {
      id: "configured",
      name: "Configuradas",
      count: routes.filter((r) => r.status === "configured").length,
    },
    {
      id: "forgotten",
      name: "Esquecidas",
      count: routes.filter((r) => r.status === "forgotten").length,
    },
  ];

  const getStatusConfig = (status: RouteStatus) => {
    switch (status) {
      case "completed":
        return {
          color: "text-green-600 bg-green-100",
          icon: CheckCircle,
          label: "Concluída",
          borderColor: "border-l-green-500",
        };
      case "paused":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: Pause,
          label: "Pausada",
          borderColor: "border-l-yellow-500",
        };
      case "configured":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: Settings,
          label: "Configurada",
          borderColor: "border-l-blue-500",
        };
      case "forgotten":
        return {
          color: "text-red-600 bg-red-100",
          icon: XCircle,
          label: "Esquecida",
          borderColor: "border-l-red-500",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: Info,
          label: "Desconhecido",
          borderColor: "border-l-gray-500",
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

  const filteredRoutes = routes.filter((route) => {
    const matchesStatus =
      selectedStatus === "all" || route.status === selectedStatus;
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.startAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.endAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-4 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold">Atividades</h1>
                <p className="text-gray-300 text-xs">Histórico de rotas</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    showFilters
                      ? "bg-primary/20"
                      : "bg-card/20 hover:bg-card/30"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                </button>
                <button className="p-2 bg-card/20 hover:bg-card/30 transition-colors duration-200 rounded-lg">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex space-x-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
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
          <div className="bg-card rounded-xl p-3 border border-l-4 border-l-primary border-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            <div className="relative z-10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-sm"
                  placeholder="Buscar rotas..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() =>
                      setSelectedStatus(filter.id as RouteStatus | "all")
                    }
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedStatus === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{filter.name}</span>
                    <span
                      className={`text-xs px-1 py-0.5 rounded-full ${
                        selectedStatus === filter.id
                          ? "bg-primary-foreground/20"
                          : "bg-border"
                      }`}
                    >
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
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Estatísticas Detalhadas
          </h3>
          <Accordion type="single" collapsible className="space-y-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <AccordionItem
                  key={stat.label}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-l-4 border-l-primary border-border relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

                  <AccordionTrigger className="px-4 py-3 hover:no-underline relative z-10">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">
                              {stat.label}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 relative z-10">
                    <div className="pt-3 border-t border-border">
                      {/* Valor principal e mudança */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {stat.details.subtitle}
                          </p>
                        </div>
                        <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {stat.details.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex justify-between items-center p-2 bg-background/50 rounded-lg"
                          >
                            <span className="text-xs text-muted-foreground">
                              {item.label}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-accent/50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {stat.details.trend}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
                  className={`bg-card rounded-xl border border-l-4 ${statusConfig.borderColor} border-border relative overflow-hidden`}
                >
                  <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

                  <div className="relative z-10 p-3 hover:bg-accent/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 text-left cursor-pointer"
                        onClick={() =>
                          setExpandedTrip(
                            expandedTrip === route.id ? null : route.id,
                          )
                        }
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {route.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(route.efficiency)} bg-opacity-10`}
                          >
                            {route.efficiency}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(route.date).toLocaleDateString("pt-BR")}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{route.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{route.distance}</span>
                          </span>
                          <span className="text-green-600 font-medium">
                            -{route.savings.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoute(route);
                          }}
                          className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedTrip(
                              expandedTrip === route.id ? null : route.id,
                            )
                          }
                          className="p-1 hover:bg-accent rounded-lg transition-colors"
                        >
                          {expandedTrip === route.id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedTrip === route.id && (
                    <div className="border-t border-border p-3 bg-background/50 relative z-10">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Origem</p>
                            <p className="text-foreground font-medium">
                              {route.startAddress}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Destino</p>
                            <p className="text-foreground font-medium">
                              {route.endAddress}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Tempo
                            </p>
                            <p className="text-green-600 font-bold text-sm">
                              {route.savings.time}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <Fuel className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Combustível
                            </p>
                            <p className="text-blue-600 font-bold text-sm">
                              {route.savings.fuel}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <DollarSign className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Economia
                            </p>
                            <p className="text-purple-600 font-bold text-sm">
                              {route.savings.money}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(route.traffic)}`}
                            >
                              {route.traffic === "light" && "Livre"}
                              {route.traffic === "normal" && "Normal"}
                              {route.traffic === "heavy" && "Intenso"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {route.cost}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedRoute(route)}
                              className="flex items-center space-x-1 text-primary text-xs hover:text-primary/80 transition-colors duration-200"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Ver</span>
                            </button>
                            <button className="flex items-center space-x-1 text-blue-600 text-xs hover:text-blue-700 transition-colors duration-200">
                              <Share2 className="h-3 w-3" />
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
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Nenhuma rota encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Tente ajustar sua busca"
                  : "Nenhuma rota nos filtros selecionados"}
              </p>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-black rounded-xl p-4 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-3">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 text-xs">Melhor eficiência</p>
                <p className="text-xl font-bold">95%</p>
                <p className="text-gray-400 text-xs">Reunião - Centro</p>
              </div>
              <div>
                <p className="text-gray-300 text-xs">Maior economia</p>
                <p className="text-xl font-bold">R$ 11,55</p>
                <p className="text-gray-400 text-xs">Aeroporto</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-card/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-300">Meta próximo mês</p>
                <span className="text-xs text-gray-400">75%</span>
              </div>
              <p className="text-sm font-medium mb-2">
                50 viagens com 90%+ eficiência
              </p>
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
                      <h3 className="text-lg font-semibold text-foreground">
                        {selectedRoute.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {statusConfig.label}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Description */}
            {selectedRoute.description && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-foreground">
                  {selectedRoute.description}
                </p>
              </div>
            )}

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Origem</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoute.startAddress}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Destino</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoute.endAddress}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Data e Hora
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedRoute.date).toLocaleDateString("pt-BR")} às{" "}
                  {selectedRoute.time}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Duração</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoute.duration}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Métricas de Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Eficiência</p>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={selectedRoute.efficiency}
                      className="flex-1 h-2"
                    />
                    <span
                      className={`text-sm font-medium ${getEfficiencyColor(selectedRoute.efficiency)}`}
                    >
                      {selectedRoute.efficiency}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Distância</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedRoute.distance}
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Tempo Economizado
                </p>
                <p className="font-bold text-green-600">
                  {selectedRoute.savings.time}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Fuel className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Combustível Poupado
                </p>
                <p className="font-bold text-blue-600">
                  {selectedRoute.savings.fuel}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Valor Economizado
                </p>
                <p className="font-bold text-purple-600">
                  {selectedRoute.savings.money}
                </p>
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
