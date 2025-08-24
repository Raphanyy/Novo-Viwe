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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fd5c53ac52fed4b2bb10c3c1f5dacdb73%2Feab00c94f63d45fc8e3a12589b9a235f?format=webp&width=800"
          alt="Viwe Logo"
          className="w-24 h-24 mx-auto"
        />
      </div>

      {/* Frase */}
      <h1 className="text-2xl font-semibold text-foreground mb-12 text-center">
        Rotas Inteligentes
      </h1>

      {/* Botões de Login */}
      <div className="w-full max-w-sm space-y-4">
        {/* Login com Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuar com Google</span>
        </button>

        {/* Login com Apple */}
        <button
          onClick={handleAppleLogin}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center space-x-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span>Continuar com Apple</span>
        </button>

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
  );
};

export default MobileLoginPage;
