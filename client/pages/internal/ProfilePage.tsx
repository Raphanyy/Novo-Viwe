import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  HelpCircle,
  ChevronRight,
  Edit3,
  Settings,
  CreditCard,
  Lock,
  Eye,
  Database,
  Volume2,
  LogOut,
  Mail,
} from "lucide-react";

// Import modular components
import ProfileCard from "../../components/profile/ProfileCard";
import ProfileHeader from "../../components/profile/ProfileHeader";
import SettingsSection from "../../components/profile/SettingsSection";

// Import secondary pages
import PersonalInfoPage from "../../components/profile/pages/PersonalInfoPage";
import PasswordPage from "../../components/profile/pages/PasswordPage";
import NotificationSettingsPage from "../../components/profile/pages/NotificationSettingsPage";
import ThemeSettingsPage from "../../components/profile/pages/ThemeSettingsPage";

// Enum para os níveis de navegação
enum NavigationLevel {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERTIARY = "tertiary",
}

// Interface para as seções principais
interface ProfileSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: ProfileSubSection[];
}

interface ProfileSubSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSettings?: boolean;
  component?: React.ComponentType<{ onBack: () => void }>;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubSection, setSelectedSubSection] = useState<string | null>(
    null,
  );

  // Configuração das seções principais do perfil (Nível 1)
  const profileSections: ProfileSection[] = [
    {
      id: "account",
      title: "Sua conta",
      subtitle: "Gerencie suas informações pessoais e dados da conta.",
      icon: User,
      items: [
        {
          id: "personal-info",
          title: "Informações da conta",
          subtitle: "Altere suas informações pessoais",
          icon: Edit3,
          hasSettings: true,
          component: PersonalInfoPage,
        },
        {
          id: "plan-billing",
          title: "Plano e faturamento",
          subtitle: "Gerencie sua assinatura e pagamentos",
          icon: CreditCard,
          hasSettings: true,
        },
        {
          id: "data-export",
          title: "Baixar seus dados",
          subtitle: "Faça download de uma cópia dos seus dados",
          icon: Database,
        },
        {
          id: "deactivate",
          title: "Desativar sua conta",
          subtitle: "Saiba como desativar sua conta",
          icon: LogOut,
        },
      ],
    },
    {
      id: "security",
      title: "Segurança e acesso à conta",
      subtitle: "Configure senha e segurança da sua conta.",
      icon: Shield,
      items: [
        {
          id: "password",
          title: "Alterar senha",
          subtitle: "Altere sua senha a qualquer momento",
          icon: Lock,
          hasSettings: true,
          component: PasswordPage,
        },
        {
          id: "two-factor",
          title: "Autenticação de dois fatores",
          subtitle: "Adicione uma camada extra de segurança",
          icon: Shield,
          hasSettings: true,
        },
        {
          id: "sessions",
          title: "Sessões ativas",
          subtitle: "Veja onde você está conectado",
          icon: Settings,
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacidade e segurança",
      subtitle: "Configure suas preferências de privacidade.",
      icon: Eye,
      items: [
        {
          id: "data-sharing",
          title: "Compartilhamento de dados",
          subtitle: "Configure o que compartilhar",
          icon: Globe,
          hasSettings: true,
        },
        {
          id: "location",
          title: "Localização",
          subtitle: "Gerencie suas configurações de localização",
          icon: Eye,
          hasSettings: true,
        },
      ],
    },
    {
      id: "notifications",
      title: "Notificações",
      subtitle: "Configure suas notificações e alertas.",
      icon: Bell,
      items: [
        {
          id: "push-notifications",
          title: "Notificações push",
          subtitle: "Configure notificações do dispositivo",
          icon: Bell,
          hasSettings: true,
          component: NotificationSettingsPage,
        },
        {
          id: "email-notifications",
          title: "Notificações por email",
          subtitle: "Configure notificações por email",
          icon: Mail,
          hasSettings: true,
        },
      ],
    },
    {
      id: "appearance",
      title: "Acessibilidade, exibição e idiomas",
      subtitle: "Personalize aparência e idioma do app.",
      icon: Palette,
      items: [
        {
          id: "theme",
          title: "Tema",
          subtitle: "Escolha como o app será exibido",
          icon: Palette,
          hasSettings: true,
          component: ThemeSettingsPage,
        },
        {
          id: "language",
          title: "Idioma",
          subtitle: "Selecione seu idioma preferido",
          icon: Globe,
          hasSettings: true,
        },
        {
          id: "voice",
          title: "Navegação por voz",
          subtitle: "Configure orientações por voz",
          icon: Volume2,
          hasSettings: true,
        },
      ],
    },
    {
      id: "support",
      title: "Recursos adicionais",
      subtitle: "Acesse ajuda e suporte técnico.",
      icon: HelpCircle,
      items: [
        {
          id: "help-center",
          title: "Central de ajuda",
          subtitle: "Encontre respostas para suas dúvidas",
          icon: HelpCircle,
        },
        {
          id: "contact",
          title: "Contatar suporte",
          subtitle: "Fale conosco diretamente",
          icon: HelpCircle,
        },
      ],
    },
  ];

  // Funções de navegação
  const navigateToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentLevel(NavigationLevel.SECONDARY);
  };

  const navigateToSubSection = (subSectionId: string) => {
    setSelectedSubSection(subSectionId);
    setCurrentLevel(NavigationLevel.TERTIARY);
  };

  const goBack = () => {
    if (currentLevel === NavigationLevel.TERTIARY) {
      setCurrentLevel(NavigationLevel.SECONDARY);
      setSelectedSubSection(null);
    } else if (currentLevel === NavigationLevel.SECONDARY) {
      setCurrentLevel(NavigationLevel.PRIMARY);
      setSelectedSection(null);
    }
  };

  const getCurrentSection = () => {
    return profileSections.find((section) => section.id === selectedSection);
  };

  const getCurrentSubSection = () => {
    const section = getCurrentSection();
    return section?.items?.find((item) => item.id === selectedSubSection);
  };

  // Renderização condicional baseada no nível atual
  const renderContent = () => {
    switch (currentLevel) {
      case NavigationLevel.PRIMARY:
        return renderPrimaryLevel();
      case NavigationLevel.SECONDARY:
        return renderSecondaryLevel();
      case NavigationLevel.TERTIARY:
        return renderTertiaryLevel();
      default:
        return renderPrimaryLevel();
    }
  };

  // Nível 1: Tela principal do perfil
  const renderPrimaryLevel = () => (
    <div className="p-4 space-y-6">
      {/* Card do Usuário */}
      <ProfileCard />

      {/* Seções do Perfil */}
      <div className="space-y-4">
        {profileSections.map((section) => (
          <SettingsSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            onClick={() => navigateToSection(section.id)}
          />
        ))}
      </div>
    </div>
  );

  // Nível 2: Subseções de uma categoria
  const renderSecondaryLevel = () => {
    const section = getCurrentSection();
    if (!section) return null;

    const Icon = section.icon;

    return (
      <div className="p-4 space-y-4">
        {/* Header da seção */}
        <div className="flex items-center space-x-3 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {section.title}
          </h2>
        </div>

        {/* Itens da seção */}
        <div className="space-y-3">
          {section.items?.map((item) => (
            <SettingsSection
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onClick={
                item.hasSettings
                  ? () => navigateToSubSection(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    );
  };

  // Nível 3: Configurações específicas
  const renderTertiaryLevel = () => {
    const subSection = getCurrentSubSection();
    if (!subSection) return null;

    // Se existe um componente específico, renderiza ele
    if (subSection.component) {
      const Component = subSection.component;
      return <Component onBack={goBack} />;
    }

    // Caso contrário, renderiza uma página genérica
    return (
      <div className="p-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {subSection.title}
          </h3>
          <p className="text-muted-foreground">
            Configurações para {subSection.title.toLowerCase()} serão
            implementadas aqui.
          </p>
        </div>
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (currentLevel === NavigationLevel.PRIMARY) return "Configurações";
    if (currentLevel === NavigationLevel.SECONDARY)
      return getCurrentSection()?.title;
    if (currentLevel === NavigationLevel.TERTIARY)
      return getCurrentSubSection()?.title;
    return "Configurações";
  };

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <ProfileHeader
        title={getHeaderTitle() || "Configurações"}
        showBackButton={currentLevel !== NavigationLevel.PRIMARY}
        onBack={goBack}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default ProfilePage;
