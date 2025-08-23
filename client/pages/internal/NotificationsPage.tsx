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
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

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
      details:
        "Acidente detectado na Av. Paulista altura 1500. Desvio pela Rua Augusta economiza 12 minutos.",
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
      details:
        "Nova rota Casa→Trabalho economiza 8 minutos e 2km. Evita 3 semáforos principais do trajeto atual.",
      time: "1h atrás",
      read: false,
      icon: Route,
      color: "text-green-600 bg-green-100",
      route: "Casa → Trabalho",
      actionable: true,
    },
    {
      id: 3,
      type: "scheduled",
      title: "Lembrete de Viagem",
      message:
        "Sua viagem para o aeroporto está agendada para amanhã às 15:00.",
      details:
        "Viagem de 45 min para aeroporto. Saia às 14:00 com folga. Trânsito normal previsto para amanhã.",
      time: "3h atrás",
      read: true,
      icon: Calendar,
      color: "text-blue-600 bg-blue-100",
      route: "Casa → Aeroporto",
      actionable: true,
    },
    {
      id: 4,
      type: "achievement",
      title: "Meta Atingida!",
      message: "Você economizou 2 horas de trânsito este mês!",
      details:
        "Economizou 2h14min e R$ 45,30 em combustível este mês com rotas inteligentes. Parabéns!",
      time: "1 dia atrás",
      read: true,
      icon: Star,
      color: "text-yellow-600 bg-yellow-100",
      route: null,
      actionable: false,
    },
    {
      id: 5,
      type: "system",
      title: "Atualização Disponível",
      message: "Nova versão do app com melhorias na navegação.",
      details:
        "Versão 2.1.5 disponível: correções, GPS melhorado e economia de bateria. Atualização em 2 min.",
      time: "2 dias atrás",
      read: true,
      icon: Info,
      color: "text-purple-600 bg-purple-100",
      route: null,
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
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "unread") return !notification.read;
    return notification.type === selectedFilter;
  });

  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id],
    );
  };

  const markAsRead = (id: number) => {
    // Implementar lógica para marcar como lida
    console.log("Marcar como lida:", id);
  };

  const markAsUnread = (id: number) => {
    // Implementar lógica para marcar como não lida
    console.log("Marcar como não lida:", id);
  };

  const deleteNotification = (id: number) => {
    // Implementar lógica para deletar
    console.log("Deletar notificação:", id);
  };

  const archiveNotification = (id: number) => {
    // Implementar lógica para arquivar
    console.log("Arquivar notificação:", id);
  };

  const deleteSelected = () => {
    selectedNotifications.forEach(deleteNotification);
    setSelectedNotifications([]);
  };

  const renderActionButtons = (notification: any) => {
    if (!notification.actionable) return null;

    return (
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap">
          Ação Principal
        </button>
        <button className="text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors duration-200 border border-border whitespace-nowrap">
          Ver Detalhes
        </button>
        <button className="text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors duration-200 border border-border whitespace-nowrap">
          Dispensar
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-muted rounded-xl transition-colors duration-200">
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
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm font-medium">{filter.name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedFilter === filter.id ? "bg-blue-200" : "bg-border"
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
      <div className="flex-1 overflow-auto p-3">
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
          <Accordion type="single" collapsible className="space-y-2">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              const isSelected = selectedNotifications.includes(
                notification.id,
              );

              return (
                <AccordionItem
                  key={notification.id}
                  value={`item-${notification.id}`}
                  className={`bg-card rounded-xl border border-l-4 transition-all duration-200 relative overflow-hidden ${
                    !notification.read
                      ? "border-l-green-500"
                      : "border-l-blue-500"
                  } ${
                    isSelected
                      ? `ring-2 ${!notification.read ? "ring-green-500" : "ring-blue-500"}`
                      : ""
                  }`}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 pointer-events-none rounded-xl ${
                      !notification.read
                        ? "bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent"
                        : "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent"
                    }`}
                  />

                  <AccordionTrigger className="hover:no-underline px-3 py-2 justify-start relative z-10">
                    <div className="flex items-center space-x-3 w-full">
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg ${notification.color} flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Title Only */}
                      <h3
                        className={`font-semibold text-left flex-1 ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {notification.title}
                      </h3>

                      {/* Status indicator */}
                      {!notification.read && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
                          Novo
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 relative z-10">
                    {/* Main Content */}
                    <div className="space-y-4">
                      {/* Detailed message */}
                      <p className="text-sm text-foreground leading-relaxed">
                        {notification.details.length > 100
                          ? notification.details.substring(0, 100) + "..."
                          : notification.details}
                      </p>

                      {/* Action buttons and time */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Action buttons */}
                        <div className="flex-shrink-0">
                          {renderActionButtons(notification)}
                        </div>

                        {/* Time */}
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-6 sm:hidden"></div>
    </div>
  );
};

export default NotificationsPage;
