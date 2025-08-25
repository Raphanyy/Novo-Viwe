
# Plataforma Viwe - Planejador de Rotas Full-Stack

Este é um aplicativo full-stack de planejamento de rotas, construído com **React, TypeScript, Express e PostgreSQL**. Ele fornece uma solução completa para **autenticação de usuários, criação de rotas e visualização em mapas**.

## Stack de Tecnologias

* **Gerenciador de Workspace**: pnpm
* **Frontend**: React, TypeScript, Vite, TailwindCSS
* **Backend**: Node.js, Express, TypeScript
* **Banco de Dados**: PostgreSQL (projetado para Neon)
* **Autenticação**: JWT (JSON Web Tokens)
* **Mapeamento**: Mapbox

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/) (v16 ou superior)
* [pnpm](https://pnpm.io/installation)

## Instruções de Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

**1. Clonar o Repositório**

```bash
git clone <repository-url>
cd <repository-name>
```

**2. Configurar Variáveis de Ambiente**

* Crie um arquivo `.env` na raiz do projeto copiando o arquivo de exemplo:

```bash
cp .env.example .env
```

* Abra o arquivo `.env` e preencha as variáveis obrigatórias:

  * **`DATABASE_URL`**: Pegue a string de conexão do banco de dados no seu dashboard do Neon.
  * **`VITE_MAPBOX_ACCESS_TOKEN`**: Insira seu token público de acesso do Mapbox.
  * **`JWT_SECRET`**: Você pode gerar um novo segredo executando o seguinte comando:

```bash
node scripts/generate-jwt-secret.js
```

Isso adicionará automaticamente o novo segredo ao seu arquivo `.env`.

**3. Instalar Dependências**

* Este projeto é um monorepo **pnpm**. Para instalar todas as dependências do client e server, execute o seguinte comando na raiz do projeto:

```bash
pnpm install
```

**4. Configurar o Banco de Dados**

* Depois de configurar corretamente o `DATABASE_URL` no `.env`, execute o seguinte comando para criar todas as tabelas necessárias no banco de dados:

```bash
pnpm db:setup
```

## Executando a Aplicação

**Servidor de Desenvolvimento**

* Para iniciar os servidores de frontend e backend em modo de desenvolvimento, execute o seguinte comando na raiz do projeto:

```bash
pnpm dev
```

* O frontend estará disponível em `http://localhost:3000` (ou na próxima porta disponível).
* O servidor backend estará rodando na porta `3001` e será acessado via proxy pelo frontend.

**Scripts Disponíveis**

* `pnpm setup`: Instala todas as dependências do workspace.
* `pnpm dev`: Inicia o servidor de desenvolvimento para client e server.
* `pnpm db:setup`: Cria o schema do banco de dados.
* `pnpm build`: Constrói a aplicação para produção.
* `pnpm test`: Executa os testes de todos os pacotes.
* `pnpm format`: Formata o código com Prettier.
* `pnpm typecheck`: Executa o compilador TypeScript para verificar erros de tipos.

---

Se você quiser, posso também criar uma **versão resumida em português**, que funcione como README oficial, clara e direta para desenvolvedores novos no projeto.

Quer que eu faça?
