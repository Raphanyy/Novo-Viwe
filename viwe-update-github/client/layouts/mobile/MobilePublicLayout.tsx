import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, Menu, X } from "lucide-react";

interface MobilePublicLayoutProps {
  children: React.ReactNode;
}

const MobilePublicLayout: React.FC<MobilePublicLayoutProps> = ({
  children,
}) => {
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

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Rocket className="h-7 w-7 text-blue-600" />
            <Link to="/" className="font-bold text-xl ml-2 text-gray-900">
              Viwe
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col px-4 py-4 space-y-3 bg-white border-t border-gray-100">
            <Link
              to="/features"
              className="py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              to="/about"
              className="py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre nós
            </Link>
            <Link
              to="/pricing"
              className="py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>
            <Link
              to="/login"
              className="py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Entrar
            </Link>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
              Começar agora
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}

        {/* Mobile CTA Section */}
        {location.pathname !== "/pricing" && (
          <section className="bg-gray-900 py-16 text-white text-center px-4">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold leading-tight">
                Pronto para sua próxima aventura?
              </h2>
              <p className="mt-4 text-gray-400">
                Crie sua conta agora e comece a planejar seus trajetos com a
                Viwe.
              </p>
              <div className="mt-6 space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                  Começar a planejar
                </button>
                <button className="w-full border border-gray-400 text-gray-400 py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 hover:text-white transition-colors duration-200">
                  Contatar suporte
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg ml-2 text-white">Viwe</span>
          </div>
          <p className="text-sm mb-6">Planejador de rotas para o mundo.</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-3">Produto</h4>
              <div className="space-y-2">
                <Link
                  to="/features"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Funcionalidades
                </Link>
                <Link
                  to="/pricing"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Preços
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Empresa</h4>
              <div className="space-y-2">
                <Link
                  to="/about"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Sobre nós
                </Link>
                <a
                  href="#"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Contato
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-500">
            © 2024 Viwe. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MobilePublicLayout;
