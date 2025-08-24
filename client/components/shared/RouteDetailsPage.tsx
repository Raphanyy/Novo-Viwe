import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Share2,
  Edit3,
  Trash2,
  Link,
  Star,
  Navigation,
  Copy,
  Download,
  Settings,
  Play,
  Pause,
  MoreVertical,
  Route as RouteIcon,
  Target,
  AlertTriangle,
} from "lucide-react";

interface RouteData {
  id: number;
  name: string;
  stopCount: number;
  createdAt: string;
  scheduledDate?: string;
  status: "active" | "scheduled" | "draft";
  description?: string;
  estimatedDuration: string;
  totalDistance: string;
  isFavorite: boolean;
  linkedSet?: string;
  lastModified: string;
}

interface RouteDetailsPageProps {
  route: RouteData;
  onBack: () => void;
  onOpenSettings: () => void;
}

const RouteDetailsPage: React.FC<RouteDetailsPageProps> = ({
  route,
  onBack,
  onOpenSettings,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const statusConfig = {
    active: { label: "Ativa", color: "text-green-600 bg-green-100", icon: Play },
    scheduled: { label: "Agendada", color: "text-blue-600 bg-blue-100", icon: Calendar },
    draft: { label: "Rascunho", color: "text-yellow-600 bg-yellow-100", icon: Edit3 }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const handleShare = (type: "link" | "copy" | "export") => {
    switch (type) {
      case "link":
        navigator.share?.({
          title: route.name,
          text: `Confira esta rota: ${route.description}`,
          url: window.location.href,
        });
        break;
      case "copy":
        navigator.clipboard.writeText(window.location.href);
        break;
      case "export":
        // Lógica para exportar rota
        console.log("Exportando rota...");
        break;
    }
    setShowShareOptions(false);
  };

  const handleDelete = () => {
    // Lógica para excluir rota
    console.log("Excluindo rota:", route.id);
    setShowDeleteConfirm(false);
    onBack();
  };

  const handleToggleFavorite = () => {
    // Lógica para favoritar/desfavoritar
    console.log("Toggle favorite:", route.id);
  };

  const handleLinkToSet = () => {
    // Lógica para vincular a conjunto
    console.log("Vincular a conjunto:", route.id);
  };

  const handleStartNavigation = () => {
    // Lógica para iniciar navegação
    console.log("Iniciando navegação:", route.id);
  };

  const StatusIcon = statusConfig[route.status].icon;

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-4 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-card/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold">{route.name}</h1>
                  {route.isFavorite && (
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  )}
                </div>
                <p className="text-gray-300 text-sm">Detalhes e configurações</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig[route.status].color}`}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusConfig[route.status].label}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Overview */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Visão Geral</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Paradas</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{route.stopCount} paradas</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duração Estimada</p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{route.estimatedDuration}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Distância Total</p>
                <div className="flex items-center space-x-2">
                  <RouteIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{route.totalDistance}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {route.scheduledDate ? "Agendada para" : "Criada em"}
                </p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">
                    {route.scheduledDate 
                      ? formatDateTime(route.scheduledDate)
                      : formatDateTime(route.createdAt)
                    }
                  </span>
                </div>
              </div>
            </div>

            {route.description && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-foreground">{route.description}</p>
              </div>
            )}

            {route.linkedSet && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Vinculada ao conjunto:</span>
                  <span className="font-medium text-primary">{route.linkedSet}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Actions */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ações Principais</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleStartNavigation}
                className="w-full bg-primary text-primary-foreground p-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center space-x-3"
              >
                <Navigation className="h-5 w-5" />
                <span className="font-semibold">Iniciar Navegação</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                    route.isFavorite 
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Star className={`h-4 w-4 ${route.isFavorite ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">
                    {route.isFavorite ? "Desfavoritar" : "Favoritar"}
                  </span>
                </button>

                <button
                  onClick={onOpenSettings}
                  className="bg-secondary text-secondary-foreground p-3 rounded-xl hover:bg-secondary/80 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Configurações</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ações Secundárias</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="w-full bg-blue-50 text-blue-700 p-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Compartilhar</span>
                </button>

                {showShareOptions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => handleShare("link")}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-lg text-sm flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Compartilhar Link</span>
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-lg text-sm flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copiar Link</span>
                      </button>
                      <button
                        onClick={() => handleShare("export")}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-lg text-sm flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Exportar Rota</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLinkToSet}
                className="bg-purple-50 text-purple-700 p-3 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span className="text-sm font-medium">Vincular Conjunto</span>
              </button>

              <button
                className="bg-green-50 text-green-700 p-3 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span className="text-sm font-medium">Duplicar</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-50 text-red-700 p-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Excluir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Excluir Rota</h3>
                  <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-6">
                Tem certeza que deseja excluir a rota <strong>"{route.name}"</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>
    </div>
  );
};

export default RouteDetailsPage;
