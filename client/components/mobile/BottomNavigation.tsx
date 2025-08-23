import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, Route, Activity, Sliders } from "lucide-react";

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const navigationItems: NavigationItem[] = [
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
    name: "Atividade",
    path: "/app/atividade",
    icon: Activity,
    color: "text-red-600",
  },
  {
    name: "Opções",
    path: "/app/opcoes",
    icon: Sliders,
    color: "text-yellow-600",
  },
];

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  className = "",
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname === path;
  };

  return (
    <nav
      className={`bg-white border-t border-gray-200 safe-area-bottom ${className}`}
    >
      <div className="px-2 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  active ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-blue-600" : "text-gray-600"
                  }`}
                />
                <span
                  className={`text-xs font-medium truncate ${
                    active ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
