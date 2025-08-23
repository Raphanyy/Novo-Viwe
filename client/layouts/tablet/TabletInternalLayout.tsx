import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTraceRoute } from "../../contexts/TraceRouteContext";
import FinalSummaryModal from "../../components/shared/FinalSummaryModal";
import {
  Home,
  Map,
  Route,
  Settings,
  Activity,
  Bell,
  Sliders,
  Menu,
  X,
  LogOut,
  User,
  Rocket,
  ArrowLeft,
  Navigation,
  Target,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

const TabletInternalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
      icon: Navigation,
      action: "trace",
    },
    {
      name: "Controle",
      icon: Target,
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
      icon: Target,
      action: "configure",
    },
    {
      name: "Traçar",
      icon: Navigation,
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
    }
  };

  const getCurrentNavigationItems = () => {
    if (isMapPage) {
      if (traceState.isInPreparation) {
        return preparationNavigationItems;
      } else if (traceState.isTracing) {
        return traceNavigationItems;
      } else {
        return mapNavigationItems;
      }
    }
    return null;
  };

  return (
    <div
      className="h-screen bg-gray-50 flex font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Collapsible Sidebar for Tablet */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Rocket className="h-6 w-6 text-blue-600" />
                {isSidebarOpen && (
                  <span className="font-bold text-lg ml-2 text-gray-900">
                    Viwe
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    title={!isSidebarOpen ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isSidebarOpen && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                    {!isSidebarOpen && active && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center w-full p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
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
                {isSidebarOpen && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                    isSidebarOpen ? "left-0 right-0" : "left-full ml-2 w-48"
                  }`}
                >
                  <Link
                    to="/app/ajustes"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
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
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Page Title */}
        <header
          className="fixed top-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4"
          style={{ left: isSidebarOpen ? "256px" : "64px" }}
        >
          <div className="flex items-center justify-between">
            {getCurrentNavigationItems() ? (
              // Map-specific header (dynamic based on trace state)
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getCurrentPageName()}
                </h1>
                <div className="flex items-center space-x-2">
                  {getCurrentNavigationItems()!.map((item) => {
                    const Icon = item.icon;
                    const isBackButton = item.action === "back";

                    return isBackButton ? (
                      <Link
                        key={item.action}
                        to="/app"
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          {item.name}
                        </span>
                      </Link>
                    ) : (
                      <button
                        key={item.action}
                        onClick={() => handleMapNavigation(item.action)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Default header
              <>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getCurrentPageName()}
                </h1>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3">
                  <Link
                    to="/app/notificacoes"
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden pt-[81px]">
          <Outlet />
        </main>
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Final Summary Modal */}
      <FinalSummaryModal
        isOpen={traceState.showFinalSummaryModal}
        onClose={closeFinalSummaryModal}
        onSaveAndComplete={saveAndCompleteRoute}
      />
    </div>
  );
};

export default TabletInternalLayout;
