import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  User,
  Settings,
  Sliders,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Lock,
  KeyRound,
  Globe,
  Car,
  Bike,
  Truck,
  Footprints,
  MapPin,
  Map,
  Waypoints,
  HelpCircle,
  Shield,
  RefreshCcw,
  Info,
  CreditCard,
  BadgeMinus,
  BookOpen,
  AlertCircle,
  FileText,
  Flag,
  Gauge,
  Clock,
  DollarSign,
  Zap,
  Route,
  Volume2,
  VolumeX,
  Fuel,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// Constantes movidas para fora do componente para evitar recriações
const VEHICLES = [
  { id: "car", name: "Carro", icon: Car, description: "Veículo padrão" },
  {
    id: "bike",
    name: "Bicicleta",
    icon: Bike,
    description: "Ciclovias preferidas",
  },
  {
    id: "truck",
    name: "Caminhão",
    icon: Truck,
    description: "Rotas para veículos pesados",
  },
  {
    id: "walk",
    name: "A pé",
    icon: Footprints,
    description: "Caminhos para pedestres",
  },
];

const ROUTE_TYPES = [
  {
    id: "fastest",
    name: "Mais Rápida",
    icon: Zap,
    description: "Prioriza menor tempo de viagem",
  },
  {
    id: "shortest",
    name: "Mais Curta",
    icon: Route,
    description: "Menor distância percorrida",
  },
  {
    id: "economic",
    name: "Econômica",
    icon: DollarSign,
    description: "Menor consumo de combustível",
  },
  {
    id: "balanced",
    name: "Balanceada",
    icon: Shield,
    description: "Equilíbrio entre tempo e economia",
  },
];

const FUEL_TYPES = [
  { id: "gasoline", name: "Gasolina", price: "R$ 5,49/L" },
  { id: "ethanol", name: "Etanol", price: "R$ 3,89/L" },
  { id: "diesel", name: "Diesel", price: "R$ 4,99/L" },
  { id: "electric", name: "Elétrico", price: "R$ 0,45/kWh" },
];

const ACCOUNT_ACTIONS = [
  { icon: CreditCard, title: "Meus Planos", action: "Meus Planos" },
  {
    icon: CreditCard,
    title: "Preferências de Pagamento",
    action: "Preferências de Pagamento",
  },
  { icon: BadgeMinus, title: "Remover Anúncios", action: "Remover Anúncios" },
  { icon: BookOpen, title: "Tutoriais", action: "Tutoriais" },
  { icon: AlertCircle, title: "Emergências", action: "Emergências" },
  { icon: FileText, title: "Relatórios", action: "Relatórios" },
  { icon: Flag, title: "Denúncias", action: "Denúncias" },
  { icon: HelpCircle, title: "Suporte / FAQ", action: "Suporte" },
  { icon: Shield, title: "Segurança", action: "Segurança" },
  { icon: RefreshCcw, title: "Atualizações", action: "updates" },
];

const NAVIGATION_SETTINGS_CONFIG = [
  {
    key: "voiceGuidance",
    icon: Volume2,
    title: "Orientação por voz",
    subtitle: "Instruções faladas durante a navegação",
  },
  {
    key: "soundAlerts",
    icon: VolumeX,
    title: "Alertas sonoros",
    subtitle: "Sons de alerta para mudanças",
  },
  {
    key: "autoZoom",
    icon: MapPin,
    title: "Zoom automático",
    subtitle: "Ajusta zoom conforme velocidade",
  },
  {
    key: "nightMode",
    icon: Clock,
    title: "Modo noturno automático",
    subtitle: "Ativa tema escuro após 18h",
  },
];

const AVOID_OPTIONS_CONFIG = [
  {
    key: "tolls",
    icon: DollarSign,
    title: "Pedágios",
    subtitle: "Evitar estradas com cobrança",
  },
  {
    key: "highways",
    icon: Route,
    title: "Rodovias",
    subtitle: "Preferir vias urbanas",
  },
  {
    key: "ferries",
    icon: Globe,
    title: "Balsas",
    subtitle: "Evitar travessias marítimas",
  },
  {
    key: "unpaved",
    icon: MapPin,
    title: "Estradas não pavimentadas",
    subtitle: "Apenas vias asfaltadas",
  },
];

const OptionsPage: React.FC = () => {
  const { user } = useAuth();

  // Estados do perfil - usando valores iniciais estáveis
  const [name, setName] = useState(() => user?.name || "Nome do Usuário");
  const [email, setEmail] = useState(() => user?.email || "email@exemplo.com");
  const [company, setCompany] = useState("Nome da Empresa");
  const [country, setCountry] = useState("Brasil");
  const [city, setCity] = useState("Rio de Janeiro");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Estados das preferências
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [selectedNavigation, setSelectedNavigation] = useState("integrated");
  const [ignoreConsumption, setIgnoreConsumption] = useState(false);
  const [routePreference, setRoutePreference] = useState("balanced");
  const [selectedFuel, setSelectedFuel] = useState("gasoline");
  const [fuelConsumption, setFuelConsumption] = useState("12");

  // Estados de objetos com valores estáveis
  const [avoidOptions, setAvoidOptions] = useState(() => ({
    tolls: false,
    highways: false,
    ferries: false,
    unpaved: true,
  }));

  const [navigationSettings, setNavigationSettings] = useState(() => ({
    voiceGuidance: true,
    soundAlerts: true,
    autoZoom: true,
    nightMode: false,
  }));

  // Controle do estado dos accordions
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Funções memoizadas para evitar re-renderizações
  const handleSaveProfile = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Profile saved:", { name, email, company, country, city });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    },
    [name, email, company, country, city],
  );

  const handleAction = useCallback((action: string) => {
    console.log(`Action: ${action}`);
    alert(`Ação de '${action}' acionada!`);
  }, []);

  const toggleAvoidOption = useCallback((option: keyof typeof avoidOptions) => {
    setAvoidOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  }, []);

  const toggleNavigationSetting = useCallback(
    (setting: keyof typeof navigationSettings) => {
      setNavigationSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }));
    },
    [],
  );

  // Funções específicas memoizadas
  const handleVehicleSelect = useCallback((vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  }, []);

  const handleRouteSelect = useCallback((routeId: string) => {
    setRoutePreference(routeId);
  }, []);

  const handleFuelSelect = useCallback((fuelId: string) => {
    setSelectedFuel(fuelId);
  }, []);

  const handleNavigationSelect = useCallback((navType: string) => {
    setSelectedNavigation(navType);
  }, []);

  const handleDarkModeToggle = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleIgnoreConsumptionToggle = useCallback(() => {
    setIgnoreConsumption((prev) => !prev);
  }, []);

  // Memoização da inicial do avatar para evitar recálculos
  const avatarInitial = useMemo(() => {
    return name.charAt(0).toUpperCase();
  }, [name]);

  return (
    <div className="h-full overflow-auto bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center p-4">Perfil</h1>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="m-4 p-3 bg-green-500 text-white rounded-lg text-center animate-pulse">
          Alterações salvas com sucesso!
        </div>
      )}

      {/* Main Content with Accordions */}
      <main className="p-4">
        <Accordion
          type="multiple"
          value={openAccordions}
          onValueChange={setOpenAccordions}
          className="w-full space-y-4"
        >
          {/* Seção do Perfil */}
          <AccordionItem
            value="profile"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Informações do Perfil
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nome, email e dados pessoais
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex flex-col gap-6">
                {/* Seção da foto de perfil */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl">
                    {avatarInitial}
                  </div>
                  <button className="text-blue-600 font-medium hover:underline">
                    Alterar Foto
                  </button>
                </div>

                {/* Formulário de informações do perfil */}
                <form
                  onSubmit={handleSaveProfile}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Endereço de E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome da Empresa
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      País
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Cidade
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full p-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
                  >
                    Salvar Alterações
                  </button>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Configurações da Conta */}
          <AccordionItem
            value="account"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Configurações da Conta
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Planos, pagamentos e suporte
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                {ACCOUNT_ACTIONS.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted rounded-lg p-4 border border-border"
                  >
                    <button
                      onClick={() => handleAction(item.action)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon
                          size={20}
                          className="text-muted-foreground"
                        />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>
                  </div>
                ))}

                {/* App Version Info */}
                <div className="text-center mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Info size={16} />
                  <p>Versão do aplicativo: 1.0.0</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Preferências de Veículo */}
          <AccordionItem
            value="vehicle"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Tipo de Veículo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure seu meio de transporte
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                {VEHICLES.map((vehicle) => {
                  const Icon = vehicle.icon;
                  const isSelected = selectedVehicle === vehicle.id;

                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-border bg-white"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mb-2 mx-auto ${isSelected ? "text-blue-600" : "text-muted-foreground"}`}
                      />
                      <h4
                        className={`font-medium text-sm ${isSelected ? "text-blue-900" : "text-foreground"}`}
                      >
                        {vehicle.name}
                      </h4>
                      <p
                        className={`text-xs mt-1 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`}
                      >
                        {vehicle.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Preferências de Rota */}
          <AccordionItem
            value="routes"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Route className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Preferências de Rota
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Como calcular suas rotas
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                {ROUTE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = routePreference === type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => handleRouteSelect(type.id)}
                      className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-border bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${isSelected ? "bg-blue-100" : "bg-secondary"}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h4
                          className={`font-medium ${isSelected ? "text-blue-900" : "text-foreground"}`}
                        >
                          {type.name}
                        </h4>
                        <p
                          className={`text-sm ${isSelected ? "text-blue-600" : "text-muted-foreground"}`}
                        >
                          {type.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-border"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Navegação */}
          <AccordionItem
            value="navigation"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Configurações de Navegação
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    App preferido e configurações
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Preferência de App */}
                <div>
                  <h4 className="font-medium mb-3">App de Navegação</h4>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center p-3 rounded-lg border border-border cursor-pointer transition-colors hover:bg-muted">
                      <input
                        type="radio"
                        name="navigation"
                        value="integrated"
                        checked={selectedNavigation === "integrated"}
                        onChange={() => handleNavigationSelect("integrated")}
                        className="form-radio text-blue-600 h-4 w-4"
                      />
                      <MapPin size={20} className="ml-2" />
                      <span className="ml-2 text-sm">Integrada</span>
                    </label>
                    <label className="flex items-center p-3 rounded-lg border border-border cursor-pointer transition-colors hover:bg-muted">
                      <input
                        type="radio"
                        name="navigation"
                        value="google"
                        checked={selectedNavigation === "google"}
                        onChange={() => handleNavigationSelect("google")}
                        className="form-radio text-blue-600 h-4 w-4"
                      />
                      <Map size={20} className="ml-2" />
                      <span className="ml-2 text-sm">Google Maps</span>
                    </label>
                    <label className="flex items-center p-3 rounded-lg border border-border cursor-pointer transition-colors hover:bg-muted">
                      <input
                        type="radio"
                        name="navigation"
                        value="waze"
                        checked={selectedNavigation === "waze"}
                        onChange={() => handleNavigationSelect("waze")}
                        className="form-radio text-blue-600 h-4 w-4"
                      />
                      <Waypoints size={20} className="ml-2" />
                      <span className="ml-2 text-sm">Waze</span>
                    </label>
                  </div>
                </div>

                {/* Configurações de navegação */}
                <div>
                  <h4 className="font-medium mb-3">Configurações</h4>
                  <div className="space-y-4">
                    {NAVIGATION_SETTINGS_CONFIG.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <setting.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {setting.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {setting.subtitle}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            toggleNavigationSetting(
                              setting.key as keyof typeof navigationSettings,
                            )
                          }
                          className={`transition-colors duration-200 ${
                            navigationSettings[
                              setting.key as keyof typeof navigationSettings
                            ]
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          {navigationSettings[
                            setting.key as keyof typeof navigationSettings
                          ] ? (
                            <ToggleRight className="h-8 w-8" />
                          ) : (
                            <ToggleLeft className="h-8 w-8" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Combustível */}
          <AccordionItem
            value="fuel"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Configuração de Combustível
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tipo e consumo do seu veículo
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Combustível
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FUEL_TYPES.map((fuel) => (
                      <button
                        key={fuel.id}
                        onClick={() => handleFuelSelect(fuel.id)}
                        className={`p-3 rounded-xl text-left transition-all duration-200 ${
                          selectedFuel === fuel.id
                            ? "bg-blue-50 border-2 border-blue-200"
                            : "bg-muted border-2 border-transparent hover:bg-secondary"
                        }`}
                      >
                        <p
                          className={`font-medium text-sm ${
                            selectedFuel === fuel.id
                              ? "text-blue-900"
                              : "text-foreground"
                          }`}
                        >
                          {fuel.name}
                        </p>
                        <p
                          className={`text-xs ${
                            selectedFuel === fuel.id
                              ? "text-blue-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {fuel.price}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumo Médio (km/l)
                  </label>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={fuelConsumption}
                      onChange={(e) => setFuelConsumption(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usado para calcular custos estimados da viagem
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Opções para Evitar */}
          <AccordionItem
            value="avoid"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Evitar nas Rotas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o que evitar
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {AVOID_OPTIONS_CONFIG.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <option.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {option.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleAvoidOption(
                          option.key as keyof typeof avoidOptions,
                        )
                      }
                      className={`transition-colors duration-200 ${
                        avoidOptions[option.key as keyof typeof avoidOptions]
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {avoidOptions[option.key as keyof typeof avoidOptions] ? (
                        <ToggleRight className="h-8 w-8" />
                      ) : (
                        <ToggleLeft className="h-8 w-8" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção de Outras Configurações */}
          <AccordionItem
            value="other"
            className="bg-card rounded-xl shadow-md border border-border"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Outras Configurações
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tema e configurações gerais
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isDarkMode ? (
                      <Moon size={20} className="text-muted-foreground" />
                    ) : (
                      <Sun size={20} className="text-muted-foreground" />
                    )}
                    <span className="font-medium">Tema Escuro</span>
                  </div>
                  <div
                    onClick={handleDarkModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${isDarkMode ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Gauge size={20} className="text-muted-foreground" />
                    <span className="font-medium">Ignorar Consumo</span>
                  </div>
                  <div
                    onClick={handleIgnoreConsumptionToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${ignoreConsumption ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ignoreConsumption ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </div>
                </div>

                {/* Restore Defaults */}
                <div className="pt-4 border-t border-border">
                  <button className="w-full flex items-center justify-between p-4 bg-muted rounded-2xl hover:bg-secondary transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        Restaurar configurações padrão
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </div>
  );
};

export default OptionsPage;
