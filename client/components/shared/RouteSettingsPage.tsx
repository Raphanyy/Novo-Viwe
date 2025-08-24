import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  MapPin,
  Clock,
  Calendar,
  Type,
  FileText,
  Link,
  Star,
  Route as RouteIcon,
  Settings,
  AlertCircle,
  Plus,
  X,
  Target,
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

interface RouteSettingsPageProps {
  route: RouteData;
  onBack: () => void;
  onSave: (updatedRoute: RouteData) => void;
}

const RouteSettingsPage: React.FC<RouteSettingsPageProps> = ({
  route,
  onBack,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: route.name,
    description: route.description || "",
    status: route.status,
    scheduledDate: route.scheduledDate || "",
    isFavorite: route.isFavorite,
    linkedSet: route.linkedSet || "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedRoute: RouteData = {
      ...route,
      ...formData,
      lastModified: new Date().toISOString(),
    };
    onSave(updatedRoute);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      name: route.name,
      description: route.description || "",
      status: route.status,
      scheduledDate: route.scheduledDate || "",
      isFavorite: route.isFavorite,
      linkedSet: route.linkedSet || "",
    });
    setHasChanges(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onBack();
    }
  };

  const statusOptions = [
    {
      value: "active",
      label: "Ativa",
      description: "Rota disponível para uso imediato",
    },
    {
      value: "scheduled",
      label: "Agendada",
      description: "Rota programada para data específica",
    },
    {
      value: "draft",
      label: "Rascunho",
      description: "Rota em desenvolvimento",
    },
  ];

  const availableSets = [
    "Rotas Diárias",
    "Rotas de Trabalho",
    "Rotas de Lazer",
    "Entregas",
    "Viagens",
  ];

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-4 text-white border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-card/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Configurações da Rota</h1>
                <p className="text-gray-300 text-sm">
                  Altere as configurações da rota
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                    Alterações pendentes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <Type className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Informações Básicas
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome da Rota
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="Digite o nome da rota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground resize-none"
                  placeholder="Descreva o propósito desta rota"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status and Schedule */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Status e Agendamento
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status da Rota
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-4 h-4 text-primary border-border focus:ring-primary"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data e Hora Agendada
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      formData.scheduledDate
                        ? new Date(formData.scheduledDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "scheduledDate",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : "",
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-primary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Organização
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) =>
                      handleInputChange("isFavorite", e.target.checked)
                    }
                    className="w-4 h-4 text-primary border-border focus:ring-primary rounded"
                  />
                  <Star
                    className={`h-4 w-4 ${formData.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Marcar como Favorita
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Facilita o acesso rápido à rota
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Conjunto de Rotas
                </label>
                <select
                  value={formData.linkedSet}
                  onChange={(e) =>
                    handleInputChange("linkedSet", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="">Nenhum conjunto</option>
                  {availableSets.map((set) => (
                    <option key={set} value={set}>
                      {set}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Organize suas rotas em conjuntos para melhor gerenciamento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Information (Read-only) */}
        <div className="bg-card rounded-xl p-4 border border-l-4 border-l-secondary border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <RouteIcon className="h-5 w-5 text-secondary" />
              <h3 className="text-lg font-semibold text-foreground">
                Informações da Rota
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Somente leitura
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Paradas</p>
                <p className="font-medium text-foreground">
                  {route.stopCount} paradas
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Distância Total</p>
                <p className="font-medium text-foreground">
                  {route.totalDistance}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Duração Estimada</p>
                <p className="font-medium text-foreground">
                  {route.estimatedDuration}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Criada em</p>
                <p className="font-medium text-foreground">
                  {new Date(route.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                hasChanges
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </button>

            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                hasChanges
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar</span>
            </button>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Alterações não salvas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem alterações pendentes
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-6">
                Deseja sair sem salvar as alterações?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Salvar e Sair
                </button>
                <button
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    onBack();
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Sair sem Salvar
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

export default RouteSettingsPage;
