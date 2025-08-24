import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, Menu, X, Compass } from "lucide-react";

// === Logo Real da Viwe ===
const ViweLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <img
    src="https://cdn.builder.io/api/v1/image/assets%2F6c1daba7e59b4ec58eff5c97822a2701%2Fd6f16773cb7b41a3a689efc7c5e77e61?format=webp&width=800"
    alt="Viwe Logo"
    className={`${className} object-contain`}
  />
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="bg-background min-h-screen text-foreground font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-4 transition-all duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center group">
            <ViweLogo className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
            <Link
              to="/"
              className="font-bold text-xl ml-2 text-foreground group-hover:text-primary transition-colors"
            >
              Viwe
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 text-muted-foreground font-medium">
            <Link
              to="/features"
              className="hover:text-foreground transition-colors duration-200"
            >
              Funcionalidades
            </Link>
            <Link
              to="/about"
              className="hover:text-foreground transition-colors duration-200"
            >
              Sobre nós
            </Link>
            <Link
              to="/pricing"
              className="hover:text-foreground transition-colors duration-200"
            >
              Preços
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-muted-foreground font-medium hover:text-foreground transition-colors duration-200 hidden md:block"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200 transform hover:-translate-y-0.5 hidden md:block"
            >
              Começar agora
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors duration-200"
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
          <div className="flex flex-col items-start px-6 py-4 space-y-2 text-muted-foreground font-medium bg-background border-t border-border">
            <Link
              to="/features"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              to="/about"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre nós
            </Link>
            <Link
              to="/pricing"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>
            <Link
              to="/login"
              className="w-full py-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 text-center"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24">
        {children}

        {/* CTA Section - Show on all pages except pricing and login */}
        {location.pathname !== "/pricing" && location.pathname !== "/login" && (
          <section className="bg-secondary py-20 text-center border-t border-border">
            <div className="container mx-auto px-6 flex flex-col">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">
                Pronto para sua próxima aventura?
              </h2>
              <p className="mt-4 text-lg max-w-xl self-center text-muted-foreground">
                Crie sua conta e comece agora mesmo para começar a usar
                <br />
                <br />
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Link
                  to="/login"
                  className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg"
                >
                  Começar a planejar
                </Link>
                <button className="border border-border text-muted-foreground px-7 py-3 rounded-full font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                  Contatar suporte
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer - Hide on login page */}
      {location.pathname !== "/login" && (
        <footer className="bg-secondary text-muted-foreground py-16 border-t border-border">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center">
              <ViweLogo className="h-6 w-6" />
              <span className="font-bold text-lg ml-2 text-foreground">
                Viwe
              </span>
            </div>
            <p className="mt-4 text-sm max-w-xs">
              Planejador de rotas <br /> para o mundo.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Funcionalidades</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/features"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Otimização
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Trânsito
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Pontos de interesse
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Compartilhar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Empresa</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Ajuda</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Suporte
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Termos de uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Política de privacidade
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Idioma</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Português (Brasil)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  English (United States)
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-muted-foreground/60">
              © 2024 Viwe. Todos os direitos reservados.
            </p>
          </div>
        </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
