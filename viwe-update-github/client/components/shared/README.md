# Componentes Shared

Esta pasta contém componentes que funcionam em todas as plataformas (mobile, tablet, desktop).

## Convenções

- **Responsabilidade**: Componentes verdadeiramente agnósticos de plataforma
- **Design**: Adaptam-se automaticamente via CSS responsivo (Tailwind)
- **Funcionalidade**: Lógica de negócio que não depende de device type
- **Reutilização**: Máxima reutilização entre plataformas

## Exemplos de componentes

- `Button.tsx` - Botões básicos com variants responsivos
- `Modal.tsx` - Modais que se adaptam automaticamente
- `Form.tsx` - Formulários responsivos
- `Card.tsx` - Cards que funcionam em qualquer tela
- `LoadingSpinner.tsx` - Indicadores de carregamento

## Quando usar shared vs específico

**Use shared quando:**

- O componente funciona bem em todas as telas
- Apenas CSS responsivo é suficiente
- A lógica de negócio é idêntica

**Use específico quando:**

- Comportamento muda drasticamente entre plataformas
- Diferentes interações (touch vs mouse vs keyboard)
- Performance otimizada é necessária
- UX patterns são diferentes
