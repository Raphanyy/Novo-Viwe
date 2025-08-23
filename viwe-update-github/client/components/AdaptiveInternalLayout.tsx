import React, { Suspense } from "react";
import { usePlatform } from "../contexts/PlatformContext";
import ErrorBoundary from "./ErrorBoundary";

// Lazy load layouts for optimal bundle splitting
const MobileInternalLayout = React.lazy(
  () => import("../layouts/mobile/MobileInternalLayout"),
);

const TabletInternalLayout = React.lazy(
  () => import("../layouts/tablet/TabletInternalLayout"),
);

const DesktopInternalLayout = React.lazy(
  () => import("../layouts/desktop/DesktopInternalLayout"),
);

// Loading component for layout switching
const LayoutLoadingFallback: React.FC = () => (
  <div className="h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Carregando interface...</p>
    </div>
  </div>
);

/**
 * AdaptiveInternalLayout component that conditionally loads the appropriate layout
 * based on the current device type (mobile, tablet, desktop).
 *
 * This enables complete isolation of development between platforms while maintaining
 * the same routing structure.
 */
const AdaptiveInternalLayout: React.FC = () => {
  const { device, isSSR } = usePlatform();

  // During SSR, render desktop layout as default
  if (isSSR) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LayoutLoadingFallback />}>
          <DesktopInternalLayout />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Client-side rendering with device-specific layouts
  return (
    <ErrorBoundary>
      <Suspense fallback={<LayoutLoadingFallback />}>
        {device === "mobile" && <MobileInternalLayout />}
        {device === "tablet" && <TabletInternalLayout />}
        {device === "desktop" && <DesktopInternalLayout />}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AdaptiveInternalLayout;
