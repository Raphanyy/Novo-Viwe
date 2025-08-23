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
  LogOut,
  User,
  Rocket,
  ChevronDown,
  Search,
  HelpCircle,
  Plus,
} from "lucide-react";
import RouteConfigurationModal from "../../components/shared/RouteConfigurationModal";
import { useRouteModal } from "../../hooks/use-route-modal";

const DesktopInternalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isRouteModalOpen, openRouteModal, closeRouteModal } = useRouteModal();
  const {
    state: traceState,
    openFinalSummaryModal,
    closeFinalSummaryModal,
    saveAndCompleteRoute,
  } = useTraceRoute();

  const navigationItems = [
    {
      name: "Início",
      path: "/app",
      icon: Home,
      color: "text-blue-600",
      description: "Painel principal",
    },
    {
      name: "Mapa",
      path: "/app/mapa",
      icon: Map,
      color: "text-green-600",
      description: "Visualização de mapas",
    },
    {
      name: "Rotas",
      path: "/app/rotas",
      icon: Route,
      color: "text-purple-600",
      description: "Gerenciamento de rotas",
    },
    {
      name: "Menu",
      path: "/app/ajustes",
      icon: Plus,
      color: "text-orange-600",
      description: "Configurações do sistema",
    },
    {
      name: "Atividade",
      path: "/app/atividade",
      icon: Activity,
      color: "text-red-600",
      description: "Histórico de atividades",
    },
    {
      name: "Notas",
      path: "/app/notificacoes",
      icon: Bell,
      color: "text-pink-600",
      description: "Central de notificações",
    },
    {
      name: "Perfil",
      path: "/app/opcoes",
      icon: User,
      color: "text-indigo-600",
      description: "Configurações do perfil",
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

  const getCurrentPageDescription = () => {
    const currentItem = navigationItems.find(
      (item) =>
        item.path === location.pathname ||
        (item.path === "/app" && location.pathname === "/app"),
    );
    return currentItem?.description || "";
  };

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname === path;
  };

  const shouldShowHeader = location.pathname === "/app";

  return (
    <div
      className="h-screen bg-background flex font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Persistent Sidebar for Desktop */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center">
            <Rocket className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="font-bold text-xl text-foreground">Viwe</h1>
              <p className="text-xs text-muted-foreground">Route Planner</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative ${
                    active
                    ? "text-blue-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="sr-only">{item.name}</span>
                  {active && (
                    <div className="absolute right-3 w-1 h-8 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-border">
          <Link
            to="/help"
            className="flex items-center justify-center p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
            title="Ajuda & Suporte"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Ajuda & Suporte</span>
          </Link>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-muted transition-colors duration-200"
              title={user?.name}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <span className="sr-only">{user?.name}</span>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    to="/app/ajustes"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configurações
                  </Link>

                  <Link
                    to="/app/notificacoes"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Notificações
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      3
                    </span>
                  </Link>

                  <hr className="my-2" />

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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Breadcrumb and Actions */}
        {shouldShowHeader && (
          <header className="bg-card border-b border-border px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {getCurrentPageName()}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCurrentPageDescription()}
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                <Link
                  to="/app/notificacoes"
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </Link>

                <button
                  onClick={openRouteModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Nova Rota
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content with Padding */}
        <main className="flex-1 overflow-hidden bg-background">
          <div
            className={`h-full overflow-y-auto ${
              shouldShowHeader ? "p-8" : "p-0"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Modal de Configuração de Rotas */}
      <RouteConfigurationModal
        isOpen={isRouteModalOpen}
        onClose={closeRouteModal}
      />

      {/* Final Summary Modal */}
      <FinalSummaryModal
        isOpen={traceState.showFinalSummaryModal}
        onClose={closeFinalSummaryModal}
        onSaveAndComplete={saveAndCompleteRoute}
      />
    </div>
  );
};

export default DesktopInternalLayout;
