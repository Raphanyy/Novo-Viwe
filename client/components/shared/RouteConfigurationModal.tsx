import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  Plus,
  Trash2,
  AlertTriangle,
  Search,
  Move,
} from "lucide-react";
import { ViweLoaderInline } from "./ViweLoader";
import { useTraceRoute, RouteStop } from "../../contexts/TraceRouteContext";
import { useAddressSearch, SearchResult } from "../../hooks/use-address-search";

// Enum para os níveis de navegação
enum NavigationLevel {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

// Interfaces tipadas
interface RouteInfo {
  routeName: string;
  responsible: string;
  priority: "baixa" | "media" | "alta";
}

interface Client {
  name: string;
  phone: string;
}

interface SchedulingData {
  type: "permanente" | "imediata";
  date: string;
}

interface FormData {
  info: RouteInfo;
  clients: Client[];
  routeSet: string;
  stops: RouteStop[];
  scheduling: SchedulingData;
}

// Interface para as seções principais
interface ConfigurationSection {
  id: keyof FormData;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType<{
    onBack: () => void;
    formData: any;
    saveData: (data: any) => void;
    traceContext?: ReturnType<typeof useTraceRoute>;
    isInMapPage?: boolean;
  }>;
}

interface RouteConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledStops?: RouteStop[];
  isTemporary?: boolean;
}

const RouteConfigurationModal: React.FC<RouteConfigurationModalProps> = ({
  isOpen,
  onClose,
  prefilledStops = [],
  isTemporary = false,
}) => {
  const location = useLocation();
  const traceContext = useTraceRoute();
  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<keyof FormData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const initializedRef = useRef(false);

  // Detectar se está na página do mapa
  const isInMapPage = location.pathname === "/app/mapa";

  // Estado do formulário com tipos apropriados - initialize with current data
  const [formData, setFormData] = useState<FormData>(() => {
    const currentStops = prefilledStops.length > 0 ? prefilledStops : [];
    return {
      info: {
        routeName: "",
        responsible: "",
        priority: "media",
      },
      clients: [],
      routeSet: "",
      stops: currentStops,
      scheduling: {
        type: isTemporary ? "imediata" : "permanente",
        date: "",
      },
    };
  });

  // Sincronizar com as paradas quando o modal abrir (apenas uma vez por abertura)
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      // Get stops from props or context, but don't create dependency loops
      const stopsToUse =
        prefilledStops.length > 0 ? prefilledStops : traceContext.state.stops;
      setFormData((prev) => ({
        ...prev,
        stops: stopsToUse,
        scheduling: {
          ...prev.scheduling,
          type: isTemporary ? "imediata" : "permanente",
        },
      }));
    }

    if (!isOpen) {
      // Reset initialization flag when modal closes
      initializedRef.current = false;
    }
  }, [isOpen]); // Only depend on isOpen

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
      subtitle: isInMapPage
        ? formData.stops.length > 0
          ? "Organizar paradas."
          : "Adicionar do mapa."
        : "Adicionar endereços.",
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
  const navigateToSection = (sectionId: keyof FormData) => {
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
  const saveAndClose = (section: keyof FormData, data: any) => {
    setFormData((prevData) => ({ ...prevData, [section]: data }));
  };

  // Verificar se seção foi configurada corretamente
  const isSectionConfigured = (section: keyof FormData): boolean => {
    switch (section) {
      case "info":
        return (
          formData.info.routeName.trim() !== "" &&
          formData.info.responsible.trim() !== ""
        );
      case "clients":
        return formData.clients.length > 0;
      case "routeSet":
        return formData.routeSet.trim() !== "";
      case "stops":
        return formData.stops.length > 0;
      case "scheduling":
        return (
          formData.scheduling.type === "permanente" ||
          (formData.scheduling.type === "imediata" &&
            formData.scheduling.date.trim() !== "")
        );
      default:
        return false;
    }
  };

  // Validar formulário completo
  const isFormValid = (): boolean => {
    return (
      formData.info.routeName.trim() !== "" &&
      formData.info.responsible.trim() !== "" &&
      formData.stops.length > 0 &&
      (formData.scheduling.type === "permanente" ||
        (formData.scheduling.type === "imediata" &&
          formData.scheduling.date.trim() !== ""))
    );
  };

  // Envio final com comportamento baseado no contexto
  const handleFinalSubmit = async () => {
    // Na página do mapa, validar apenas se tem paradas para finalizar o planejamento
    if (isInMapPage && traceContext.state.isTracing) {
      if (formData.stops.length < 1) {
        alert("Adicione pelo menos 1 parada para finalizar o planejamento.");
        return;
      }
    } else if (!isFormValid()) {
      alert(
        "Por favor, preencha os campos obrigatórios: Informações da Rota, Paradas e Programação.",
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isInMapPage) {
        // Na página do mapa: salvar configurações e finalizar planejamento
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Dados da rota salvos (página mapa):", formData);

        // Se estiver no modo de traçamento e tiver paradas suficientes, finalizar planejamento
        if (traceContext.state.isTracing && formData.stops.length >= 2) {
          console.log("Configurações salvas, finalizando planejamento automaticamente...");
          // Fechar modal primeiro
          setIsSuccess(true);
          setIsLoading(false);

          setTimeout(() => {
            setIsSuccess(false);
            onClose();
            // Finalizar planejamento automaticamente após salvar
            console.log("Chamando showTraceConfirmation() para finalizar planejamento");
            traceContext.showTraceConfirmation();
          }, 1500);

          return; // Sair early para não executar o resto da função
        }
      } else {
        // Fora da página do mapa: não fazer nada por enquanto
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(
          "Dados da rota preparados (fora do mapa) - nenhuma ação tomada:",
          formData,
        );
      }

      setIsSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setIsLoading(false);
      alert("Erro ao salvar configurações. Tente novamente.");
    }
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
  const renderPrimaryLevel = () => {
    const configuredSections = configurationSections.filter((section) =>
      isSectionConfigured(section.id),
    ).length;

    return (
      <div className="p-4 space-y-3">
        {/* Indicador de contexto */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {isInMapPage ? "Modo Mapa" : "Modo Independente"}
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {isInMapPage
              ? "Configurando rota com paradas selecionadas."
              : "Configuração independente de rota."}
          </p>
        </div>

        {/* Indicador de progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-2">
            <span>Progresso da Configuração</span>
            <span>
              {configuredSections} / {configurationSections.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(configuredSections / configurationSections.length) * 100}%`,
              }}
            />
          </div>
        </div>

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
            disabled={isLoading ||
              (isInMapPage && traceContext.state.isTracing
                ? formData.stops.length < 2
                : !isFormValid())}
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
                {isInMapPage && traceContext.state.isTracing && formData.stops.length >= 2
                  ? "Finalizar Planejamento"
                  : isInMapPage
                    ? "Salvar Configurações"
                    : "Preparar Rota"}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Nível 2: Página específica de configuração
  const renderSecondaryLevel = () => {
    const section = getCurrentSection();
    if (!section || !section.component) return null;

    const Component = section.component;
    return (
      <Component
        onBack={goBack}
        formData={formData[section.id]}
        saveData={(data) => saveAndClose(section.id, data)}
        traceContext={traceContext}
        isInMapPage={isInMapPage}
      />
    );
  };

  const getHeaderTitle = () => {
    if (currentLevel === NavigationLevel.PRIMARY) return "Configurar Rota";
    return getCurrentSection()?.title || "Configurar Rota";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* Header */}
      <ModalHeader
        title={getHeaderTitle()}
        showBackButton={true}
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
  formData: RouteInfo;
  saveData: (data: RouteInfo) => void;
}) {
  const [data, setData] = useState<RouteInfo>(formData);
  const [errors, setErrors] = useState<Partial<RouteInfo>>({});

  const validateField = (name: keyof RouteInfo, value: string) => {
    const newErrors = { ...errors };

    if (name === "routeName" && value.trim().length < 3) {
      newErrors.routeName = "Nome da rota deve ter pelo menos 3 caracteres";
    } else if (name === "routeName") {
      delete newErrors.routeName;
    }

    if (name === "responsible" && value.trim().length < 2) {
      newErrors.responsible =
        "Nome do responsável deve ter pelo menos 2 caracteres";
    } else if (name === "responsible") {
      delete newErrors.responsible;
    }

    setErrors(newErrors);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newData = { ...data, [name as keyof RouteInfo]: value };
    setData(newData);
    validateField(name as keyof RouteInfo, value);
    saveData(newData);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome da Rota <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="routeName"
            value={data.routeName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.routeName ? "border-red-500" : "border-border"
            }`}
            placeholder="Digite o nome da rota"
            required
          />
          {errors.routeName && (
            <p className="text-red-500 text-xs mt-1">{errors.routeName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Responsável <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="responsible"
            value={data.responsible}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.responsible ? "border-red-500" : "border-border"
            }`}
            placeholder="Nome do responsável"
            required
          />
          {errors.responsible && (
            <p className="text-red-500 text-xs mt-1">{errors.responsible}</p>
          )}
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

// Página de Clientes
function ClientsPage({
  onBack,
  formData,
  saveData,
}: {
  onBack: () => void;
  formData: Client[];
  saveData: (data: Client[]) => void;
}) {
  const [clients, setClients] = useState<Client[]>(formData);
  const [newClient, setNewClient] = useState<Client>({ name: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateClient = (client: Client) => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!client.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (client.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (
      client.phone &&
      !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(client.phone) &&
      client.phone.length > 0
    ) {
      newErrors.phone = "Formato: (11) 99999-9999";
    }

    return newErrors;
  };

  const handleAddClient = () => {
    const validationErrors = validateClient(newClient);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0 && newClient.name.trim()) {
      const newClients = [...clients, newClient];
      setClients(newClients);
      saveData(newClients);
      setNewClient({ name: "", phone: "" });
    }
  };

  const handleRemoveClient = (index: number) => {
    const newClients = clients.filter((_, i) => i !== index);
    setClients(newClients);
    saveData(newClients);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{2})(\d{4,5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return value;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome do Cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newClient.name}
            onChange={(e) => {
              setNewClient({ ...newClient, name: e.target.value });
              setErrors({ ...errors, name: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? "border-red-500" : "border-border"
            }`}
            placeholder="Nome do cliente"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Telefone
          </label>
          <input
            type="tel"
            value={newClient.phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setNewClient({ ...newClient, phone: formatted });
              setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.phone ? "border-red-500" : "border-border"
            }`}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
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
          clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">
                  {client.phone || "Sem telefone"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveClient(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Página de Conjunto de Rotas
function RouteSetPage({
  onBack,
  formData,
  saveData,
}: {
  onBack: () => void;
  formData: string;
  saveData: (data: string) => void;
}) {
  const routeSets = ["Zona Sul", "Centro", "Zona Norte", "Zona Oeste"];

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Selecione um conjunto de rotas para organizar e agrupar esta rota.
        </p>
      </div>

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
          <div className="flex items-center justify-between">
            <span className="font-medium">{set}</span>
            {formData === set && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// Página de Paradas com funcionalidade adaptável
function StopsPage({
  onBack,
  formData,
  saveData,
  traceContext,
  isInMapPage = false,
}: {
  onBack: () => void;
  formData: RouteStop[];
  saveData: (data: RouteStop[]) => void;
  traceContext?: ReturnType<typeof useTraceRoute>;
  isInMapPage?: boolean;
}) {
  const [stops, setStops] = useState<RouteStop[]>(formData);

  // Use the address search hook
  const {
    searchResults,
    isSearching,
    showResults,
    searchQuery,
    handleSearchChange,
    handleSelectResult,
    setShowResults,
  } = useAddressSearch({
    onSelectResult: handleAddressFromSearch,
    minQueryLength: 2,
    debounceMs: 300,
  });

  const handleRemoveStop = (stopId: string) => {
    const newStops = stops.filter((stop) => stop.id !== stopId);
    setStops(newStops);
    saveData(newStops);
  };

  const handleReorderStops = (fromIndex: number, toIndex: number) => {
    const newStops = [...stops];
    const [removed] = newStops.splice(fromIndex, 1);
    newStops.splice(toIndex, 0, removed);

    // Reordenar os números das paradas
    const reorderedStops = newStops.map((stop, index) => ({
      ...stop,
      order: index + 1,
    }));

    setStops(reorderedStops);
    saveData(reorderedStops);
  };

  // Handle address selection from search results
  function handleAddressFromSearch(result: SearchResult) {
    const newStop: RouteStop = {
      id: `stop-${Date.now()}`,
      name: result.text,
      address: result.place_name,
      coordinates: result.center,
      order: stops.length + 1,
      isCompleted: false,
    };

    const newStops = [...stops, newStop];
    setStops(newStops);
    saveData(newStops);
  }

  const hasStopsFromMap = isInMapPage && stops.length > 0;
  const shouldShowAddressInput = !isInMapPage || stops.length === 0;

  return (
    <div className="p-4 space-y-4">
      {/* Funcionalidade 1: Mostrar paradas do mapa e permitir organização */}
      {hasStopsFromMap && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">
              Paradas da Rota ({stops.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Toque para remover • Organize a ordem
            </span>
          </div>

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  {stop.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {stop.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {stop.address || "Endereço não disponível"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {stop.coordinates[1].toFixed(4)},{" "}
                    {stop.coordinates[0].toFixed(4)}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderStops(index, index - 1)}
                      className="h-6 w-6 p-0"
                    >
                      ↑
                    </Button>
                  )}
                  {index < stops.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderStops(index, index + 1)}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStop(stop.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              As paradas serão visitadas na ordem mostrada acima
            </p>
          </div>
        </>
      )}

      {/* Funcionalidade 2: Adicionar endereços das paradas */}
      {shouldShowAddressInput && (
        <>
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">
              {isInMapPage ? "Adicionar Paradas" : "Configurar Paradas"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isInMapPage
                ? "Nenhuma parada foi adicionada do mapa. Adicione endereços manualmente ou use o mapa."
                : "Digite os endereços das paradas da sua rota."}
            </p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Escreva o endereço"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                {isSearching && <ViweLoaderInline />}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            result.place_type.includes("poi")
                              ? "bg-green-100"
                              : result.place_type.includes("place") ||
                                  result.place_type.includes("locality")
                                ? "bg-purple-100"
                                : result.place_type.includes("region") ||
                                    result.place_type.includes("district")
                                  ? "bg-orange-100"
                                  : result.place_type.includes("neighborhood")
                                    ? "bg-yellow-100"
                                    : "bg-blue-100"
                          }`}
                        >
                          {result.place_type.includes("poi") ? (
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          ) : (
                            <MapPin
                              className={`h-4 w-4 ${
                                result.place_type.includes("poi")
                                  ? "text-green-600"
                                  : result.place_type.includes("place") ||
                                      result.place_type.includes("locality")
                                    ? "text-purple-600"
                                    : result.place_type.includes("region") ||
                                        result.place_type.includes("district")
                                      ? "text-orange-600"
                                      : result.place_type.includes(
                                            "neighborhood",
                                          )
                                        ? "text-yellow-600"
                                        : "text-blue-600"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-foreground truncate">
                              {result.text}
                            </p>
                            {result.place_type.includes("poi") && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Estabelecimento
                              </span>
                            )}
                            {result.place_type.includes("locality") && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Cidade
                              </span>
                            )}
                            {result.place_type.includes("region") && (
                              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Região
                              </span>
                            )}
                            {result.place_type.includes("neighborhood") && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Bairro
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {result.place_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista de paradas adicionadas */}
          {stops.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">
                Paradas Adicionadas ({stops.length})
              </h4>
              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {stop.order}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {stop.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stop.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderStops(index, index - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Move className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {stops.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">
                Nenhuma Parada Configurada
              </h3>
              <p className="text-sm text-muted-foreground">
                {isInMapPage
                  ? "Use o mapa para adicionar paradas ou digite os endereços acima"
                  : "Digite os endereços das paradas acima para começar"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Página de Programação
function SchedulingPage({
  onBack,
  formData,
  saveData,
}: {
  onBack: () => void;
  formData: SchedulingData;
  saveData: (data: SchedulingData) => void;
}) {
  const [data, setData] = useState<SchedulingData>(formData);
  const [errors, setErrors] = useState<{ date?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };

    // Validar data se for rota imediata
    if (name === "date" && data.type === "imediata") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setErrors({ date: "Data deve ser hoje ou no futuro" });
      } else {
        setErrors({});
      }
    }

    setData(newData);
    saveData(newData);
  };

  const handleTypeChange = (type: "permanente" | "imediata") => {
    const newData = { ...data, type };
    if (type === "permanente") {
      newData.date = "";
      setErrors({});
    }
    setData(newData);
    saveData(newData);
  };

  // Data mínima é hoje
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Tipo de Rota <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="permanente"
                checked={data.type === "permanente"}
                onChange={() => handleTypeChange("permanente")}
                className="mt-1"
              />
              <div>
                <span className="font-medium text-foreground">Permanente</span>
                <p className="text-sm text-muted-foreground">
                  Rota que será executada regularmente
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="imediata"
                checked={data.type === "imediata"}
                onChange={() => handleTypeChange("imediata")}
                className="mt-1"
              />
              <div>
                <span className="font-medium text-foreground">Imediata</span>
                <p className="text-sm text-muted-foreground">
                  Rota para execução única em data específica
                </p>
              </div>
            </label>
          </div>
        </div>

        {data.type === "imediata" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data de Execução <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={data.date}
              min={today}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.date ? "border-red-500" : "border-border"
              }`}
              required
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              A rota será válida por 24 horas a partir da data selecionada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteConfigurationModal;
