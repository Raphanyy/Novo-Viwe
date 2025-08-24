import React, { Suspense } from "react";
import { usePlatform } from "../contexts/PlatformContext";
import { ViweLoaderFullScreen } from "./shared/ViweLoader";

// Lazy load public layouts for optimal bundle splitting
const MobilePublicLayout = React.lazy(
  () => import("../layouts/mobile/MobilePublicLayout"),
);

// Import the existing Layout component for tablet and desktop
// (For now, we'll reuse the existing Layout for tablet/desktop until specific ones are needed)
import Layout from "./Layout";

// Loading component for layout switching
const PublicLayoutLoadingFallback: React.FC = () => (
  <ViweLoaderFullScreen text="Carregando página..." />
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
