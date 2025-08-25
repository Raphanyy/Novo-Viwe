import React, { useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  X,
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
import { notificationsService, NotificationData } from "../../services/api";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "traffic":
        return AlertTriangle;
      case "route":
        return Route;
      case "scheduled":
        return Calendar;
      case "achievement":
        return Star;
      default:
        return Info;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "unread") return !notification.read;
    return notification.type === selectedFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-foreground">Carregando notificações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="text-destructive mb-4 text-center">
          <p className="text-xl font-semibold">Erro ao carregar notificações</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600">
            Marcar todas como lidas
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
              selectedFilter === "all"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span className="text-sm font-medium">Todas</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedFilter === "all" ? "bg-blue-200" : "bg-border"
              }`}
            >
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => setSelectedFilter("unread")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
              selectedFilter === "unread"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span className="text-sm font-medium">Não lidas</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedFilter === "unread" ? "bg-blue-200" : "bg-border"
              }`}
            >
              {notifications.filter((n) => !n.read).length}
            </span>
          </button>
        </div>
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
              const Icon = getIcon(notification.type);
              return (
                <AccordionItem
                  key={notification.id}
                  value={`item-${notification.id}`}
                  className={`bg-card rounded-xl border border-l-4 transition-all duration-200 relative overflow-hidden ${
                    !notification.read
                      ? "border-l-green-500"
                      : "border-l-blue-500"
                  }`}
                >
                  <AccordionTrigger className="hover:no-underline px-3 py-2 justify-start relative z-10">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <h3
                          className={`font-semibold text-left ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {new Date(notification.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      {!notification.read && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          Novo
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 relative z-10">
                    <div className="space-y-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex justify-start gap-2">
                        {!notification.read && (
                          <button onClick={() => handleMarkAsRead(notification.id)} className="text-sm text-blue-600">
                            Marcar como lida
                          </button>
                        )}
                        <button onClick={() => handleDelete(notification.id)} className="text-sm text-red-600">
                          Excluir
                        </button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
