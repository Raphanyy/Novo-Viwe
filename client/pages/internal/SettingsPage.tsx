import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Download,
  Trash2,
  HelpCircle,
  MessageCircle,
  Star,
  Share2,
  ChevronRight,
  Camera,
  Edit3,
  Key,
  CreditCard,
  MapPin,
  Route,
  Zap,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Monitor,
  Palette,
  Volume2,
  VolumeX,
  LogOut,
  Database,
  Lock,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Estados para configurações
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: false,
      traffic: true,
      routes: true,
      achievements: true,
      marketing: false,
    },
    appearance: {
      theme: "auto", // auto, light, dark
      language: "pt-BR",
      units: "metric", // metric, imperial
      mapStyle: "default",
    },
    privacy: {
      locationSharing: true,
      dataCollection: false,
      analytics: true,
      crashReports: true,
    },
    voice: {
      enabled: true,
      volume: 70,
      voice: "female",
      speedWarnings: true,
    },
  });

  const toggleSetting = (section: keyof typeof settings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof (typeof prev)[typeof section]],
      },
    }));
  };

  const settingsSections = [
    {
      id: "profile",
      name: "Perfil",
      icon: User,
      description: "Informações pessoais e conta",
    },
    {
      id: "notifications",
      name: "Notificações",
      icon: Bell,
      description: "Alertas e avisos",
    },
    {
      id: "appearance",
      name: "Aparência",
      icon: Palette,
      description: "Tema e idioma",
    },
    {
      id: "privacy",
      name: "Privacidade",
      icon: Shield,
      description: "Dados e localização",
    },
    {
      id: "voice",
      name: "Navegação por Voz",
      icon: Volume2,
      description: "Comandos e orientações",
    },
    {
      id: "storage",
      name: "Armazenamento",
      icon: Database,
      description: "Cache e dados offline",
    },
  ];

  const supportOptions = [
    {
      id: "help",
      name: "Central de Ajuda",
      icon: HelpCircle,
      description: "Perguntas frequentes e tutoriais",
    },
    {
      id: "contact",
      name: "Contatar Suporte",
      icon: MessageCircle,
      description: "Fale conosco diretamente",
    },
    {
      id: "feedback",
      name: "Enviar Feedback",
      icon: Star,
      description: "Ajude-nos a melhorar",
    },
    {
      id: "share",
      name: "Compartilhar App",
      icon: Share2,
      description: "Indique para amigos",
    },
  ];

  const themeOptions = [
    { id: "auto", name: "Automático", icon: Smartphone },
    { id: "light", name: "Claro", icon: Monitor },
    { id: "dark", name: "Escuro", icon: Moon },
  ];

  const languageOptions = [
    { id: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
    { id: "en-US", name: "English (US)", flag: "🇺🇸" },
    { id: "es-ES", name: "Español", flag: "🇪🇸" },
  ];

  if (selectedSection) {
    return (
      <div className="h-full bg-gray-50">
        {/* Section Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedSection(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {settingsSections.find((s) => s.id === selectedSection)?.name}
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Section */}
          {selectedSection === "profile" && (
            <>
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {user?.name}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <button className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1">
                      <Edit3 className="h-4 w-4" />
                      <span>Editar perfil</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Alterar senha
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Plano e faturamento
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notifications Section */}
          {selectedSection === "notifications" && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configurações de Notificação
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notificações push
                    </p>
                    <p className="text-sm text-gray-500">
                      Receber alertas no dispositivo
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("notifications", "push")}
                    className={`transition-colors duration-200 ${
                      settings.notifications.push
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.notifications.push ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Alertas de trânsito
                    </p>
                    <p className="text-sm text-gray-500">
                      Congestionamentos e incidentes
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("notifications", "traffic")}
                    className={`transition-colors duration-200 ${
                      settings.notifications.traffic
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.notifications.traffic ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Novas rotas</p>
                    <p className="text-sm text-gray-500">
                      Sugestões de rotas otimizadas
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("notifications", "routes")}
                    className={`transition-colors duration-200 ${
                      settings.notifications.routes
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.notifications.routes ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Conquistas</p>
                    <p className="text-sm text-gray-500">
                      Marcos e realizações
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      toggleSetting("notifications", "achievements")
                    }
                    className={`transition-colors duration-200 ${
                      settings.notifications.achievements
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.notifications.achievements ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {selectedSection === "appearance" && (
            <>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tema
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = settings.appearance.theme === theme.id;

                    return (
                      <button
                        key={theme.id}
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              theme: theme.id as any,
                            },
                          }))
                        }
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 mb-2 mx-auto ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                        />
                        <p
                          className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                        >
                          {theme.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Idioma
                </h3>
                <div className="space-y-3">
                  {languageOptions.map((language) => (
                    <button
                      key={language.id}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          appearance: {
                            ...prev.appearance,
                            language: language.id as any,
                          },
                        }))
                      }
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-center justify-between ${
                        settings.appearance.language === language.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{language.flag}</span>
                        <span
                          className={`font-medium ${
                            settings.appearance.language === language.id
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {language.name}
                        </span>
                      </div>
                      {settings.appearance.language === language.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Privacy Section */}
          {selectedSection === "privacy" && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Privacidade e Dados
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Compartilhar localização
                    </p>
                    <p className="text-sm text-gray-500">
                      Para melhorar as rotas sugeridas
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("privacy", "locationSharing")}
                    className={`transition-colors duration-200 ${
                      settings.privacy.locationSharing
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.privacy.locationSharing ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Coleta de dados de uso
                    </p>
                    <p className="text-sm text-gray-500">
                      Ajuda a melhorar o aplicativo
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("privacy", "dataCollection")}
                    className={`transition-colors duration-200 ${
                      settings.privacy.dataCollection
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.privacy.dataCollection ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Relatórios de falhas
                    </p>
                    <p className="text-sm text-gray-500">
                      Enviar automaticamente logs de erro
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("privacy", "crashReports")}
                    className={`transition-colors duration-200 ${
                      settings.privacy.crashReports
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {settings.privacy.crashReports ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Storage Section */}
          {selectedSection === "storage" && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gerenciamento de Dados
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900">Cache de mapas</p>
                    <p className="text-sm text-gray-500">156 MB utilizados</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                    Limpar
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900">
                      Histórico de rotas
                    </p>
                    <p className="text-sm text-gray-500">23 MB utilizados</p>
                  </div>
                  <button className="text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                    Gerenciar
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900">Dados offline</p>
                    <p className="text-sm text-gray-500">89 MB utilizados</p>
                  </div>
                  <button className="text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>
    );
  }

  // Main Settings Page
  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-green-600 font-medium">
                  Plano Premium
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  Membro desde Jan 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configurações
          </h2>
          <div className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {section.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Support & Help */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suporte</h2>
          <div className="space-y-2">
            {supportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{option.name}</p>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Zona de Perigo
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors duration-200 border border-red-200">
              <div className="flex items-center space-x-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-red-900">Excluir conta</p>
                  <p className="text-sm text-red-600">
                    Ação permanente e irreversível
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-red-400" />
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Sair da conta</p>
                  <p className="text-sm text-gray-500">
                    Você precisará fazer login novamente
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Route className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Viwe</h3>
          <p className="text-sm text-gray-500 mb-2">
            Versão 2.1.4 (Build 2024.01.15)
          </p>
          <p className="text-xs text-gray-400">
            © 2024 Viwe. Todos os direitos reservados.
          </p>
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-6 sm:hidden"></div>
      </div>
    </div>
  );
};

export default SettingsPage;
