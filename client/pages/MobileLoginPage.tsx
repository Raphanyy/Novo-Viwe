import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MobileLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    // Simulação de login com Google
    const success = await login("google@example.com", "password");
    if (success) {
      navigate("/app");
    }
  };

  const handleAppleLogin = async () => {
    // Simulação de login com Apple
    const success = await login("apple@example.com", "password");
    if (success) {
      navigate("/app");
    }
  };

  const handleEmailLogin = () => {
    // Redirecionar para tela de login com email (pode usar a LoginPage existente)
    navigate("/login-email");
  };

  const handleSignup = () => {
    // Redirecionar para cadastro
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Área superior com logo e título */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-12">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fd5c53ac52fed4b2bb10c3c1f5dacdb73%2Feab00c94f63d45fc8e3a12589b9a235f?format=webp&width=800"
            alt="Viwe Logo"
            className="w-40 h-40 mx-auto"
          />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-light text-foreground text-center tracking-[0.5em]">
          V i w e
        </h1>
      </div>

      {/* Botões na parte inferior */}
      <div className="px-6 pb-12">
        <div className="w-full max-w-sm mx-auto space-y-4">
          {/* Botão Entrar */}
          <button
            onClick={handleEmailLogin}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Entrar
          </button>

          {/* Botão Cadastro */}
          <button
            onClick={handleSignup}
            className="w-full border border-border text-foreground py-4 px-6 rounded-2xl font-medium hover:bg-muted transition-colors duration-200"
          >
            Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
