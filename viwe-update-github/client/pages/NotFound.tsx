import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MapPin, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <div className="text-center px-6">
        <div className="mb-8">
          <MapPin className="h-24 w-24 text-blue-600 mx-auto mb-4" />
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Rota não encontrada
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Parece que você se perdeu no caminho. Vamos te ajudar a voltar para a
          rota certa!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao início
          </Link>
          <Link
            to="/features"
            className="inline-flex items-center text-gray-700 px-6 py-3 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Ver funcionalidades
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
