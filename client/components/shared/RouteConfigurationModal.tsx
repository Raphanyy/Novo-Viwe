import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, Users, Route, MapPin, Calendar } from "lucide-react";

// Componente Modal aprimorado para Mobile-First
function Modal({
  children,
  closeModal,
}: {
  children: React.ReactNode;
  closeModal: () => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Efeito de entrada do modal
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      closeModal();
    }, 500); // Corresponde à duração da transição de saída
  };

  // Lidar com o fechamento ao clicar fora do modal
  const handleOutsideClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "modal-backdrop") {
      handleClose();
    }
  };

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative w-full h-full md:h-auto md:max-w-4xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-6 md:p-8 transition-transform duration-500 ease-out transform
          ${isAnimating ? "translate-y-0 md:scale-100 md:opacity-100" : "translate-y-full md:scale-95 md:opacity-0"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
          aria-label="Fechar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {/* Conteúdo scrollable para mobile com "overscroll" simulado */}
        <div className="overflow-y-auto h-full pb-[25vh] md:pb-0 md:max-h-[80vh] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente Principal do Formulário
function RouteConfigurationForm({
  prefilledStops,
  isTemporary,
  onSave,
}: {
  prefilledStops?: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    address?: string;
  }>;
  isTemporary?: boolean;
  onSave?: () => void;
}) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    info: { routeName: "", responsible: "", id: "", notes: "", priority: "" },
    clients: [] as Array<{
      name: string;
      id: string;
      phone: string;
      email: string;
      notes: string;
    }>,
    routeSet: "",
    stops: prefilledStops
      ? prefilledStops.map((stop) => ({
          name: stop.name,
          id: stop.id,
          address: stop.address || "Endereço não disponível",
          notes: "",
        }))
      : ([] as Array<{
          name: string;
          id: string;
          address: string;
          notes: string;
        }>),
    scheduling: { type: isTemporary ? "imediata" : "permanente", date: "" },
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper para atualizar o estado do formulário
  const saveAndClose = (section: string, data: any) => {
    setFormData((prevData) => ({ ...prevData, [section]: data }));
  };

  // Envio final do formulário principal
  const handleFinalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Simula uma chamada de API com um atraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Dados Finais Salvos:", formData);
    setIsSuccess(true);
    setIsLoading(false);

    // Call onSave callback if provided (for trace mode)
    if (onSave) {
      onSave();
    }

    setTimeout(() => setIsSuccess(false), 2000);
  };

  // Verifica se uma seção foi configurada
  const isSectionConfigured = (section: string) => {
    switch (section) {
      case "info":
        return (
          formData.info.routeName !== "" ||
          formData.info.responsible !== "" ||
          formData.info.id !== "" ||
          formData.info.notes !== "" ||
          formData.info.priority !== ""
        );
      case "clients":
        return formData.clients.length > 0;
      case "routeSet":
        return formData.routeSet !== "";
      case "stops":
        return formData.stops.length > 0;
      case "scheduling":
        return (
          formData.scheduling.type !== "permanente" ||
          (formData.scheduling.type === "imediata" &&
            formData.scheduling.date !== "")
        );
      default:
        return false;
    }
  };

  // Componente de Card de Seção aprimorado
  const SectionCard = ({
    title,
    icon,
    onClick,
    summary,
  }: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    summary: { section: string; content: string };
  }) => {
    const isConfigured = isSectionConfigured(summary.section);
    return (
      <button
        type="button"
        className={`flex flex-col items-start w-full p-6 text-left transition-all duration-200 rounded-xl shadow-sm border border-gray-200
          ${isConfigured ? "bg-green-50 hover:bg-green-100 border-green-500" : "bg-white hover:bg-gray-50"}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-gray-800 font-semibold">{title}</span>
          </div>
          {isConfigured && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-normal text-xs">Editar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-4.306 4.306a4 4 0 010 5.656L3 17.657V15a2 2 0 012-2h2.657l4.306-4.306z" />
              </svg>
            </div>
          )}
        </div>
        {isConfigured && (
          <div className="mt-2 text-sm text-gray-600 font-normal">
            <span className="text-xs">{summary.content}</span>
          </div>
        )}
      </button>
    );
  };

  // Componente de Cabeçalho de Progresso
  const ProgressHeader = () => {
    const totalSteps = 5;
    const sectionsToCheck = [
      "info",
      "clients",
      "routeSet",
      "stops",
      "scheduling",
    ];
    const completedSteps = sectionsToCheck.filter((section) =>
      isSectionConfigured(section),
    ).length;
    const progress = (completedSteps / totalSteps) * 100;

    return (
      <div className="flex flex-col gap-2 w-full mb-4">
        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
          <span>Progresso da Configuração</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800 text-left">
        Configurar Rotas
      </h2>

      {/* Indicador de progresso */}
      <ProgressHeader />

      {isLoading && (
        <div className="p-4 rounded-md bg-blue-500 text-white font-semibold text-center animate-pulse">
          Salvando...
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-md bg-green-500 text-white font-semibold text-center animate-pulse">
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Conteúdo principal - Accordion retrátil */}
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="w-full space-y-2"
      >
        <AccordionItem
          value="informacoes"
          className="border border-gray-200 rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  1. Informações da Rota
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.info.routeName
                    ? `Rota: ${formData.info.routeName}`
                    : "Nenhum dado configurado."}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InformacoesDaRotaContent
              formData={formData.info}
              saveData={(data) => saveAndClose("info", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="clientes"
          className="border border-gray-200 rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  2. Carteira de Clientes
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.clients.length > 0
                    ? `Total de clientes: ${formData.clients.length}`
                    : "Nenhum cliente adicionado."}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <CarteiraDeClientesContent
              formData={formData.clients}
              saveData={(data) => saveAndClose("clients", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="conjuntos"
          className="border border-gray-200 rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Route className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  3. Conjuntos de Rotas
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.routeSet
                    ? `Conjunto: ${formData.routeSet}`
                    : "Nenhum conjunto selecionado."}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ConjuntosDeRotasContent
              formData={formData.routeSet}
              saveData={(data) => saveAndClose("routeSet", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="paradas"
          className="border border-gray-200 rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  4. Configurar Paradas
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.stops.length > 0
                    ? `Total de paradas: ${formData.stops.length}`
                    : "Nenhuma parada configurada."}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ConfigurarParadasContent
              formData={formData.stops}
              saveData={(data) => saveAndClose("stops", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="programacao"
          className="border border-gray-200 rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  5. Modelo e Programação
                </h3>
                <p className="text-sm text-gray-600">
                  Tipo:{" "}
                  {formData.scheduling.type === "permanente"
                    ? "Permanente"
                    : `Imediata - ${formData.scheduling.date || "Data não definida"}`}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ModeloEProgramacaoContent
              formData={formData.scheduling}
              saveData={(data) => saveAndClose("scheduling", data)}
              isTemporary={isTemporary}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Show immediate info if in temporary mode */}
      {isTemporary && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="h-5 w-5 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-orange-800">Rota Imediata</span>
          </div>
          <p className="text-sm text-orange-700">
            Esta rota é imediata e dura 24 Horas a partir do início.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleFinalSubmit}
        disabled={isLoading}
        className={`w-full py-3 mt-2 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {isLoading ? "Salvando..." : "Salvar Configurações Finais"}
      </button>
    </div>
  );
}

// 1. Componente de Conteúdo: Informações da Rota
function InformacoesDaRotaContent({
  formData,
  saveData,
}: {
  formData: {
    routeName: string;
    responsible: string;
    id: string;
    notes: string;
    priority: string;
  };
  saveData: (data: any) => void;
}) {
  const [data, setData] = useState(formData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    saveData(newData); // Salva automaticamente
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="routeName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nome da Rota
        </label>
        <input
          id="routeName"
          type="text"
          name="routeName"
          value={data.routeName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label
          htmlFor="responsible"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Responsável
        </label>
        <input
          id="responsible"
          type="text"
          name="responsible"
          value={data.responsible}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label
          htmlFor="id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Código / ID
        </label>
        <input
          id="id"
          type="text"
          name="id"
          value={data.id}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Anotação
        </label>
        <textarea
          id="notes"
          name="notes"
          value={data.notes}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        ></textarea>
      </div>
      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prioridade
        </label>
        <select
          id="priority"
          name="priority"
          value={data.priority}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="">Selecione a prioridade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>
    </div>
  );
}

// 2. Componente de Conteúdo: Carteira de Clientes
function CarteiraDeClientesContent({
  formData,
  saveData,
}: {
  formData: Array<{
    name: string;
    id: string;
    phone: string;
    email: string;
    notes: string;
  }>;
  saveData: (data: any) => void;
}) {
  const [clients, setClients] = useState(formData);
  const [newClient, setNewClient] = useState({
    name: "",
    id: "",
    phone: "",
    email: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClient = () => {
    if (newClient.name.trim() !== "") {
      const newClients = [...clients, newClient];
      setClients(newClients);
      saveData(newClients); // Salva automaticamente
      setNewClient({ name: "", id: "", phone: "", email: "", notes: "" });
    }
  };

  const handleRemoveClient = (indexToRemove: number) => {
    const newClients = clients.filter((_, index) => index !== indexToRemove);
    setClients(newClients);
    saveData(newClients); // Salva automaticamente
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Adicione, edite ou remova clientes que farão parte desta rota.
      </p>
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow-inner">
        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome do Cliente
          </label>
          <input
            id="clientName"
            type="text"
            name="name"
            placeholder="Nome do Cliente"
            value={newClient.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Código / ID
          </label>
          <input
            id="clientId"
            type="text"
            name="id"
            placeholder="Código / ID"
            value={newClient.id}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="clientPhone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone
          </label>
          <input
            id="clientPhone"
            type="tel"
            name="phone"
            placeholder="Telefone"
            value={newClient.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="clientEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-mail
          </label>
          <input
            id="clientEmail"
            type="email"
            name="email"
            placeholder="E-mail"
            value={newClient.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="clientNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Anotações
          </label>
          <textarea
            id="clientNotes"
            name="notes"
            placeholder="Anotação"
            value={newClient.notes}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          ></textarea>
        </div>
        <button
          type="button"
          onClick={handleAddClient}
          className="w-full px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Adicionar Cliente
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="font-semibold text-lg mb-2 text-left">
          Clientes Adicionados:
        </h3>
        {clients.length > 0 ? (
          clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-b-0 text-sm"
            >
              <div>
                <span className="font-semibold block">{client.name}</span>
                <span className="text-xs text-gray-500">ID: {client.id}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveClient(index)}
                className="text-red-500 hover:text-red-700"
                aria-label={`Remover cliente ${client.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-left text-gray-500 text-sm">
            Nenhum cliente adicionado.
          </p>
        )}
      </div>
    </div>
  );
}

// 3. Componente de Conteúdo: Conjuntos de Rotas
function ConjuntosDeRotasContent({
  formData,
  saveData,
}: {
  formData: string;
  saveData: (data: any) => void;
}) {
  const [routeSet, setRouteSet] = useState(formData);
  const [searchTerm, setSearchTerm] = useState("");

  const allRouteSets = [
    "Zona Sul",
    "Baixada Fluminense",
    "Ilha do Governador",
    "Centro",
    "Zona Oeste",
    "Zona Norte",
  ];

  const filteredSets = allRouteSets.filter((set) =>
    set.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectSet = (set: string) => {
    setRouteSet(set);
    saveData(set); // Salva automaticamente
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Associe esta rota a um conjunto para otimizar o planejamento.
      </p>

      <div>
        <label
          htmlFor="searchSets"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Pesquisar conjuntos...
        </label>
        <input
          id="searchSets"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg shadow-inner">
        {filteredSets.length > 0 ? (
          filteredSets.map((set) => (
            <button
              key={set}
              type="button"
              onClick={() => handleSelectSet(set)}
              className={`p-3 text-left rounded-lg transition-colors duration-200 ${
                routeSet === set
                  ? "bg-blue-100 text-blue-800 font-semibold"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {set}
            </button>
          ))
        ) : (
          <p className="text-left text-sm text-gray-500 py-4">
            Nenhum conjunto encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

// 4. Componente de Conteúdo: Configurar Paradas
function ConfigurarParadasContent({
  formData,
  saveData,
}: {
  formData: Array<{ name: string; id: string; address: string; notes: string }>;
  saveData: (data: any) => void;
}) {
  const [stops, setStops] = useState(formData);
  const [newStop, setNewStop] = useState({
    name: "",
    id: "",
    address: "",
    notes: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(true);
  const [isStopsListExpanded, setIsStopsListExpanded] = useState(true);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewStop((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStop = () => {
    if (newStop.name.trim() !== "") {
      updateStops([...stops, newStop]);
      setNewStop({ name: "", id: "", address: "", notes: "" });
    }
  };

  const handleRemoveStop = (indexToRemove: number) => {
    updateStops(stops.filter((_, index) => index !== indexToRemove));
    setEditingIndex(null);
  };

  const handleEditStop = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number, field: string, value: string) => {
    const updatedStops = [...stops];
    if (field !== "address") {
      // Endereços não são editáveis
      updatedStops[index] = { ...updatedStops[index], [field]: value };
      updateStops(updatedStops);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const moveStop = (fromIndex: number, toIndex: number) => {
    const updatedStops = [...stops];
    const [movedStop] = updatedStops.splice(fromIndex, 1);
    updatedStops.splice(toIndex, 0, movedStop);
    updateStops(updatedStops);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      moveStop(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
  };

  const updateStops = (newStops: typeof stops) => {
    setStops(newStops);
    saveData(newStops); // Salva automaticamente
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Adicione, edite ou remova as paradas desta rota. Você pode reordenar as
        paradas arrastando-as.
      </p>
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow-inner">
        <div>
          <label
            htmlFor="stopName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome da Parada
          </label>
          <input
            id="stopName"
            type="text"
            name="name"
            placeholder="Nome da Parada"
            value={newStop.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="stopId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Identificador Único
          </label>
          <input
            id="stopId"
            type="text"
            name="id"
            placeholder="Identificador Único"
            value={newStop.id}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="stopAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Endereço
          </label>
          <input
            id="stopAddress"
            type="text"
            name="address"
            placeholder="Endereço"
            value={newStop.address}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="stopNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Anotações
          </label>
          <textarea
            id="stopNotes"
            name="notes"
            placeholder="Anotação"
            value={newStop.notes}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          ></textarea>
        </div>
        <button
          type="button"
          onClick={handleAddStop}
          className="w-full px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Adicionar Parada
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="font-semibold text-lg mb-4 text-left">
          Paradas Adicionadas:
        </h3>
        {stops.length > 0 ? (
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 border border-gray-200 rounded-lg bg-white cursor-move transition-all duration-200 ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="font-semibold text-gray-800">
                      {stop.name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditStop(index)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      aria-label={`Editar parada ${stop.name}`}
                    >
                      {editingIndex === index ? "Cancelar" : "Editar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remover parada ${stop.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingIndex === index ? (
                  <div className="space-y-3 ml-9">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Parada
                      </label>
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) =>
                          handleSaveEdit(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome da parada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID da Parada
                      </label>
                      <input
                        type="text"
                        value={stop.id}
                        onChange={(e) =>
                          handleSaveEdit(index, "id", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ID da parada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço (não editável)
                      </label>
                      <input
                        type="text"
                        value={stop.address}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="Endereço (não editável)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anotações
                      </label>
                      <textarea
                        value={stop.notes}
                        onChange={(e) =>
                          handleSaveEdit(index, "notes", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Anotações sobre esta parada"
                        rows={2}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
                    >
                      Salvar alterações
                    </button>
                  </div>
                ) : (
                  <div className="ml-9 space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">ID:</span> {stop.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Endereço:</span>{" "}
                      {stop.address}
                    </div>
                    {stop.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Anotações:</span>{" "}
                        {stop.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Nenhuma parada adicionada ainda.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Use o formulário acima para adicionar sua primeira parada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Componente de Conteúdo: Modelo e Programação
function ModeloEProgramacaoContent({
  formData,
  saveData,
  isTemporary,
}: {
  formData: { type: string; date: string };
  saveData: (data: any) => void;
  isTemporary?: boolean;
}) {
  const [data, setData] = useState(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    saveData(newData); // Salva automaticamente
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tipo de Rota
      </label>
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="type"
            value="permanente"
            checked={data.type === "permanente"}
            onChange={handleChange}
            className="form-radio text-blue-600 h-5 w-5"
            disabled={isTemporary}
          />
          <span
            className={`ml-2 ${isTemporary ? "text-gray-400" : "text-gray-800"}`}
          >
            Permanente
          </span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="type"
            value="imediata"
            checked={data.type === "imediata"}
            onChange={handleChange}
            className="form-radio text-blue-600 h-5 w-5"
            disabled={isTemporary}
          />
          <span
            className={`ml-2 ${isTemporary ? "text-gray-400" : "text-gray-800"}`}
          >
            Imediata
          </span>
        </label>
      </div>

      {data.type === "imediata" && (
        <div className="flex flex-col gap-2 mt-4 p-4 border border-gray-200 rounded-lg">
          <label
            htmlFor="routeDate"
            className="block text-sm font-semibold text-gray-700"
          >
            Data da Rota
          </label>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                id="hoje"
                name="date"
                value="Hoje"
                checked={data.date === "Hoje"}
                onChange={handleChange}
                className="form-radio text-blue-600 h-5 w-5"
              />
              <span className="ml-2">Hoje</span>
            </label>
            <input
              id="routeDate"
              type="date"
              name="date"
              value={data.date !== "Hoje" ? data.date : ""}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Principal Exportado
interface RouteConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledStops?: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    address?: string;
  }>;
  isTemporary?: boolean;
}

export default function RouteConfigurationModal({
  isOpen,
  onClose,
  prefilledStops,
  isTemporary,
}: RouteConfigurationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal closeModal={onClose}>
      <RouteConfigurationForm
        prefilledStops={prefilledStops}
        isTemporary={isTemporary}
        onSave={onClose}
      />
    </Modal>
  );
}
