# Viwe Platform - Full-Stack Route Planner

This is a full-stack route planning application built with React, TypeScript, Express, and PostgreSQL. It provides a complete solution for user authentication, route creation, and map-based visualization.

## Tech Stack

-   **Workspace Manager**: pnpm
-   **Frontend**: React, TypeScript, Vite, TailwindCSS
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL (designed for Neon)
-   **Authentication**: JWT (JSON Web Tokens)
-   **Mapping**: Mapbox

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [pnpm](https://pnpm.io/installation)

## Setup Instructions

Follow these steps to get the development environment up and running:

**1. Clone the Repository**
```bash
git clone <repository-url>
cd <repository-name>
```

**2. Configure Environment Variables**
   - Create a `.env` file in the root of the project by copying the example file:
     ```bash
     cp .env.example .env
     ```
   - Open the `.env` file and fill in the required variables:
     - **`DATABASE_URL`**: Get your database connection string from your Neon dashboard.
     - **`VITE_MAPBOX_ACCESS_TOKEN`**: Provide your public Mapbox access token.
     - **`JWT_SECRET`**: You can generate a new secret by running the following command:
       ```bash
       node scripts/generate-jwt-secret.js
       ```
       This will automatically add the new secret to your `.env` file.

**3. Install Dependencies**
   - This project is a pnpm monorepo. To install all dependencies for both the client and server, run the following command from the root directory:
     ```bash
     pnpm install
     ```

**4. Set Up the Database**
   - Once your `.env` file is configured with the correct `DATABASE_URL`, run the following command to create all the necessary tables in your database:
     ```bash
     pnpm db:setup
     ```

## Running the Application

**Development Server**
   - To start both the frontend and backend servers in development mode, run the following command from the root directory:
     ```bash
     pnpm dev
     ```
   - The frontend will be available at `http://localhost:3000` (or the next available port).
   - The backend server will be running on port `3001` and proxied from the frontend.

**Available Scripts**

-   `pnpm setup`: Installs all dependencies for the workspace.
-   `pnpm dev`: Starts the development server for both the client and server.
-   `pnpm db:setup`: Creates the database schema.
-   `pnpm build`: Builds the application for production.
-   `pnpm test`: Runs the tests for all packages.
-   `pnpm format`: Formats the code with Prettier.
-   `pnpm typecheck`: Runs the TypeScript compiler to check for type errors.
