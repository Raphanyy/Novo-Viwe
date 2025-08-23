import React, { Suspense } from "react";
import { usePlatform } from "../contexts/PlatformContext";

// Lazy load public layouts for optimal bundle splitting
const MobilePublicLayout = React.lazy(
  () => import("../layouts/mobile/MobilePublicLayout"),
);

// Import the existing Layout component for tablet and desktop
// (For now, we'll reuse the existing Layout for tablet/desktop until specific ones are needed)
import Layout from "./Layout";

// Loading component for layout switching
const PublicLayoutLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Carregando página...</p>
    </div>
  </div>
);

interface AdaptivePublicLayoutProps {
  children: React.ReactNode;
}

/**
 * AdaptivePublicLayout component that conditionally loads the appropriate layout
 * based on the current device type for public pages (landing, features, pricing, etc.).
 */
const AdaptivePublicLayout: React.FC<AdaptivePublicLayoutProps> = ({
  children,
}) => {
  const { device, isSSR } = usePlatform();

  // During SSR, render desktop layout as default
  if (isSSR) {
    return <Layout>{children}</Layout>;
  }

  // Client-side rendering with device-specific layouts
  return (
    <Suspense fallback={<PublicLayoutLoadingFallback />}>
      {device === "mobile" && (
        <MobilePublicLayout>{children}</MobilePublicLayout>
      )}
      {(device === "tablet" || device === "desktop") && (
        <Layout>{children}</Layout>
      )}
    </Suspense>
  );
};

export default AdaptivePublicLayout;
