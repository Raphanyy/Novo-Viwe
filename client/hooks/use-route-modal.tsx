import { useState } from "react";

/**
 * Hook customizado para gerenciar o modal de configuração de rotas
 * Pode ser usado em qualquer componente que tenha botões "Nova Rota" ou "Criar Rota"
 */
export function useRouteModal() {
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const openRouteModal = () => {
    setIsRouteModalOpen(true);
  };

  const closeRouteModal = () => {
    setIsRouteModalOpen(false);
  };

  return {
    isRouteModalOpen,
    openRouteModal,
    closeRouteModal,
  };
}
