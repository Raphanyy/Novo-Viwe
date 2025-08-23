import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Bell, LogOut, User, Rocket, Settings } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  className = "",
}) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex items-center flex-shrink-0">
            <Rocket className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg ml-2 text-gray-900">Viwe</span>
          </div>

          <div className="w-px h-6 bg-gray-300 flex-shrink-0"></div>

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Quick Notifications */}
          <Link
            to="/app/notificacoes"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Link>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 transition-colors duration-200"
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
              <>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
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

                    <Link
                      to="/app/notificacoes"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Notificações
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        3
                      </span>
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

                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-20 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
