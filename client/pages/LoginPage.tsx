import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Rocket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  MapPin,
  Route,
  Share2,
} from "lucide-react";

const LoginPage: React.FC = () => {
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
    <div
      className="min-h-screen bg-gradient-to-br from-background to-muted font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header simples */}
      <header className="absolute top-0 left-0 w-full z-10 p-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Link>

          <div className="flex items-center">
            <Rocket className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl ml-2 text-foreground">Viwe</span>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex">
        {/* Lado esquerdo - Formulário de Login */}
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-lg text-muted-foreground">
                Faça login para continuar sua jornada
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-muted-foreground mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-foreground placeholder-muted-foreground"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-muted-foreground mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-foreground placeholder-muted-foreground"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>

              {/* Links */}
              <div className="text-center space-y-4">
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                >
                  Esqueceu sua senha?
                </a>

                <div className="text-muted-foreground text-sm">
                  Não tem uma conta?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                Use suas credenciais reais do Supabase
              </p>
            </div>
          </div>
        </div>

        {/* Lado direito - Showcase (Desktop only) */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-2xl transform rotate-12"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-2xl transform -rotate-6"></div>
            <div className="absolute bottom-32 left-16 w-40 h-40 border-2 border-white rounded-2xl transform rotate-6"></div>
            <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white rounded-2xl transform -rotate-12"></div>
          </div>

          <div className="flex flex-col justify-center items-center text-white p-12 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4">
                Planeje suas rotas com inteligência
              </h2>
              <p className="text-xl text-blue-100 max-w-md">
                Junte-se a milhões de viajantes que já descobriram a forma mais
                eficiente de chegar ao destino.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Route className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Rotas Otimizadas</h3>
                  <p className="text-blue-100 text-sm">
                    Economize tempo e combustível
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Pontos de Interesse</h3>
                  <p className="text-blue-100 text-sm">
                    Descubra lugares incríveis
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Share2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Compartilhamento</h3>
                  <p className="text-blue-100 text-sm">
                    Divida seus planos com facilidade
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">2M+</div>
                <div className="text-blue-200 text-sm">Usuários</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50M+</div>
                <div className="text-blue-200 text-sm">Rotas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">30%</div>
                <div className="text-blue-200 text-sm">Economia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
