import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface BreakpointConfig {
  mobile: { min: number; max: number };
  tablet: { min: number; max: number };
  desktop: { min: number; max: number };
}

export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Number.MAX_SAFE_INTEGER },
};

export function useBreakpoint(config: BreakpointConfig = DEFAULT_BREAKPOINTS) {
  const [currentDevice, setCurrentDevice] = useState<DeviceType | undefined>(
    undefined,
  );
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);

    const getDeviceType = (): DeviceType => {
      const width = window.innerWidth;

      if (width >= config.mobile.min && width <= config.mobile.max) {
        return "mobile";
      } else if (width >= config.tablet.min && width <= config.tablet.max) {
        return "tablet";
      } else {
        return "desktop";
      }
    };

    const handleResize = () => {
      setCurrentDevice(getDeviceType());
    };

    // Set initial value
    setCurrentDevice(getDeviceType());

    // Add event listener
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [config]);

  const isMobile = currentDevice === "mobile";
  const isTablet = currentDevice === "tablet";
  const isDesktop = currentDevice === "desktop";
  const isMobileOrTablet = isMobile || isTablet;

  return {
    device: currentDevice,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isSSR,
  };
}

// Convenience hooks for specific device types
export function useIsMobile() {
  const { isMobile, isSSR } = useBreakpoint();
  return isSSR ? false : isMobile;
}

export function useIsTablet() {
  const { isTablet, isSSR } = useBreakpoint();
  return isSSR ? false : isTablet;
}

export function useIsDesktop() {
  const { isDesktop, isSSR } = useBreakpoint();
  return isSSR ? true : isDesktop; // Default to desktop during SSR
}

export function useIsMobileOrTablet() {
  const { isMobileOrTablet, isSSR } = useBreakpoint();
  return isSSR ? false : isMobileOrTablet;
}
