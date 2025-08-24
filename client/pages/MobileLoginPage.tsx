import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Rocket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Route,
  Star,
  Zap,
} from "lucide-react";

const MobileLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/app");
      } else {
        setError("Email ou senha inválidos. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="p-3 bg-blue-600/10 backdrop-blur-sm rounded-2xl">
              <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao Viwe
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-6">
            Sua jornada inteligente começa aqui
          </p>
        </div>

        {/* Login Form */}
        <div className="flex-1 px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="max-w-sm mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-foreground placeholder-muted-foreground text-base"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 sm:py-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-foreground placeholder-muted-foreground text-base"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-2xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </form>

            {/* Demo Info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-2xl border border-border">
              <p className="text-center text-xs text-muted-foreground">
                💡 Para demonstração, use qualquer email e senha
              </p>
            </div>

            {/* Create Account */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Não tem uma conta?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Criar conta gratuita
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="flex-shrink-0 px-6 pb-8">
          <div className="max-w-sm mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border">
                <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Route className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-foreground">Rotas</p>
                <p className="text-xs text-muted-foreground">Inteligentes</p>
              </div>

              <div className="p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border">
                <div className="w-8 h-8 bg-green-600/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs font-medium text-foreground">Pontos</p>
                <p className="text-xs text-muted-foreground">de Interesse</p>
              </div>

              <div className="p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border">
                <div className="w-8 h-8 bg-purple-600/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-foreground">Economia</p>
                <p className="text-xs text-muted-foreground">de Tempo</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Avaliado 5.0 por mais de 2M+ usuários
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
