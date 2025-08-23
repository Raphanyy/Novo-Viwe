import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
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

const OptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Função para renderizar a seção apropriada com base na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "account":
        return <AccountSection />;
      case "preferences":
        return <PreferencesSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Seção do cabeçalho com abas para mobile */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 sm:hidden">
        <h1 className="text-xl font-bold text-center p-4">Configurações</h1>

        {/* Navegação de abas no header mobile */}
        <nav className="border-t border-gray-200">
          <ul className="flex justify-around items-center">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex flex-col items-center justify-center w-full py-3 text-xs font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500"
                }`}
              >
                <User size={18} />
                <span className="mt-1">Perfil</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("account")}
                className={`flex flex-col items-center justify-center w-full py-3 text-xs font-medium transition-colors ${
                  activeTab === "account"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500"
                }`}
              >
                <Settings size={18} />
                <span className="mt-1">Conta</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex flex-col items-center justify-center w-full py-3 text-xs font-medium transition-colors ${
                  activeTab === "preferences"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500"
                }`}
              >
                <Sliders size={18} />
                <span className="mt-1">Preferências</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Área de conteúdo principal */}
      <main className="p-4 space-y-6">
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden sm:block">
          <div className="bg-white rounded-2xl shadow-md mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 flex items-center justify-center py-4 rounded-2xl transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User size={20} className="mr-2" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`flex-1 flex items-center justify-center py-4 rounded-2xl transition-colors ${
                  activeTab === "account"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Settings size={20} className="mr-2" />
                Conta
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex-1 flex items-center justify-center py-4 rounded-2xl transition-colors ${
                  activeTab === "preferences"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Sliders size={20} className="mr-2" />
                Preferências
              </button>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-xl shadow-md p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// 1. Componente para a seção de Perfil
function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "Nome do Usuário");
  const [email, setEmail] = useState(user?.email || "email@exemplo.com");
  const [company, setCompany] = useState("Nome da Empresa");
  const [country, setCountry] = useState("Brasil");
  const [city, setCity] = useState("Rio de Janeiro");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile saved:", { name, email, company, country, city });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-2">Seu Perfil</h2>

      {showSuccessMessage && (
        <div className="p-3 bg-green-500 text-white rounded-lg text-center animate-pulse">
          Alterações salvas com sucesso!
        </div>
      )}

      {/* Seção da foto de perfil */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl">
          {name.charAt(0).toUpperCase()}
        </div>
        <button className="text-blue-600 font-medium hover:underline">
          Alterar Foto
        </button>
      </div>

      {/* Formulário de informações do perfil */}
      <form onSubmit={handleSave} className="flex flex-col gap-4">
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
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
  );
}

// 2. Componente para a seção de configurações da Conta
function AccountSection() {
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    if (action === "updates") {
      setShowUpdateMessage(true);
      setTimeout(() => setShowUpdateMessage(false), 2000);
    } else {
      alert(`Ação de '${action}' acionada!`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-2">Configurações da Conta</h2>

      {showUpdateMessage && (
        <div className="p-3 bg-blue-500 text-white rounded-lg text-center animate-pulse">
          Nenhuma atualização disponível.
        </div>
      )}

      {/* Cards para as opções de conta */}
      <div className="space-y-3">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Meus Planos")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <CreditCard size={20} className="text-gray-500" />
              <span className="font-medium">Meus Planos</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Preferências de Pagamento")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <CreditCard size={20} className="text-gray-500" />
              <span className="font-medium">Preferências de Pagamento</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Remover Anúncios")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <BadgeMinus size={20} className="text-gray-500" />
              <span className="font-medium">Remover Anúncios</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Tutoriais")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <BookOpen size={20} className="text-gray-500" />
              <span className="font-medium">Tutoriais</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Emergências")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <AlertCircle size={20} className="text-gray-500" />
              <span className="font-medium">Emergências</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Relatórios")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <FileText size={20} className="text-gray-500" />
              <span className="font-medium">Relatórios</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Denúncias")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <Flag size={20} className="text-gray-500" />
              <span className="font-medium">Denúncias</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Suporte and FAQ card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Suporte")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <HelpCircle size={20} className="text-gray-500" />
              <span className="font-medium">Suporte / FAQ</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Security card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("Segurança")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <Shield size={20} className="text-gray-500" />
              <span className="font-medium">Segurança</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Updates card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <button
            onClick={() => handleAction("updates")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <RefreshCcw size={20} className="text-gray-500" />
              <span className="font-medium">Atualizações</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
        <Info size={16} />
        <p>Versão do aplicativo: 1.0.0</p>
      </div>
    </div>
  );
}

// 3. Componente para a seção de Preferências (consolidado)
function PreferencesSection() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [selectedNavigation, setSelectedNavigation] = useState("integrated");
  const [ignoreConsumption, setIgnoreConsumption] = useState(false);
  const [routePreference, setRoutePreference] = useState("balanced");
  const [selectedFuel, setSelectedFuel] = useState("gasoline");
  const [fuelConsumption, setFuelConsumption] = useState("12");
  const [avoidOptions, setAvoidOptions] = useState({
    tolls: false,
    highways: false,
    ferries: false,
    unpaved: true,
  });
  const [navigationSettings, setNavigationSettings] = useState({
    voiceGuidance: true,
    soundAlerts: true,
    autoZoom: true,
    nightMode: false,
  });

  const vehicles = [
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

  const routeTypes = [
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

  const fuelTypes = [
    { id: "gasoline", name: "Gasolina", price: "R$ 5,49/L" },
    { id: "ethanol", name: "Etanol", price: "R$ 3,89/L" },
    { id: "diesel", name: "Diesel", price: "R$ 4,99/L" },
    { id: "electric", name: "Elétrico", price: "R$ 0,45/kWh" },
  ];

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    console.log("Dark mode:", !isDarkMode);
  };

  const handleToggleConsumption = () => {
    setIgnoreConsumption(!ignoreConsumption);
    console.log("Ignore consumption:", !ignoreConsumption);
  };

  const toggleAvoidOption = (option: keyof typeof avoidOptions) => {
    setAvoidOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const toggleNavigationSetting = (
    setting: keyof typeof navigationSettings,
  ) => {
    setNavigationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-2">Preferências</h2>

      {/* Vehicle Type */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Tipo de Veículo</h3>
        <div className="grid grid-cols-2 gap-3">
          {vehicles.map((vehicle) => {
            const Icon = vehicle.icon;
            const isSelected = selectedVehicle === vehicle.id;

            return (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon
                  className={`h-8 w-8 mb-2 mx-auto ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                />
                <h4
                  className={`font-medium text-sm ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                >
                  {vehicle.name}
                </h4>
                <p
                  className={`text-xs mt-1 ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                >
                  {vehicle.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Preferência de Rota</h3>
        <div className="space-y-3">
          {routeTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = routePreference === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setRoutePreference(type.id)}
                className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4
                    className={`font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                  >
                    {type.name}
                  </h4>
                  <p
                    className={`text-sm ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                  >
                    {type.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
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
      </div>

      {/* Navigation Preference */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Preferência de Navegação</h3>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="navigation"
              value="integrated"
              checked={selectedNavigation === "integrated"}
              onChange={() => setSelectedNavigation("integrated")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <MapPin size={20} className="ml-2" />
            <span className="ml-2 text-sm">Integrada</span>
          </label>
          <label className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="navigation"
              value="google"
              checked={selectedNavigation === "google"}
              onChange={() => setSelectedNavigation("google")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <Map size={20} className="ml-2" />
            <span className="ml-2 text-sm">Google Maps</span>
          </label>
          <label className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="navigation"
              value="waze"
              checked={selectedNavigation === "waze"}
              onChange={() => setSelectedNavigation("waze")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <Waypoints size={20} className="ml-2" />
            <span className="ml-2 text-sm">Waze</span>
          </label>
        </div>
      </div>

      {/* Fuel Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">
          Configuração de Combustível
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Combustível
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fuelTypes.map((fuel) => (
                <button
                  key={fuel.id}
                  onClick={() => setSelectedFuel(fuel.id)}
                  className={`p-3 rounded-xl text-left transition-all duration-200 ${
                    selectedFuel === fuel.id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <p
                    className={`font-medium text-sm ${
                      selectedFuel === fuel.id
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {fuel.name}
                  </p>
                  <p
                    className={`text-xs ${
                      selectedFuel === fuel.id
                        ? "text-blue-600"
                        : "text-gray-500"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usado para calcular custos estimados da viagem
            </p>
          </div>
        </div>
      </div>

      {/* Avoid Options */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Evitar nas Rotas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Pedágios</p>
                <p className="text-sm text-gray-500">
                  Evitar estradas com cobrança
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleAvoidOption("tolls")}
              className={`transition-colors duration-200 ${
                avoidOptions.tolls ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {avoidOptions.tolls ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Route className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Rodovias</p>
                <p className="text-sm text-gray-500">Preferir vias urbanas</p>
              </div>
            </div>
            <button
              onClick={() => toggleAvoidOption("highways")}
              className={`transition-colors duration-200 ${
                avoidOptions.highways ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {avoidOptions.highways ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Balsas</p>
                <p className="text-sm text-gray-500">
                  Evitar travessias marítimas
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleAvoidOption("ferries")}
              className={`transition-colors duration-200 ${
                avoidOptions.ferries ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {avoidOptions.ferries ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Estradas não pavimentadas
                </p>
                <p className="text-sm text-gray-500">Apenas vias asfaltadas</p>
              </div>
            </div>
            <button
              onClick={() => toggleAvoidOption("unpaved")}
              className={`transition-colors duration-200 ${
                avoidOptions.unpaved ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {avoidOptions.unpaved ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">
          Configurações de Navegação
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Orientação por voz</p>
                <p className="text-sm text-gray-500">
                  Instruções faladas durante a navegação
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNavigationSetting("voiceGuidance")}
              className={`transition-colors duration-200 ${
                navigationSettings.voiceGuidance
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {navigationSettings.voiceGuidance ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <VolumeX className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Alertas sonoros</p>
                <p className="text-sm text-gray-500">
                  Sons de alerta para mudanças
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNavigationSetting("soundAlerts")}
              className={`transition-colors duration-200 ${
                navigationSettings.soundAlerts
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {navigationSettings.soundAlerts ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Zoom automático</p>
                <p className="text-sm text-gray-500">
                  Ajusta zoom conforme velocidade
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNavigationSetting("autoZoom")}
              className={`transition-colors duration-200 ${
                navigationSettings.autoZoom ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {navigationSettings.autoZoom ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Modo noturno automático
                </p>
                <p className="text-sm text-gray-500">
                  Ativa tema escuro após 18h
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNavigationSetting("nightMode")}
              className={`transition-colors duration-200 ${
                navigationSettings.nightMode ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {navigationSettings.nightMode ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Theme and Other Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Outras Configurações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isDarkMode ? (
                <Moon size={20} className="text-gray-500" />
              ) : (
                <Sun size={20} className="text-gray-500" />
              )}
              <span className="font-medium">Tema Escuro</span>
            </div>
            <div
              onClick={handleToggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Gauge size={20} className="text-gray-500" />
              <span className="font-medium">Ignorar Consumo</span>
            </div>
            <div
              onClick={handleToggleConsumption}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${ignoreConsumption ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ignoreConsumption ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Restore Defaults */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold mb-4 text-lg">Ações</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Restaurar configurações padrão
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;
