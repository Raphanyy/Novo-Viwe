import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
} from "lucide-react";

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/app",
    icon: Home,
    color: "text-blue-600",
    description: "Visão geral da aplicação",
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
    name: "Perfil",
    path: "/app/opcoes",
    icon: User,
    color: "text-yellow-600",
    description: "Configurações do perfil",
  },
  {
    name: "Atividade",
    path: "/app/atividade",
    icon: Activity,
    color: "text-red-600",
    description: "Histórico de atividades",
  },
  {
    name: "Notificações",
    path: "/app/notificacoes",
    icon: Bell,
    color: "text-indigo-600",
    description: "Central de notificações",
  },
];

interface DesktopSidebarProps {
  className?: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`w-64 bg-card border-r border-border flex flex-col ${className}`}
    >
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
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
                {active && (
                  <div className="absolute right-3 w-1 h-8 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/help"
          className="flex items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="ml-3 font-medium">Ajuda & Suporte</span>
        </Link>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center w-full p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="ml-3 text-left min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <>
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    to="/app/ajustes"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configurações
                  </Link>

                  <Link
                    to="/app/notificacoes"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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

              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black bg-opacity-10 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
