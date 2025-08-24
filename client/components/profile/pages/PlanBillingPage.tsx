import React from "react";
import { CreditCard, Settings } from "lucide-react";
import SettingsSection from "../SettingsSection";

interface PlanBillingPageProps {
  onBack: () => void;
}

const PlanBillingPage: React.FC<PlanBillingPageProps> = ({ onBack }) => {
  return (
    <div className="p-4 space-y-4">
      <SettingsSection
        title="Atualizar meu plano"
        subtitle="Gerencie sua assinatura e upgrade"
        icon={CreditCard}
        onClick={() => {
          // Funcionalidade será implementada futuramente
        }}
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
