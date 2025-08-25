import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Save, Loader2 } from "lucide-react";
import ViweLoader from "../shared/ViweLoader";

interface ProfileFormProps {
  onSave?: (data: ProfileFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface ProfileFormData {
  name: string;
  email: string;
  company?: string;
  country?: string;
  city?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    country: "Brasil",
    city: "",
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        company: "",
        country: "Brasil",
        city: "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Atualiza o usuário no contexto localmente
      updateUser({
        name: formData.name,
        email: formData.email,
      });

      // Salva no backend
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Perfil salvo no backend:", data.user);

        // Atualiza com dados do backend
        updateUser(data.user);
      } else {
        console.error("❌ Erro ao salvar perfil no backend");
      }

      // Chama callback personalizado se fornecido
      if (onSave) {
        onSave(formData);
      }

      // Mostra mensagem de sucesso
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          Perfil atualizado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Endereço de E-mail
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Nome da Empresa (Opcional)
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-foreground mb-2"
            >
              País
            </label>
            <input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Cidade
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <ViweLoader size="xs" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isLoading ? "Salvando..." : "Salvar Alterações"}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
