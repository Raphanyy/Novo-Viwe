import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MobileLoginPage from "./pages/MobileLoginPage";
import EmailLoginPage from "./pages/EmailLoginPage";

// Internal Pages
import DashboardPage from "./pages/internal/DashboardPage";
import MapPage from "./pages/internal/MapPage";
import RoutesPage from "./pages/internal/RoutesPage";
import ProfilePage from "./pages/internal/ProfilePage";
import ActivityPage from "./pages/internal/ActivityPage";
import NotificationsPage from "./pages/internal/NotificationsPage";

// Adaptive Layouts
import AdaptiveInternalLayout from "./components/AdaptiveInternalLayout";
import AdaptivePublicLayout from "./components/AdaptivePublicLayout";

// Auth Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Platform Context
import { PlatformProvider, usePlatform } from "./contexts/PlatformContext";

// TraceRoute Context
import { TraceRouteProvider } from "./contexts/TraceRouteContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/app" replace />;
};

const AppRoutes = () => {
  const { isMobile, isSSR } = usePlatform();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            {/* Mobile: Direct login page without layout */}
            {isMobile && !isSSR ? (
              <MobileLoginPage />
            ) : (
              /* Desktop/Tablet: Landing page with layout */
              <AdaptivePublicLayout>
                <LandingPage />
              </AdaptivePublicLayout>
            )}
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            {/* Mobile: Direct login page without layout */}
            {isMobile && !isSSR ? (
              <MobileLoginPage />
            ) : (
              /* Desktop/Tablet: Login page with layout */
              <AdaptivePublicLayout>
                <LoginPage />
              </AdaptivePublicLayout>
            )}
          </PublicRoute>
        }
      />
      <Route
        path="/login-email"
        element={
          <PublicRoute>
            <EmailLoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Internal Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AdaptiveInternalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="mapa" element={<MapPage />} />
        <Route path="rotas" element={<RoutesPage />} />
        <Route path="opcoes" element={<ProfilePage />} />
        <Route path="atividade" element={<ActivityPage />} />
        <Route path="notificacoes" element={<NotificationsPage />} />
        <Route path="ajustes" element={<ProfilePage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PlatformProvider>
            <AuthProvider>
              <TraceRouteProvider>
                <AppRoutes />
              </TraceRouteProvider>
            </AuthProvider>
          </PlatformProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Defensive mounting with error handling
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
