import React, { useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  X,
  Clock,
  MapPin,
  Route,
  AlertTriangle,
  Info,
  Star,
  Calendar,
  Car,
  Zap,
  Filter,
  MoreVertical,
  Trash2,
  Archive,
  Settings,
} from "lucide-react";

const NotificationsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    [],
  );

  // Notificações mockadas
  const notifications = [
    {
      id: 1,
      type: "traffic",
      title: "Alerta de Trânsito",
      message:
        "Congestionamento detectado na Av. Paulista. Rota alternativa disponível com economia de 12 minutos.",
      time: "2 min atrás",
      read: false,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
      route: "Casa → Trabalho",
      actionable: true,
    },
    {
      id: 2,
      type: "route",
      title: "Nova Rota Otimizada",
      message:
        "Encontramos uma rota 15% mais eficiente para sua viagem recorrente Casa → Trabalho.",
      time: "1h atrás",
      read: false,
      icon: Route,
      color: "text-blue-600 bg-blue-100",
      route: "Casa → Trabalho",
      actionable: true,
    },
    {
      id: 3,
      type: "achievement",
      title: "Conquista Desbloqueada! 🏆",
      message:
        "Parabéns! Você alcançou a marca de 50 viagens realizadas. Continue assim!",
      time: "3h atrás",
      read: true,
      icon: Star,
      color: "text-yellow-600 bg-yellow-100",
      actionable: false,
    },
    {
      id: 4,
      type: "scheduled",
      title: "Lembrete de Viagem",
      message:
        "Sua viagem para o Aeroporto está agendada para amanhã às 14:30. Verificar trânsito?",
      time: "5h atrás",
      read: true,
      icon: Calendar,
      color: "text-purple-600 bg-purple-100",
      route: "Casa → Aeroporto",
      actionable: true,
    },
    {
      id: 5,
      type: "fuel",
      title: "Alerta de Combustível",
      message:
        "Posto de gasolina com preço 8% menor encontrado no seu caminho usual.",
      time: "1 dia atrás",
      read: true,
      icon: Car,
      color: "text-green-600 bg-green-100",
      actionable: true,
    },
    {
      id: 6,
      type: "update",
      title: "Atualização Disponível",
      message:
        "Nova versão do Viwe disponível com melhorias na precisão de rotas.",
      time: "2 dias atrás",
      read: true,
      icon: Info,
      color: "text-muted-foreground bg-gray-100",
      actionable: true,
    },
  ];

  const filters = [
    { id: "all", name: "Todas", count: notifications.length },
    {
      id: "unread",
      name: "Não lidas",
      count: notifications.filter((n) => !n.read).length,
    },
    {
      id: "traffic",
      name: "Trânsito",
      count: notifications.filter((n) => n.type === "traffic").length,
    },
    {
      id: "route",
      name: "Rotas",
      count: notifications.filter((n) => n.type === "route").length,
    },
    {
      id: "achievement",
      name: "Conquistas",
      count: notifications.filter((n) => n.type === "achievement").length,
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "unread") return !notification.read;
    return notification.type === selectedFilter;
  });

  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((notifId) => notifId !== id)
        : [...prev, id],
    );
  };

  const markAllAsRead = () => {
    // Implementar lógica para marcar todas como lidas
    console.log("Marcar todas como lidas");
  };

  const deleteSelected = () => {
    // Implementar lógica para deletar selecionadas
    console.log("Deletar selecionadas:", selectedNotifications);
    setSelectedNotifications([]);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200"
            >
              Marcar todas como lidas
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                selectedFilter === filter.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
              }`}
            >
              <span className="text-sm font-medium">{filter.name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedFilter === filter.id ? "bg-blue-200" : "bg-gray-200"
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-2xl flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedNotifications.length} selecionada(s)
            </span>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <Archive className="h-4 w-4 text-blue-600" />
              </button>
              <button
                onClick={deleteSelected}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BellOff className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
            <p className="text-sm text-center">
              {selectedFilter === "unread"
                ? "Todas as notificações foram lidas!"
                : "Você está em dia com suas notificações."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              const isSelected = selectedNotifications.includes(
                notification.id,
              );

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl p-4 transition-all duration-200 ${
                    !notification.read ? "border-l-4 border-blue-500" : ""
                  } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() =>
                        toggleNotificationSelection(notification.id)
                      }
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </button>

                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl ${notification.color} flex-shrink-0`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${!notification.read ? "text-foreground" : "text-gray-700"}`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${!notification.read ? "text-gray-700" : "text-muted-foreground"}`}
                          >
                            {notification.message}
                          </p>

                          {notification.route && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Route className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-muted-foreground">
                                {notification.route}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {notification.actionable && (
                        <div className="flex items-center space-x-2 mt-3">
                          {notification.type === "traffic" && (
                            <>
                              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                                Ver rota alternativa
                              </button>
                              <button className="text-muted-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                                Dispensar
                              </button>
                            </>
                          )}

                          {notification.type === "route" && (
                            <>
                              <button className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                                Usar nova rota
                              </button>
                              <button className="text-muted-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                                Ver detalhes
                              </button>
                            </>
                          )}

                          {notification.type === "scheduled" && (
                            <>
                              <button className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors duration-200">
                                Verificar trânsito
                              </button>
                              <button className="text-muted-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                                Adiar lembrete
                              </button>
                            </>
                          )}

                          {notification.type === "fuel" && (
                            <>
                              <button className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                                Ver no mapa
                              </button>
                            </>
                          )}

                          {notification.type === "update" && (
                            <>
                              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                                Atualizar agora
                              </button>
                              <button className="text-muted-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                                Mais tarde
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center space-y-1 p-3 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-200">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">
              Configurar
            </span>
          </button>

          <button className="flex flex-col items-center space-y-1 p-3 bg-background rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filtros</span>
          </button>

          <button className="flex flex-col items-center space-y-1 p-3 bg-background rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Arquivar</span>
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-2 sm:hidden"></div>
    </div>
  );
};

export default NotificationsPage;
