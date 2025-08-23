import React, { useState } from "react";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

interface PasswordPageProps {
  onBack: () => void;
}

const PasswordPage: React.FC<PasswordPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // Simular salvamento
    console.log("Senha alterada");
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Limpar formulário
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Fraca" };
    if (password.length < 10) return { strength: 2, label: "Média" };
    if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { strength: 3, label: "Forte" };
    }
    return { strength: 2, label: "Média" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="p-4 space-y-6">
      {showSuccessMessage && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          Senha alterada com sucesso!
        </div>
      )}

      {/* Informações de segurança */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Dicas de Segurança</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Use pelo menos 8 caracteres</p>
          <p>• Inclua letras maiúsculas e minúsculas</p>
          <p>• Adicione números e símbolos</p>
          <p>• Não use informações pessoais</p>
        </div>
      </div>

      {/* Formulário de alteração de senha */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha atual */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nova senha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Indicador de força da senha */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1
                          ? "w-1/3 bg-red-500"
                          : passwordStrength.strength === 2
                            ? "w-2/3 bg-yellow-500"
                            : passwordStrength.strength === 3
                              ? "w-full bg-green-500"
                              : "w-0"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar nova senha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Verificação de coincidência */}
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.newPassword === formData.confirmPassword ? (
                  <p className="text-xs text-green-600">✓ Senhas coincidem</p>
                ) : (
                  <p className="text-xs text-red-600">✗ Senhas não coincidem</p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Alterar Senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPage;
