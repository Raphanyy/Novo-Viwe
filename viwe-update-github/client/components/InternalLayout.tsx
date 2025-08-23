import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
} from "lucide-react";

const InternalLayout: React.FC = () => {
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
      name: "Perfil",
      path: "/app/opcoes",
      icon: Sliders,
      color: "text-yellow-600",
    },
    {
      name: "Atividade",
      path: "/app/atividade",
      icon: Activity,
      color: "text-red-600",
    },
    {
      name: "Notificações",
      path: "/app/notificacoes",
      icon: Bell,
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

  return (
    <div
      className="h-screen bg-gray-50 flex flex-col font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Top Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Rocket className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg ml-2 text-foreground hidden sm:block">
              Viwe
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border"></div>
          <h1 className="text-lg font-semibold text-foreground">
            {getCurrentPageName()}
          </h1>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications (mobile) */}
          <Link
            to="/app/notificacoes"
            className="sm:hidden p-2 rounded-xl hover:bg-accent transition-colors duration-200 relative"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Link>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-accent transition-colors duration-200"
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
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {user?.name}
              </span>
              <Menu className="h-4 w-4 text-gray-500 sm:block hidden" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    to="/app/opcoes"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Perfil
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

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bg-card border-t border-border px-2 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
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
          })}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default InternalLayout;
