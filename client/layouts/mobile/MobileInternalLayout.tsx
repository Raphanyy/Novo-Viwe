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
      icon: Settings,
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

  const {
    state: traceState,
    startTracing,
    addStop,
    removeLastStop,
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

  const mapNavigationItems = [
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
      name: "Controle",
      icon: Gamepad2,
      action: "control",
    },
    {
      name: "Resumo",
      icon: FileText,
      action: "summary",
    },
  ];

  const traceNavigationItems = [
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
      name: "Traçar",
      icon: Compass,
      action: "trace_execute",
    },
  ];

  const preparationNavigationItems = [
    {
      name: "Cancelar",
      icon: X,
      action: "cancel",
    },
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
      name: "Traçar",
      icon: Navigation,
      action: "trace_execute",
    },
  ];

  // Nova navbar para rota confirmada: "Navegar" e "Desistir"
  const traceConfirmedNavigationItems = [
    {
      name: "Desistir",
      icon: X,
      action: "give_up",
    },
    {
      name: "Navegar",
      icon: Navigation,
      action: "start_navigation",
    },
  ];

  // Nova navbar para navegação ativa: "Concluir Parada", "Otimizar", "Detalhes", "Ajustes"
  const activeNavigationItems = [
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

  // Nova navbar para todas as paradas concluídas: "Resumo" e "Encerrar"
  const finalSummaryNavigationItems = [
    {
      name: "Resumo",
      icon: Trophy,
      action: "show_summary",
    },
    {
      name: "Encerrar",
      icon: Save,
      action: "save_and_complete",
    },
  ];

  const handleMapNavigation = async (action: string) => {
    switch (action) {
      case "back":
        // Volta ao navbar principal - não faz nada, apenas deixa a página do mapa
        break;
      case "trace":
        startTracing();
        break;
      case "control":
        // Função ainda não definida
        console.log("Controle pressed");
        break;
      case "summary":
        // Função ainda não definida
        console.log("Resumo pressed");
        break;
      case "add":
        // Adiciona uma parada no centro do mapa
        if (traceState.centerPin) {
          await addStop(
            traceState.centerPin.coordinates,
            `Parada ${traceState.stops.length + 1}`,
          );
        }
        break;
      case "clear":
        removeLastStop();
        break;
      case "configure":
        openConfiguration();
        break;
      case "trace_execute":
        showTraceConfirmation();
        break;
      case "cancel":
        cancelTrace();
        break;
      case "give_up":
        giveUpNavigation();
        break;
      case "start_navigation":
        startActiveNavigation();
        break;
      case "complete_stop":
        completeCurrentStop();
        break;
      case "optimize":
        await optimizeRoute();
        break;
      case "details":
        openDetailsModal();
        break;
      case "settings":
        openAdjustmentsModal();
        break;
      case "show_summary":
        openFinalSummaryModal();
        break;
      case "save_and_complete":
        saveAndCompleteRoute();
        break;
    }
  };

  const getCurrentNavigationItems = () => {
    if (isMapPage) {
      // Prioridade: todas paradas concluídas > navegação ativa > rota confirmada > preparação > traçamento > padrão
      if (traceState.allStopsCompleted) {
        return finalSummaryNavigationItems;
      } else if (traceState.isInActiveNavigation) {
        return activeNavigationItems;
      } else if (traceState.showTraceConfirmed) {
        return traceConfirmedNavigationItems;
      } else if (traceState.isInPreparation) {
        return preparationNavigationItems;
      } else if (traceState.isTracing) {
        return traceNavigationItems;
      } else {
        return mapNavigationItems;
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
            className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 hover:bg-muted"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium truncate text-muted-foreground">
              {item.name}
            </span>
          </Link>
        ) : (
          <button
            key={item.action}
            onClick={() => handleMapNavigation(item.action)}
            className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 hover:bg-muted"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium truncate text-muted-foreground">
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
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              active ? "bg-blue-50" : "hover:bg-muted"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                active ? "text-blue-600" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium truncate ${
                active ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </span>
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Rocket className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg ml-2 text-foreground">Viwe</span>
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
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
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

      {/* Main Content - Optimized for mobile */}
      <main className="flex-1 overflow-hidden bg-background pt-[73px] pb-[73px]">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {renderBottomNavigation()}
        </div>
      </nav>

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
