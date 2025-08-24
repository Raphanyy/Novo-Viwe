import React, { useState } from "react";
import { CreditCard, Settings, ArrowLeft } from "lucide-react";
import SettingsSection from "../SettingsSection";
import UpdatePlanPage from "./UpdatePlanPage";

interface PlanBillingPageProps {
  onBack: () => void;
}

const PlanBillingPage: React.FC<PlanBillingPageProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<"main" | "update-plan">(
    "main",
  );

  if (currentView === "update-plan") {
    return <UpdatePlanPage onBack={() => setCurrentView("main")} />;
  }

  return (
    <div className="p-4 space-y-4">
      <SettingsSection
        title="Atualizar meu plano"
        subtitle="Gerencie sua assinatura e upgrade"
        icon={CreditCard}
        onClick={() => setCurrentView("update-plan")}
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
