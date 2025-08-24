import React, { useState } from "react";
import { ChevronDown, Check, ArrowLeft } from "lucide-react";

interface UpdatePlanPageProps {
  onBack: () => void;
}

interface PlanData {
  plan: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isComingSoon: boolean;
}

const AccordionPricingCard: React.FC<{
  plan: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isOpen: boolean;
  onToggle: () => void;
  isComingSoon: boolean;
}> = ({
  plan,
  price,
  description,
  features,
  buttonText,
  isOpen,
  onToggle,
  isComingSoon,
}) => {
  const buttonClass = isComingSoon
    ? "bg-muted text-muted-foreground cursor-not-allowed"
    : "bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105";

  return (
    <div className="bg-card rounded-xl p-6 border border-l-4 border-l-primary border-border relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

      {/* Cabeçalho do card que funciona como botão do acordeão */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left relative z-10"
      >
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">{plan}</h2>
          <span className="text-lg font-bold text-foreground">{price}</span>
        </div>
        {/* Ícone de chevron para indicar estado do acordeão */}
        <ChevronDown
          className={`w-6 h-6 transform transition-transform duration-300 text-primary ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Conteúdo colapsável do acordeão */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out relative z-10 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-muted-foreground mt-6 mb-4">{description}</p>

        {/* Lista de recursos */}
        <ul className="space-y-4 text-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {/* Ícone de checkmark em azul */}
              <Check className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Botão de ação do card */}
        <button
          className={`mt-8 w-full py-3 px-6 font-semibold rounded-xl transition duration-300 ${buttonClass}`}
          disabled={isComingSoon}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const UpdatePlanPage: React.FC<UpdatePlanPageProps> = ({ onBack }) => {
  // Estado para controlar qual card de acordeão está aberto
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Função para alternar o estado de abertura de um card
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Dados dos planos
  const plansData: PlanData[] = [
    {
      plan: "Plano Básico",
      price: "R$ 0,00",
      description: "Funcionalidades básicas e recursos nativos.",
      features: [
        "15 rotas imediatas (15 paradas)",
        "5 rotas permanentes (15 paradas)",
        "3 conjuntos de rotas inteligentes",
        "Navegação e mapas integrados",
      ],
      buttonText: "Começar Gratuitamente",
      isComingSoon: false,
    },
    {
      plan: "Viwe Premium",
      price: "R$ 29,90",
      description: "Eleve sua experiência com funcionalidades extras.",
      features: [
        "50 rotas imediatas (30 paradas)",
        "25 rotas permanentes (30 paradas)",
        "15 conjuntos de rotas inteligentes",
        "Navegação e mapas integrados",
      ],
      buttonText: "Assinar Viwe Premium",
      isComingSoon: false,
    },
    {
      plan: "Viwe Interactive",
      price: "R$ 49,90",
      description: "Acesso ilimitado e recursos avançados.",
      features: [
        "Uso ilimitado",
        "Recursos avançados",
        "Experiência personalizada",
      ],
      buttonText: "Disponível em breve",
      isComingSoon: true,
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="p-4">
        {/* Subtítulo da página */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Escolha de acordo com o que precisar
          </p>
        </div>

        {/* Seção de planos usando o componente AccordionPricingCard */}
        <div className="space-y-4">
          {plansData.map((plan, index) => (
            <AccordionPricingCard
              key={index}
              plan={plan.plan}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              isOpen={index === openIndex}
              onToggle={() => handleToggle(index)}
              isComingSoon={plan.isComingSoon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatePlanPage;
