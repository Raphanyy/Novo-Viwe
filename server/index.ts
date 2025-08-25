import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authMiddleware, requireAuth } from "./middleware/auth";
import {
  loginHandler,
  registerHandler,
  logoutHandler,
  authStatusHandler,
} from "./routes/auth";
import {
  getProfileHandler,
  updateProfileHandler,
  listUsersHandler,
  getUserAnalyticsHandler,
} from "./routes/users";

export function createServer() {
  const app = express();

  // Middleware global
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de autenticação para todas as rotas
  app.use(authMiddleware);

  // Rotas públicas (não exigem autenticação)
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Rotas de autenticação
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/register", registerHandler);
  app.post("/api/auth/logout", logoutHandler);
  app.get("/api/auth/status", authStatusHandler);

  // Rotas protegidas (exigem autenticação)
  app.get("/api/users/profile", requireAuth, getProfileHandler);
  app.put("/api/users/profile", requireAuth, updateProfileHandler);
  app.get("/api/users/analytics", requireAuth, getUserAnalyticsHandler);

  // Rotas administrativas
  app.get("/api/admin/users", requireAuth, listUsersHandler);

  // Health check específico para Supabase
  app.get("/api/health", async (_req, res) => {
    try {
      // Verifica se as variáveis de ambiente estão configuradas
      const supabaseConfigured = !!(
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        supabase_configured: supabaseConfigured,
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: "Health check failed",
      });
    }
  });

  return app;
}
