import React from "react";
import ProfileForm from "../ProfileForm";
import ProfileCard from "../ProfileCard";

interface PersonalInfoPageProps {
  onBack: () => void;
}

const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({ onBack }) => {
  return (
    <div className="p-4 space-y-6">
      {/* Perfil atual */}
      <ProfileCard 
        variant="secondary" 
        showEditButton={false}
      />
      
      {/* Formulário de edição */}
      <ProfileForm />
      
      {/* Informações adicionais */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-2">Informações importantes</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Seu nome será exibido para outros usuários do aplicativo</p>
          <p>• Alterações no email podem requerer verificação</p>
          <p>• Mantenha suas informações atualizadas para melhor experiência</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
