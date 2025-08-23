import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, Menu, X, Compass } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="bg-white min-h-screen text-gray-800 font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 transition-all duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Rocket className="h-8 w-8 text-blue-600" />
            <Link to="/" className="font-bold text-xl ml-2 text-gray-900">
              Viwe
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link
              to="/features"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Funcionalidades
            </Link>
            <Link
              to="/about"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Sobre nós
            </Link>
            <Link
              to="/pricing"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Preços
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-gray-700 font-medium hover:text-gray-900 transition-colors duration-200 hidden md:block"
            >
              Entrar
            </a>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 transform hover:-translate-y-0.5 hidden md:block">
              Começar agora
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col items-start px-6 py-4 space-y-2 text-gray-700 font-medium bg-white border-t border-gray-100">
            <Link
              to="/features"
              className="w-full py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              to="/about"
              className="w-full py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre nós
            </Link>
            <Link
              to="/pricing"
              className="w-full py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>
            <a
              href="#"
              className="w-full py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Entrar
            </a>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
              Começar agora
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24">
        {children}

        {/* CTA Section - Show on all pages except pricing */}
        {location.pathname !== "/pricing" && (
          <section className="bg-gray-900 py-20 text-white text-center">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Pronto para sua próxima aventura?
              </h2>
              <p className="mt-4 text-lg max-w-xl mx-auto text-gray-400">
                Crie sua conta agora e comece a planejar seus trajetos com a
                Viwe.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <button className="bg-blue-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg">
                  Começar a planejar
                </button>
                <button className="border border-gray-400 text-gray-400 px-7 py-3 rounded-full font-semibold hover:bg-gray-800 hover:text-white transition-colors duration-200">
                  Contatar suporte
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center">
              <Compass className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg ml-2 text-white">Viwe</span>
            </div>
            <p className="mt-4 text-sm max-w-xs">
              Planejador de rotas <br /> para o mundo.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Funcionalidades</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Otimização
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Trânsito
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Pontos de interesse
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Compartilhar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Empresa</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors duration-200"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Ajuda</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Suporte
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Termos de uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Política de privacidade
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Idioma</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Português (Brasil)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  English (United States)
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-gray-500">
              © 2024 Viwe. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
