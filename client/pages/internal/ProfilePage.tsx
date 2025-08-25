import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  User,
  Shield,
  HelpCircle,
  ChevronRight,
  Edit3,
  Settings,
  CreditCard,
  Lock,
  Database,
  LogOut,
  Heart,
} from "lucide-react";

// Import modular components
import ProfileCard from "../../components/profile/ProfileCard";
import ProfileHeader from "../../components/profile/ProfileHeader";
import SettingsSection from "../../components/profile/SettingsSection";

// Import secondary pages
import PersonalInfoPage from "../../components/profile/pages/PersonalInfoPage";
import PasswordPage from "../../components/profile/pages/PasswordPage";
import PlanBillingPage from "../../components/profile/pages/PlanBillingPage";

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
      subtitle: "Dados pessoais.",
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
          component: PlanBillingPage,
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
      subtitle: "Senha e segurança.",
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
      id: "support",
      title: "Recursos adicionais",
      subtitle: "Ajuda e suporte.",
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

      {/* Avaliação da Experiência */}
      <button className="w-full bg-card rounded-xl p-4 border border-border text-left transition-colors hover:bg-accent/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10">
            <Heart className="h-5 w-5 text-blue-500 fill-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">
              Avalie sua experiência
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* Logout Button */}
      <div className="mt-4">
        <button
          onClick={logout}
          className="w-full bg-destructive/10 text-destructive rounded-xl p-4 border border-destructive/20 text-center transition-colors hover:bg-destructive/20"
        >
          <div className="flex items-center justify-center space-x-2">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </div>
        </button>
      </div>
    </div>
  );

  // Nível 2: Subseções de uma categoria
  const renderSecondaryLevel = () => {
    const section = getCurrentSection();
    if (!section) return null;

    return (
      <div className="p-4 space-y-3">
        {/* Itens da seção */}
        {section.items?.map((item) => (
          <SettingsSection
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            onClick={
              item.hasSettings ? () => navigateToSubSection(item.id) : undefined
            }
          />
        ))}
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
