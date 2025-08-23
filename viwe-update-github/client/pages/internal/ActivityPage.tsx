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
} from "lucide-react";

const ActivityPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  // Dados mockados de estatísticas
  const stats = {
    totalTrips: 47,
    totalDistance: 342.5,
    totalTime: 18.3,
    fuelSaved: 24.5,
    moneySaved: 127.8,
    efficiency: 89,
  };

  // Dados mockados de viagens
  const trips = [
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
      route: "Rota rápida",
      savings: { time: "5 min", fuel: "0.5L", money: "R$ 2,75" },
      efficiency: 88,
      traffic: "light",
      cost: "R$ 8,20",
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
      route: "Rota econômica",
      savings: { time: "12 min", fuel: "1.2L", money: "R$ 6,60" },
      efficiency: 95,
      traffic: "heavy",
      cost: "R$ 15,80",
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
      route: "Rota expressa",
      savings: { time: "15 min", fuel: "2.1L", money: "R$ 11,55" },
      efficiency: 87,
      traffic: "light",
      cost: "R$ 28,70",
    },
  ];

  const periods = [
    { id: "week", name: "Semana" },
    { id: "month", name: "Mês" },
    { id: "quarter", name: "Trimestre" },
    { id: "year", name: "Ano" },
  ];

  const achievements = [
    {
      id: 1,
      name: "Explorador",
      description: "50+ viagens realizadas",
      icon: Award,
      earned: true,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      id: 2,
      name: "Eficiente",
      description: "85%+ de eficiência média",
      icon: Target,
      earned: true,
      color: "text-green-600 bg-green-100",
    },
    {
      id: 3,
      name: "Econômico",
      description: "R$ 100+ economizados",
      icon: DollarSign,
      earned: true,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 4,
      name: "Sustentável",
      description: "20L+ de combustível poupado",
      icon: Fuel,
      earned: false,
      color: "text-gray-400 bg-gray-100",
    },
  ];

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

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header with Period Selector */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">Atividade</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Download className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="border-t border-border pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Buscar viagens..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Route className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">
                Viagens
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalTrips}
            </p>
            <p className="text-xs text-green-600">+12% este mês</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">
                Distância
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalDistance} km
            </p>
            <p className="text-xs text-green-600">+8% este mês</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-foreground">Tempo</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalTime}h
            </p>
            <p className="text-xs text-green-600">-5% este mês</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Fuel className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-foreground">
                Combustível
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.fuelSaved}L
            </p>
            <p className="text-xs text-green-600">economizados</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">
                Economia
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {stats.moneySaved}
            </p>
            <p className="text-xs text-green-600">economizados</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">
                Eficiência
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.efficiency}%
            </p>
            <p className="text-xs text-green-600">+3% este mês</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Conquistas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-2xl text-center transition-all duration-200 ${
                    achievement.earned ? "hover:scale-105" : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${achievement.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm text-foreground">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.earned && (
                    <div className="mt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mx-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip History */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Histórico de Viagens
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200">
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedTrip(expandedTrip === trip.id ? null : trip.id)
                  }
                  className="w-full p-4 hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {trip.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(
                            trip.efficiency,
                          )} bg-opacity-10`}
                        >
                          {trip.efficiency}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(trip.date).toLocaleDateString("pt-BR")} •{" "}
                            {trip.time}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{trip.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{trip.distance}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium">
                        -{trip.savings.time}
                      </span>
                      {expandedTrip === trip.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedTrip === trip.id && (
                  <div className="border-t border-border p-4 bg-background">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Origem</p>
                          <p className="text-foreground">{trip.startAddress}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Destino</p>
                          <p className="text-foreground">{trip.endAddress}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Economia de Tempo
                          </p>
                          <p className="text-green-600 font-medium">
                            {trip.savings.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Combustível Poupado
                          </p>
                          <p className="text-green-600 font-medium">
                            {trip.savings.fuel}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Economia</p>
                          <p className="text-green-600 font-medium">
                            {trip.savings.money}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTrafficColor(trip.traffic)}`}
                          >
                            {trip.traffic === "light" && "Trânsito Livre"}
                            {trip.traffic === "normal" && "Trânsito Normal"}
                            {trip.traffic === "heavy" && "Trânsito Intenso"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Custo: {trip.cost}
                          </span>
                        </div>

                        <button className="flex items-center space-x-1 text-blue-600 text-sm hover:text-blue-700 transition-colors duration-200">
                          <Share2 className="h-4 w-4" />
                          <span>Compartilhar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Resumo do Mês</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-200 text-sm">Melhor eficiência</p>
              <p className="text-xl font-bold">95%</p>
              <p className="text-blue-200 text-xs">Reunião - Centro</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Maior economia</p>
              <p className="text-xl font-bold">R$ 11,55</p>
              <p className="text-blue-200 text-xs">Aeroporto</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-card/10 rounded-xl">
            <p className="text-sm text-blue-100 mb-2">Meta do próximo mês</p>
            <p className="font-medium">
              Alcançar 50 viagens com 90%+ de eficiência
            </p>
            <div className="mt-2 bg-card/20 rounded-full h-2">
              <div className="bg-card rounded-full h-2 w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>
    </div>
  );
};

export default ActivityPage;
