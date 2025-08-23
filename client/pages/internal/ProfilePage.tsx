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
} from "lucide-react";

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
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(NavigationLevel.PRIMARY);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubSection, setSelectedSubSection] = useState<string | null>(null);

  // Configuração das seções principais do perfil (Nível 1)
  const profileSections: ProfileSection[] = [
    {
      id: "account",
      title: "Sua conta", 
      subtitle: "Veja informações sobre sua conta, baixe um arquivo com seus dados ou saiba mais sobre as opções de desativação de conta.",
      icon: User,
      items: [
        {
          id: "personal-info",
          title: "Informações da conta",
          subtitle: "Altere suas informações pessoais",
          icon: Edit3,
          hasSettings: true,
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
      subtitle: "Gerencie a segurança da sua conta e monitore o uso dela, inclusive os aplicativos conectados a ela.",
      icon: Shield,
      items: [
        {
          id: "password",
          title: "Alterar senha",
          subtitle: "Altere sua senha a qualquer momento",
          icon: Lock,
          hasSettings: true,
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
      subtitle: "Gerencie as informações que você vê e compartilha no app.",
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
      subtitle: "Selecione os tipos de notificação que você recebe sobre atividades, interesses e recomendações.",
      icon: Bell,
      items: [
        {
          id: "push-notifications",
          title: "Notificações push",
          subtitle: "Configure notificações do dispositivo",
          icon: Bell,
          hasSettings: true,
        },
        {
          id: "email-notifications", 
          title: "Notificações por email",
          subtitle: "Configure notificações por email",
          icon: Bell,
          hasSettings: true,
        },
      ],
    },
    {
      id: "appearance",
      title: "Acessibilidade, exibição e idiomas",
      subtitle: "Gerencie a forma como o conteúdo é exibido para você.",
      icon: Palette,
      items: [
        {
          id: "theme",
          title: "Tema",
          subtitle: "Escolha como o app será exibido",
          icon: Palette,
          hasSettings: true,
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
      subtitle: "Verifique em outros lugares informações úteis para saber mais sobre os produtos e serviços.",
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
    return profileSections.find(section => section.id === selectedSection);
  };

  const getCurrentSubSection = () => {
    const section = getCurrentSection();
    return section?.items?.find(item => item.id === selectedSubSection);
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
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Seções do Perfil */}
      <div className="space-y-4">
        {profileSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigateToSection(section.id)}
              className="w-full bg-card rounded-2xl p-6 border border-border text-left hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.subtitle}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
              </div>
            </button>
          );
        })}
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
          <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
        </div>

        {/* Itens da seção */}
        <div className="space-y-3">
          {section.items?.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => item.hasSettings ? navigateToSubSection(item.id) : undefined}
                className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ItemIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                  {item.hasSettings && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Nível 3: Configurações específicas
  const renderTertiaryLevel = () => {
    const subSection = getCurrentSubSection();
    if (!subSection) return null;

    return (
      <div className="p-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">{subSection.title}</h3>
          <p className="text-muted-foreground">
            Configurações para {subSection.title.toLowerCase()} serão implementadas aqui.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center">
        {currentLevel !== NavigationLevel.PRIMARY && (
          <button
            onClick={goBack}
            className="p-2 hover:bg-accent rounded-lg mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">
          {currentLevel === NavigationLevel.PRIMARY && "Configurações"}
          {currentLevel === NavigationLevel.SECONDARY && getCurrentSection()?.title}
          {currentLevel === NavigationLevel.TERTIARY && getCurrentSubSection()?.title}
        </h1>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
