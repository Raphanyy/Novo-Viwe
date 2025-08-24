import React, { Suspense } from "react";
import { usePlatform } from "../contexts/PlatformContext";
import ErrorBoundary from "./ErrorBoundary";
import { ViweLoaderFullScreen } from "./shared/ViweLoader";

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
  <ViweLoaderFullScreen text="Carregando interface..." />
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
