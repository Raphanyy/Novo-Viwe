import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { ViweLoaderInline } from "./ViweLoader";
import { useTraceRoute, RouteStop } from "../../contexts/TraceRouteContext";

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
  const traceContext = useTraceRoute();
  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<keyof FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estado do formulário com tipos apropriados
  const [formData, setFormData] = useState<FormData>({
    info: { 
      routeName: "", 
      responsible: "", 
      priority: "media" 
    },
    clients: [],
    routeSet: "",
    stops: [],
    scheduling: { 
      type: isTemporary ? "imediata" : "permanente", 
      date: "" 
    },
  });

  // Sincronizar com as paradas do contexto quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const currentStops = prefilledStops.length > 0 ? prefilledStops : traceContext.state.stops;
      setFormData(prev => ({
        ...prev,
        stops: currentStops,
        scheduling: {
          ...prev.scheduling,
          type: isTemporary ? "imediata" : "permanente"
        }
      }));
    }
  }, [isOpen, prefilledStops, isTemporary, traceContext.state.stops]);

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
    
    // Sincronizar paradas com o contexto se necessário
    if (section === 'stops') {
      // Atualizar o contexto com as novas paradas se estivermos em modo de traçamento
      // Isso será feito no handleFinalSubmit para evitar múltiplas atualizações
    }
  };

  // Verificar se seção foi configurada corretamente
  const isSectionConfigured = (section: keyof FormData): boolean => {
    switch (section) {
      case "info":
        return formData.info.routeName.trim() !== "" && formData.info.responsible.trim() !== "";
      case "clients":
        return formData.clients.length > 0;
      case "routeSet":
        return formData.routeSet.trim() !== "";
      case "stops":
        return formData.stops.length > 0;
      case "scheduling":
        return (formData.scheduling.type === "permanente" ||
                (formData.scheduling.type === "imediata" && formData.scheduling.date.trim() !== ""));
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
      formData.scheduling.type !== "" &&
      (formData.scheduling.type === "permanente" || formData.scheduling.date !== "")
    );
  };

  // Envio final
  const handleFinalSubmit = async () => {
    if (!isFormValid()) {
      alert("Por favor, preencha todos os campos obrigatórios: Informações da Rota, Paradas e Programação.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simula salvamento no backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Aqui deveria haver uma chamada real para o backend
      console.log("Dados da rota salvos:", formData);
      
      // Se estivermos em modo de traçamento, atualizar o contexto
      if (traceContext.state.isTracing && formData.stops.length > 0) {
        // Sincronizar as paradas com o contexto
        // Nota: Esta lógica pode precisar ser ajustada dependendo da implementação do contexto
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

        {/* Alerta de campos obrigatórios */}
        {!isFormValid() && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Campos obrigatórios: Informações da Rota, Paradas e Programação
              </span>
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
            disabled={isLoading || !isFormValid()}
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
  formData: RouteInfo;
  saveData: (data: RouteInfo) => void;
}) {
  const [data, setData] = useState<RouteInfo>(formData);
  const [errors, setErrors] = useState<Partial<RouteInfo>>({});

  const validateField = (name: keyof RouteInfo, value: string) => {
    const newErrors = { ...errors };
    
    if (name === 'routeName' && value.trim().length < 3) {
      newErrors.routeName = 'Nome da rota deve ter pelo menos 3 caracteres';
    } else if (name === 'routeName') {
      delete newErrors.routeName;
    }
    
    if (name === 'responsible' && value.trim().length < 2) {
      newErrors.responsible = 'Nome do responsável deve ter pelo menos 2 caracteres';
    } else if (name === 'responsible') {
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
              errors.routeName ? 'border-red-500' : 'border-border'
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
              errors.responsible ? 'border-red-500' : 'border-border'
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
    
    if (client.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(client.phone) && client.phone.length > 0) {
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
    const numbers = value.replace(/\D/g, '');
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
              errors.name ? 'border-red-500' : 'border-border'
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
              errors.phone ? 'border-red-500' : 'border-border'
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
                <p className="text-sm text-muted-foreground">{client.phone || "Sem telefone"}</p>
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
  saveData 
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

// Página de Paradas melhorada
function StopsPage({ 
  onBack, 
  formData, 
  saveData, 
  traceContext 
}: { 
  onBack: () => void; 
  formData: RouteStop[]; 
  saveData: (data: RouteStop[]) => void;
  traceContext?: ReturnType<typeof useTraceRoute>;
}) {
  const [stops, setStops] = useState<RouteStop[]>(formData);

  const handleRemoveStop = (stopId: string) => {
    const newStops = stops.filter(stop => stop.id !== stopId);
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
      order: index + 1
    }));
    
    setStops(reorderedStops);
    saveData(reorderedStops);
  };

  return (
    <div className="p-4 space-y-4">
      {stops.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-2">Nenhuma Parada Configurada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use o mapa para adicionar paradas à sua rota
          </p>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="text-primary border-primary hover:bg-primary/10"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ir para o Mapa
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">
              Paradas da Rota ({stops.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Toque para remover
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
                    {stop.coordinates[1].toFixed(4)}, {stop.coordinates[0].toFixed(4)}
                  </p>
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
    </div>
  );
}

// Página de Programação
function SchedulingPage({ 
  onBack, 
  formData, 
  saveData 
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
    if (name === 'date' && data.type === 'imediata') {
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
  const today = new Date().toISOString().split('T')[0];

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
                errors.date ? 'border-red-500' : 'border-border'
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
