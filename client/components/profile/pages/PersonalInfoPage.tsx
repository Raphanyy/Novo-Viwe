import React from "react";
import ProfileForm from "../ProfileForm";
import ProfileCard from "../ProfileCard";
import { Camera, ChevronRight } from "lucide-react";

interface PersonalInfoPageProps {
  onBack: () => void;
}

const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({ onBack }) => {
  return (
    <div className="p-4 space-y-6">
      {/* Perfil atual */}
      <ProfileCard variant="secondary" showEditButton={false} />

      {/* Botão Atualize sua foto */}
      <button className="w-full bg-card rounded-lg p-3 border border-border text-left transition-colors hover:bg-accent/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">
              Atualize sua foto
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* Formulário de edição */}
      <ProfileForm />

      {/* Informações adicionais */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-2">
          Informações importantes
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Seu nome não aparece para outros usuários</p>
          <p>• Mantém a mesma, não altera</p>
          <p>• Mantenha suas informações atualizadas</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
