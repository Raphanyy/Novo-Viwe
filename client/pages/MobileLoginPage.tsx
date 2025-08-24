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
      {/* Área central com textos */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Título principal */}
        <h1 className="text-5xl font-light text-foreground text-center tracking-[0.5em] mb-4">
          V I W E
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-muted-foreground text-center">
          Crie Rotas Inteligentes
        </p>
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
            className="w-full bg-white text-black py-4 px-6 rounded-2xl font-medium hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
          >
            Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
