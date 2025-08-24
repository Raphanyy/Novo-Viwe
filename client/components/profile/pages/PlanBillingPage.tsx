import React, { useState } from "react";
import { CreditCard, Settings, ArrowLeft } from "lucide-react";
import SettingsSection from "../SettingsSection";
import UpdatePlanPage from "./UpdatePlanPage";

interface PlanBillingPageProps {
  onBack: () => void;
}

const PlanBillingPage: React.FC<PlanBillingPageProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'main' | 'update-plan'>('main');

  if (currentView === 'update-plan') {
    return (
      <div className="h-full bg-background flex flex-col">
        {/* Header com botão voltar */}
        <div className="flex items-center p-4 border-b border-border">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-accent rounded-lg transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">Atualizar meu plano</h2>
        </div>

        {/* Conteúdo da página */}
        <div className="flex-1 overflow-y-auto">
          <UpdatePlanPage onBack={() => setCurrentView('main')} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <SettingsSection
        title="Atualizar meu plano"
        subtitle="Gerencie sua assinatura e upgrade"
        icon={CreditCard}
        onClick={() => setCurrentView('update-plan')}
      />

      <SettingsSection
        title="Configurações do plano"
        subtitle="Ajuste as configurações do seu plano"
        icon={Settings}
        onClick={() => {
          // Funcionalidade será implementada futuramente
        }}
      />
    </div>
  );
};

export default PlanBillingPage;
