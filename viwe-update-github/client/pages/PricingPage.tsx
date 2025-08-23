import React from "react";
import { DollarSign, List, Clock, Globe } from "lucide-react";

const PricingPage: React.FC = () => (
  <div className="container mx-auto px-6 py-24 md:py-32">
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-8">
      Preços Flexíveis para Todos
    </h1>
    <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto mb-16">
      Escolha o plano que melhor se adapta às suas necessidades, seja você um
      viajante casual ou uma empresa em crescimento.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Basic Plan (Free) */}
      <div className="bg-gray-50 p-8 rounded-3xl shadow-xl flex flex-col text-center transition-transform hover:scale-105 duration-300">
        <h3 className="text-2xl font-bold text-gray-900">Plano Básico</h3>
        <p className="mt-2 text-gray-600">Para viajantes individuais.</p>
        <div className="my-6">
          <span className="text-5xl font-extrabold text-gray-900">Grátis</span>
        </div>
        <ul className="text-left space-y-2 text-gray-600 flex-grow">
          <li className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Planejamento de 10 rotas/mês
          </li>
          <li className="flex items-center">
            <List className="h-5 w-5 mr-2 text-blue-500" />
            10 pontos de parada por rota
          </li>
          <li className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Informações de trânsito em tempo real
          </li>
        </ul>
        <button className="mt-8 w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold transition-colors hover:bg-gray-300 duration-200">
          Começar grátis
        </button>
      </div>

      {/* Premium Plan (Personal) */}
      <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-2xl flex flex-col text-center transition-transform hover:scale-105 duration-300">
        <h3 className="text-2xl font-bold">Plano Premium</h3>
        <p className="mt-2 text-blue-200">
          Para viajantes frequentes e famílias.
        </p>
        <div className="my-6">
          <span className="text-5xl font-extrabold">R$ 29,90</span>
          <span className="text-blue-200">/mês</span>
        </div>
        <ul className="text-left space-y-2 text-blue-100 flex-grow">
          <li className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-300" />
            Rotas ilimitadas
          </li>
          <li className="flex items-center">
            <List className="h-5 w-5 mr-2 text-blue-300" />
            Pontos de parada ilimitados
          </li>
          <li className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-300" />
            Previsão de trânsito inteligente
          </li>
          <li className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-300" />
            Mapas offline
          </li>
        </ul>
        <button className="mt-8 w-full bg-white text-blue-600 px-6 py-3 rounded-full font-bold transition-colors hover:bg-gray-100 duration-200">
          Assinar agora
        </button>
      </div>

      {/* Business Plan */}
      <div className="bg-gray-50 p-8 rounded-3xl shadow-xl flex flex-col text-center transition-transform hover:scale-105 duration-300">
        <h3 className="text-2xl font-bold text-gray-900">Plano Empresarial</h3>
        <p className="mt-2 text-gray-600">Para gestão de frotas e logística.</p>
        <div className="my-6">
          <span className="text-5xl font-extrabold text-gray-900">
            R$ 199,90
          </span>
          <span className="text-gray-600">/mês</span>
        </div>
        <ul className="text-left space-y-2 text-gray-600 flex-grow">
          <li className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Todos os recursos do Premium
          </li>
          <li className="flex items-center">
            <List className="h-5 w-5 mr-2 text-blue-500" />
            Múltiplos usuários
          </li>
          <li className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Análise de desempenho de rotas
          </li>
        </ul>
        <button className="mt-8 w-full bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors hover:bg-blue-700 duration-200">
          Entrar em contato
        </button>
      </div>
    </div>
  </div>
);

export default PricingPage;
