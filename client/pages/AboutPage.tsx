import React from "react";
import { Compass, Users, Share2 } from "lucide-react";

const AboutPage: React.FC = () => (
  <div className="container mx-auto px-6 py-24 md:py-32">
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-8">
      Sobre Nós
    </h1>
    <p className="text-center text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-16">
      Nossa missão é tornar cada viagem mais simples, eficiente e agradável.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <img
          src="https://placehold.co/600x400/E5E7EB/4B5563?text=Nossa+Equipe"
          alt="Equipe Viwe"
          className="w-full h-auto rounded-xl shadow-lg"
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          História da Viwe
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          A Viwe nasceu da frustração de planejar viagens complexas e ter que
          lidar com múltiplos aplicativos e informações dispersas. Fundada por
          um grupo de entusiastas de tecnologia e viagens, nossa equipe decidiu
          criar a solução definitiva para o planejamento de rotas.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Hoje, a Viwe é uma plataforma robusta que atende milhões de usuários
          em todo o mundo, de viajantes de fim de semana a grandes empresas de
          logística. Nosso compromisso é com a inovação contínua para garantir
          que você tenha a melhor experiência possível.
        </p>
      </div>
    </div>

    <div className="mt-20 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
      <div className="flex flex-wrap justify-center gap-8 mt-8">
        <div className="p-6 bg-gray-50 rounded-xl shadow-md w-64">
          <Compass className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">Inovação</h3>
          <p className="text-sm text-gray-600">
            Estamos sempre buscando novas maneiras de melhorar a sua jornada.
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl shadow-md w-64">
          <Users className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">Comunidade</h3>
          <p className="text-sm text-gray-600">
            Acreditamos que a colaboração e o feedback nos tornam melhores.
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl shadow-md w-64">
          <Share2 className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">Simplicidade</h3>
          <p className="text-sm text-gray-600">
            Nossa tecnologia é complexa, mas a experiência de uso é simples.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
