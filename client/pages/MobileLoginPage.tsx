import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/logo-animation.css";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-blue-400/3 rounded-full blur-2xl"></div>
      </div>

      {/* Área central com textos */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo oficial centralizada com animação */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 overflow-hidden">
            {/* Overlay que se move da esquerda para direita */}
            <div
              className="absolute inset-0 bg-background z-10"
              style={{
                transform: 'translateX(-100%)',
                animation: 'slideRight 2s ease-out forwards',
              }}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd5c53ac52fed4b2bb10c3c1f5dacdb73%2F83e633ef02914957b822f0c6a448850f?format=webp&width=800"
              alt="Viwe Logo"
              className="w-full h-full object-contain select-none pointer-events-none"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
              draggable={false}
            />
          </div>
        </div>

        <style>{`
          @keyframes slideRight {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>

      {/* Botões na parte inferior */}
      <div className="px-6 pb-12 relative z-10">
        <div className="w-full max-w-sm mx-auto space-y-4">
          {/* Botão Entrar */}
          <button
            onClick={handleEmailLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
          >
            Entrar
          </button>

          {/* Botão Cadastro */}
          <button
            onClick={handleSignup}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium hover:bg-gray-900 transition-all duration-300 border-2 border-white shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
