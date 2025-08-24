import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import NavigationDetailsModal from "../../components/shared/NavigationDetailsModal";
import NavigationAdjustmentsModal from "../../components/shared/NavigationAdjustmentsModal";
import FinalSummaryModal from "../../components/shared/FinalSummaryModal";
import {
  Home,
  Map,
  Route,
  Settings,
  Activity,
  Bell,
  Sliders,
  LogOut,
  User,
  Rocket,
  ArrowLeft,
  Navigation,
  Target,
  FileText,
  Plus,
  Trash2,
  X,
  Zap,
  Trophy,
  Save,
  Gamepad2,
  Cog,
  Compass,
  PenTool,
  Menu,
} from "lucide-react";

const MobileInternalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: "Início",
      path: "/app",
      icon: Home,
      color: "text-blue-600",
    },
    {
      name: "Mapa",
      path: "/app/mapa",
      icon: Map,
      color: "text-green-600",
    },
    {
      name: "Rotas",
      path: "/app/rotas",
      icon: Route,
      color: "text-purple-600",
    },
    {
      name: "Menu",
      path: "/app/ajustes",
      icon: Plus,
      color: "text-orange-600",
    },
    {
      name: "Atividade",
      path: "/app/atividade",
      icon: Activity,
      color: "text-red-600",
    },
    {
      name: "Notas",
      path: "/app/notificacoes",
      icon: Bell,
      color: "text-pink-600",
    },
    {
      name: "Perfil",
      path: "/app/opcoes",
      icon: User,
      color: "text-indigo-600",
    },
  ];

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(
      (item) =>
        item.path === location.pathname ||
        (item.path === "/app" && location.pathname === "/app"),
    );
    return currentItem?.name || "Viwe";
  };

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname === path;
  };

  const isMapPage = location.pathname === "/app/mapa";
  const shouldShowHeader = location.pathname === "/app";

  const {
    state: traceState,
    startTracing,
    addStop,
    removeLastStop,
    clearAllStops,
    openConfiguration,
    showTraceConfirmation,
    cancelTrace,
    giveUpNavigation,
    startActiveNavigation,
    stopActiveNavigation,
    completeCurrentStop,
    optimizeRoute,
    openDetailsModal,
    closeDetailsModal,
    openAdjustmentsModal,
    closeAdjustmentsModal,
    openFinalSummaryModal,
    closeFinalSummaryModal,
    saveAndCompleteRoute,
  } = useTraceRoute();

  // === ESTADOS DA NAVBAR DO MAPA ===
  // Seguindo lógica contextual: Exploração > Planejamento > Navegação > Finalização

  // 1. EXPLORAÇÃO - Estado inicial do mapa
  const explorationNavigationItems = [
    {
      name: "Voltar",
      icon: ArrowLeft,
      action: "back",
    },
    {
      name: "Traçar",
      icon: PenTool,
      action: "trace",
    },
    {
      name: "Rotas",
      icon: Route,
      action: "summary",
    },
    {
      name: "Configurar",
      icon: Cog,
      action: "control",
    },
  ];

  // 2a. PLANEJAMENTO INICIAL - Adicionando primeiras paradas
  const planningNavigationItems = [
    {
      name: "Adicionar",
      icon: Plus,
      action: "add",
    },
    {
      name: "Limpar",
      icon: Trash2,
      action: "clear",
    },
    {
      name: "Configurar",
      icon: Cog,
      action: "configure",
    },
    {
      name: "Cancelar",
      icon: X,
      action: "cancel",
    },
  ];

  // 2b. PLANEJAMENTO PRONTO - Com 2+ paradas, pronto para traçar
  const planningReadyNavigationItems = [
    {
      name: "Adicionar",
      icon: Plus,
      action: "add",
    },
    {
      name: "Limpar",
      icon: Trash2,
      action: "clear",
    },
    {
      name: "Finalizar",
      icon: Navigation,
      action: "finalize_planning",
    },
    {
      name: "Cancelar",
      icon: X,
      action: "cancel",
    },
  ];

  // 2.5. ROTA TRAÇADA - Pronto para navegar
  const routeTracedNavigationItems = [
    {
      name: "Cancelar",
      icon: X,
      action: "give_up",
    },
    {
      name: "Navegar",
      icon: Navigation,
      action: "start_navigation",
    },
  ];

  // 3. NAVEGAÇÃO - Rota ativa em andamento
  const navigationNavigationItems = [
    {
      name: "Concluir",
      icon: Target,
      action: "complete_stop",
    },
    {
      name: "Otimizar",
      icon: Zap,
      action: "optimize",
    },
    {
      name: "Detalhes",
      icon: FileText,
      action: "details",
    },
    {
      name: "Ajustes",
      icon: Sliders,
      action: "settings",
    },
  ];

  // 4. FINALIZAÇÃO - Conclusão e salvamento
  const finalizationNavigationItems = [
    {
      name: "Resumo",
      icon: Trophy,
      action: "show_summary",
    },
    {
      name: "Salvar",
      icon: Save,
      action: "save_and_complete",
    },
  ];

  const handleMapNavigation = async (action: string) => {
    switch (action) {
      case "back":
        // Volta ao navbar principal - sai da página do mapa
        break;
      case "trace":
        // Inicia o planejamento da rota
        startTracing();
        break;
      case "control":
        // Abre modal de configurações da rota
        openConfiguration();
        break;
      case "summary":
        // Navega para página de rotas/histórico
        if (traceState.isInActiveNavigation || traceState.allStopsCompleted) {
          openDetailsModal();
        } else {
          // Redireciona para página de rotas
          window.location.href = "/app/rotas";
        }
        break;
      case "add":
        // PLANEJAMENTO: Adiciona uma nova parada na posição atual do mapa
        if (traceState.centerPin) {
          await addStop(
            traceState.centerPin.coordinates,
            `Parada ${traceState.stops.length + 1}`,
          );
        }
        break;
      case "clear":
        // PLANEJAMENTO: Remove todas as paradas
        clearAllStops();
        break;
      case "configure":
        // Abre configurações avançadas da rota
        openConfiguration();
        break;
      case "finalize_planning":
        // PLANEJAMENTO: Finaliza planejamento e abre confirmação para traçar rota
        if (traceState.stops.length >= 2) {
          showTraceConfirmation();
        } else {
          // Se não tem paradas suficientes, mostrar feedback
          alert("Adicione pelo menos 2 paradas para traçar a rota");
        }
        break;
      case "cancel":
        // PLANEJAMENTO: Cancela o planejamento e volta à exploração
        cancelTrace();
        break;
      case "give_up":
        // Desiste da navegação atual
        giveUpNavigation();
        break;
      case "start_navigation":
        // Inicia navegação ativa da rota
        startActiveNavigation();
        break;
      case "complete_stop":
        // NAVEGAÇÃO: Marca a parada atual como concluída
        completeCurrentStop();
        break;
      case "optimize":
        // NAVEGAÇÃO: Otimiza a ordem das paradas restantes
        await optimizeRoute();
        break;
      case "details":
        // NAVEGAÇÃO: Mostra detalhes da rota e progresso
        openDetailsModal();
        break;
      case "settings":
        // NAVEGAÇÃO: Abre ajustes da navegação ativa
        openAdjustmentsModal();
        break;
      case "show_summary":
        // FINALIZAÇÃO: Mostra resumo completo da rota
        openFinalSummaryModal();
        break;
      case "save_and_complete":
        // FINALIZAÇÃO: Salva e encerra a rota completamente
        saveAndCompleteRoute();
        break;
    }
  };

  const getCurrentNavigationItems = () => {
    if (isMapPage) {
      // Fluxo lógico: Exploração > Planejamento > Rota Traçada > Navegação > Finalização
      if (traceState.allStopsCompleted) {
        // 5. FINALIZAÇÃO - Todas paradas concluídas
        return finalizationNavigationItems;
      } else if (traceState.isInActiveNavigation) {
        // 4. NAVEGAÇÃO - Rota ativa, navegando entre paradas
        return navigationNavigationItems;
      } else if (traceState.showTraceConfirmed && !traceState.isTracing) {
        // 3. ROTA TRAÇADA - Pronto para iniciar navegação
        return routeTracedNavigationItems;
      } else if (traceState.isTracing) {
        // 2. PLANEJAMENTO - Criando rota, adicionando paradas
        if (traceState.stops.length >= 2) {
          return planningReadyNavigationItems;
        } else {
          return planningNavigationItems;
        }
      } else {
        // 1. EXPLORAÇÃO - Estado inicial, explorando mapa
        return explorationNavigationItems;
      }
    }
    // Para outras páginas, retorna null para usar navegação padrão
    return null;
  };

  // Função para renderizar a navegação sempre
  const renderBottomNavigation = () => {
    const mapNavItems = getCurrentNavigationItems();

    if (mapNavItems && isMapPage) {
      // Navegação específica do mapa
      return mapNavItems.map((item) => {
        const Icon = item.icon;
        const isBackButton = item.action === "back";

        return isBackButton ? (
          <Link
            key={item.action}
            to="/app"
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 hover:bg-muted"
          >
            <Icon className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground font-medium">
              {item.name}
            </span>
          </Link>
        ) : (
          <button
            key={item.action}
            onClick={() => handleMapNavigation(item.action)}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 hover:bg-muted"
          >
            <Icon className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground font-medium">
              {item.name}
            </span>
          </button>
        );
      });
    } else {
      // Navegação padrão para todas as outras páginas
      return navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              active ? "" : "hover:bg-muted"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                active ? "text-blue-600" : "text-muted-foreground"
              }`}
            />
          </Link>
        );
      });
    }
  };

  return (
    <div
      className="h-screen bg-background flex flex-col font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Mobile Header - Simplified */}
      {shouldShowHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Rocket className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg ml-2 text-foreground">
                Viwe
              </span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <h1 className="text-lg font-semibold text-foreground">
              {getCurrentPageName()}
            </h1>
          </div>

          {/* Mobile User Menu */}
          <div className="flex items-center space-x-3">
            {/* Quick Notifications */}
            <Link
              to="/app/notificacoes"
              className="p-2 rounded-xl hover:bg-muted transition-colors duration-200 relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Link>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-muted transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </button>

              {/* Mobile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border py-2 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/app/notificacoes"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Notificações
                    </Link>

                    <Link
                      to="/app/ajustes"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configurações
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Optimized for mobile */}
      <main
        className={`flex-1 overflow-hidden bg-background ${
          traceState.showConfigModal
            ? "pb-0"
            : isMapPage
              ? "pb-[85px]"
              : "pb-[73px]"
        } ${shouldShowHeader ? "pt-[73px]" : "pt-0"}`}
      >
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      {!traceState.showConfigModal && (
        <nav
          className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 safe-area-bottom ${
            isMapPage ? "py-3" : "py-2"
          }`}
        >
          <div className="flex items-center justify-around">
            {renderBottomNavigation()}
          </div>
        </nav>
      )}

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation Modals */}
      <NavigationDetailsModal
        isOpen={traceState.showDetailsModal}
        onClose={closeDetailsModal}
      />

      <NavigationAdjustmentsModal
        isOpen={traceState.showAdjustmentsModal}
        onClose={closeAdjustmentsModal}
      />

      <FinalSummaryModal
        isOpen={traceState.showFinalSummaryModal}
        onClose={closeFinalSummaryModal}
        onSaveAndComplete={saveAndCompleteRoute}
      />
    </div>
  );
};

export default MobileInternalLayout;
