import React, { useState } from "react";
import { Button } from "../ui/button";
import ModalHeader from "./ModalHeader";
import SettingsSection from "../profile/SettingsSection";
import {
  Info,
  Users,
  Route,
  MapPin,
  Calendar,
  Save,
  CheckCircle,
} from "lucide-react";
import { ViweLoaderInline } from "./ViweLoader";

// Enum para os níveis de navegação
enum NavigationLevel {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

// Interface para as seções principais
interface ConfigurationSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType<{
    onBack: () => void;
    formData: any;
    saveData: (data: any) => void;
  }>;
}

interface RouteConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledStops?: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    address?: string;
  }>;
  isTemporary?: boolean;
}

const RouteConfigurationModal: React.FC<RouteConfigurationModalProps> = ({
  isOpen,
  onClose,
  prefilledStops,
  isTemporary = false,
}) => {
  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    info: { routeName: "", responsible: "", priority: "media" },
    clients: [] as Array<{ name: string; phone: string }>,
    routeSet: "",
    stops: prefilledStops
      ? prefilledStops.map((stop) => ({
          name: stop.name,
          id: stop.id,
          address: stop.address || "Endereço não disponível",
        }))
      : ([] as Array<{ name: string; id: string; address: string }>),
    scheduling: { type: isTemporary ? "imediata" : "permanente", date: "" },
  });

  // Configuração das seções principais
  const configurationSections: ConfigurationSection[] = [
    {
      id: "info",
      title: "Informações da Rota",
      subtitle: "Nome e responsável.",
      icon: Info,
      component: RouteInfoPage,
    },
    {
      id: "clients",
      title: "Carteira de Clientes",
      subtitle: "Adicionar clientes.",
      icon: Users,
      component: ClientsPage,
    },
    {
      id: "routeSet",
      title: "Conjuntos de Rotas",
      subtitle: "Associar a conjunto.",
      icon: Route,
      component: RouteSetPage,
    },
    {
      id: "stops",
      title: "Configurar Paradas",
      subtitle: "Gerenciar paradas.",
      icon: MapPin,
      component: StopsPage,
    },
    {
      id: "scheduling",
      title: "Programação",
      subtitle: "Tipo e data.",
      icon: Calendar,
      component: SchedulingPage,
    },
  ];

  // Funções de navegação
  const navigateToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentLevel(NavigationLevel.SECONDARY);
  };

  const goBack = () => {
    if (currentLevel === NavigationLevel.SECONDARY) {
      setCurrentLevel(NavigationLevel.PRIMARY);
      setSelectedSection(null);
    }
  };

  const getCurrentSection = () => {
    return configurationSections.find(
      (section) => section.id === selectedSection,
    );
  };

  // Salvar dados de seção
  const saveAndClose = (section: string, data: any) => {
    setFormData((prevData) => ({ ...prevData, [section]: data }));
  };

  // Verificar se seção foi configurada
  const isSectionConfigured = (section: string) => {
    switch (section) {
      case "info":
        return (
          formData.info.routeName !== "" || formData.info.responsible !== ""
        );
      case "clients":
        return formData.clients.length > 0;
      case "routeSet":
        return formData.routeSet !== "";
      case "stops":
        return formData.stops.length > 0;
      case "scheduling":
        return formData.scheduling.type !== "";
      default:
        return false;
    }
  };

  // Envio final
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    // Simula salvamento
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Dados salvos:", formData);
    setIsSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  // Renderização condicional
  const renderContent = () => {
    switch (currentLevel) {
      case NavigationLevel.PRIMARY:
        return renderPrimaryLevel();
      case NavigationLevel.SECONDARY:
        return renderSecondaryLevel();
      default:
        return renderPrimaryLevel();
    }
  };

  // Nível 1: Tela principal de configuração
  const renderPrimaryLevel = () => (
    <div className="p-4 space-y-3">
      {/* Indicador de progresso */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-2">
          <span>Progresso da Configuração</span>
          <span>
            {
              configurationSections.filter((section) =>
                isSectionConfigured(section.id),
              ).length
            }{" "}
            / {configurationSections.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (configurationSections.filter((section) =>
                  isSectionConfigured(section.id),
                ).length /
                  configurationSections.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Aviso para rota imediata */}
      {isTemporary && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <div>
              <span className="font-semibold text-orange-800">
                Rota Imediata
              </span>
              <p className="text-sm text-orange-700">
                Esta rota é válida por 24 horas a partir do início.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seções de configuração */}
      {configurationSections.map((section) => (
        <div key={section.id} className="relative">
          {isSectionConfigured(section.id) && (
            <div className="absolute -top-1 -right-1 z-10">
              <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
            </div>
          )}
          <SettingsSection
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            onClick={() => navigateToSection(section.id)}
          />
        </div>
      ))}

      {/* Botão de salvar */}
      <div className="pt-4 border-t border-border">
        <Button
          onClick={handleFinalSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <ViweLoaderInline text="Salvando..." />
          ) : isSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Nível 2: Página específica de configuração
  const renderSecondaryLevel = () => {
    const section = getCurrentSection();
    if (!section || !section.component) return null;

    const Component = section.component;
    return (
      <Component
        onBack={goBack}
        formData={formData[section.id as keyof typeof formData]}
        saveData={(data) => saveAndClose(section.id, data)}
      />
    );
  };

  const getHeaderTitle = () => {
    if (currentLevel === NavigationLevel.PRIMARY) return "Configurar Rota";
    return getCurrentSection()?.title || "Configurar Rota";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <ModalHeader
        title={getHeaderTitle()}
        showBackButton={currentLevel !== NavigationLevel.PRIMARY}
        onBack={currentLevel === NavigationLevel.PRIMARY ? onClose : goBack}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

// Página de Informações da Rota
function RouteInfoPage({
  onBack,
  formData,
  saveData,
}: {
  onBack: () => void;
  formData: any;
  saveData: (data: any) => void;
}) {
  const [data, setData] = useState(formData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    saveData(newData);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome da Rota
          </label>
          <input
            type="text"
            name="routeName"
            value={data.routeName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Digite o nome da rota"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Responsável
          </label>
          <input
            type="text"
            name="responsible"
            value={data.responsible}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome do responsável"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Prioridade
          </label>
          <select
            name="priority"
            value={data.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Página de Clientes (simplificada)
function ClientsPage({
  onBack,
  formData,
  saveData,
}: {
  onBack: () => void;
  formData: any;
  saveData: (data: any) => void;
}) {
  const [clients, setClients] = useState(formData);
  const [newClient, setNewClient] = useState({ name: "", phone: "" });

  const handleAddClient = () => {
    if (newClient.name.trim()) {
      const newClients = [...clients, newClient];
      setClients(newClients);
      saveData(newClients);
      setNewClient({ name: "", phone: "" });
    }
  };

  const handleRemoveClient = (index: number) => {
    const newClients = clients.filter((_: any, i: number) => i !== index);
    setClients(newClients);
    saveData(newClients);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome do Cliente
          </label>
          <input
            type="text"
            value={newClient.name}
            onChange={(e) =>
              setNewClient({ ...newClient, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome do cliente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Telefone
          </label>
          <input
            type="tel"
            value={newClient.phone}
            onChange={(e) =>
              setNewClient({ ...newClient, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Telefone do cliente"
          />
        </div>

        <Button onClick={handleAddClient} className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">
          Clientes Adicionados ({clients.length})
        </h3>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum cliente adicionado ainda.
          </p>
        ) : (
          clients.map((client: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveClient(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remover
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Placeholder para outras páginas
function RouteSetPage({ onBack, formData, saveData }: any) {
  const routeSets = ["Zona Sul", "Centro", "Zona Norte", "Zona Oeste"];

  return (
    <div className="p-4 space-y-3">
      {routeSets.map((set) => (
        <button
          key={set}
          onClick={() => saveData(set)}
          className={`w-full p-3 text-left rounded-lg border transition-colors ${
            formData === set
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          {set}
        </button>
      ))}
    </div>
  );
}

function StopsPage({ onBack, formData, saveData }: any) {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground mb-2">Paradas da Rota</h3>
        <p className="text-sm text-muted-foreground">
          {formData.length > 0
            ? `${formData.length} parada(s) configurada(s)`
            : "Use o mapa para adicionar paradas"}
        </p>
      </div>
    </div>
  );
}

function SchedulingPage({ onBack, formData, saveData }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    saveData({ ...formData, [name]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Tipo de Rota
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="permanente"
              checked={formData.type === "permanente"}
              onChange={handleChange}
              className="mr-2"
            />
            Permanente
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="imediata"
              checked={formData.type === "imediata"}
              onChange={handleChange}
              className="mr-2"
            />
            Imediata
          </label>
        </div>

        {formData.type === "imediata" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteConfigurationModal;
