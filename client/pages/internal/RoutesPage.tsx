import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Edit3,
  Trash2,
  Share2,
  Link,
  Settings,
  Route as RouteIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import RouteDetailsPage from "../../components/shared/RouteDetailsPage";
import RouteSettingsPage from "../../components/shared/RouteSettingsPage";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";
import { routesService, RouteData, useLoading } from "../../services/api";

type ViewMode = "list" | "details" | "settings";

const RoutesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "scheduled" | "draft"
  >("all");
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const { loading, error, execute } = useLoading();
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();

  // Dados mockados das rotas
  const routes: RouteData[] = [
    {
      id: 1,
      name: "Rota Casa → Trabalho",
      stopCount: 5,
      createdAt: "2024-01-15",
      status: "active",
      description: "Rota diária otimizada para o trabalho",
      estimatedDuration: "25 min",
      totalDistance: "12.5 km",
      isFavorite: true,
      linkedSet: "Rotas Diárias",
      lastModified: "2024-01-20T08:30:00",
    },
    {
      id: 2,
      name: "Entrega Express - Centro",
      stopCount: 8,
      createdAt: "2024-01-18",
      status: "active",
      description: "Rota de entregas no centro da cidade",
      estimatedDuration: "45 min",
      totalDistance: "18.2 km",
      isFavorite: false,
      lastModified: "2024-01-19T14:15:00",
    },
    {
      id: 3,
      name: "Reunião Cliente - Zona Sul",
      stopCount: 3,
      createdAt: "2024-01-20",
      scheduledDate: "2024-01-25T14:30:00",
      status: "scheduled",
      description: "Visitas a clientes na zona sul",
      estimatedDuration: "1h 20min",
      totalDistance: "25.8 km",
      isFavorite: false,
      lastModified: "2024-01-20T10:45:00",
    },
    {
      id: 4,
      name: "Rota Fim de Semana",
      stopCount: 4,
      createdAt: "2024-01-19",
      scheduledDate: "2024-01-27T09:00:00",
      status: "scheduled",
      description: "Passeios e compras de fim de semana",
      estimatedDuration: "2h 15min",
      totalDistance: "35.4 km",
      isFavorite: true,
      linkedSet: "Rotas de Lazer",
      lastModified: "2024-01-19T16:22:00",
    },
    {
      id: 5,
      name: "Rascunho - Viagem Litoral",
      stopCount: 6,
      createdAt: "2024-01-21",
      status: "draft",
      description: "Planejamento de viagem para o litoral",
      estimatedDuration: "3h 45min",
      totalDistance: "85.7 km",
      isFavorite: false,
      lastModified: "2024-01-21T11:30:00",
    },
  ];

  const statusConfig = {
    active: { label: "Ativa", color: "text-green-600" },
    scheduled: { label: "Agendada", color: "text-blue-600" },
    draft: { label: "Rascunho", color: "text-yellow-600" },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || route.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRouteAction = (
    route: RouteData,
    action: "details" | "settings",
  ) => {
    setSelectedRoute(route);
    setViewMode(action);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRoute(null);
  };

  if (viewMode === "details" && selectedRoute) {
    return (
      <RouteDetailsPage
        route={selectedRoute}
        onBack={handleBackToList}
        onOpenSettings={() => setViewMode("settings")}
      />
    );
  }

  if (viewMode === "settings" && selectedRoute) {
    return (
      <RouteSettingsPage
        route={selectedRoute}
        onBack={handleBackToList}
        onSave={(updatedRoute) => {
          // Aqui você salvaria as alterações
          console.log("Salvando alterações:", updatedRoute);
          handleBackToList();
        }}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-4 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold">Rotas</h1>
                <p className="text-gray-300 text-xs">
                  Gerenciamento de rotas criadas
                </p>
              </div>
              <button
                onClick={openRouteModal}
                className="bg-primary/20 hover:bg-primary/30 p-2 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card/20 border border-border/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm"
                  placeholder="Buscar rotas..."
                />
              </div>

              <div className="flex space-x-2">
                {["all", "active", "scheduled", "draft"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedFilter === filter
                        ? "bg-primary/20 text-white border border-primary/30"
                        : "bg-card/20 text-gray-300 hover:bg-card/30"
                    }`}
                  >
                    {filter === "all"
                      ? "Todas"
                      : filter === "active"
                        ? "Ativas"
                        : filter === "scheduled"
                          ? "Agendadas"
                          : "Rascunhos"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Routes Accordion */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Suas Rotas ({filteredRoutes.length})
            </h3>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma rota encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tente ajustar sua busca"
                  : "Crie sua primeira rota para começar"}
              </p>
              <button
                onClick={openRouteModal}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Criar Nova Rota</span>
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredRoutes.map((route) => (
                <AccordionItem
                  key={route.id}
                  value={`route-${route.id}`}
                  className="bg-card rounded-xl border border-l-4 border-l-primary border-border relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

                  <AccordionTrigger className="px-4 py-3 hover:no-underline relative z-10">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <RouteIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">
                              {route.name}
                            </h4>
                            <span
                              className={`text-xs font-medium ${statusConfig[route.status].color}`}
                            >
                              {statusConfig[route.status].label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{route.stopCount} paradas</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {route.scheduledDate
                                  ? `Agendada: ${formatDateTime(route.scheduledDate)}`
                                  : `Criada: ${formatDate(route.createdAt)}`}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 relative z-10">
                    <div className="pt-3 border-t border-border space-y-4">
                      {/* Route Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Distância Total
                          </p>
                          <p className="font-medium text-foreground">
                            {route.totalDistance}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Última Modificação
                          </p>
                          <p className="font-medium text-foreground">
                            {formatDateTime(route.lastModified)}
                          </p>
                        </div>
                      </div>

                      {route.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Descrição
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {route.description}
                          </p>
                        </div>
                      )}

                      {route.linkedSet && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Conjunto Vinculado
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Link className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                              {route.linkedSet}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => handleRouteAction(route, "details")}
                          className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </button>
                        <button
                          onClick={() => handleRouteAction(route, "settings")}
                          className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>

      {/* Route Configuration Modal */}
      <RouteConfigurationModal
        isOpen={isRouteModalOpen}
        onClose={closeRouteModal}
      />
    </div>
  );
};

export default RoutesPage;
