import React, { createContext, useContext, ReactNode } from "react";
import { useBreakpoint, DeviceType } from "../hooks/use-breakpoint";

interface PlatformContextType {
  device: DeviceType | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isSSR: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(
  undefined,
);

interface PlatformProviderProps {
  children: ReactNode;
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const breakpointData = useBreakpoint();

  return (
    <PlatformContext.Provider value={breakpointData}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextType {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
}

// Convenience hooks that use the context
export function usePlatformIsMobile(): boolean {
  const { isMobile, isSSR } = usePlatform();
  return isSSR ? false : isMobile;
}

export function usePlatformIsTablet(): boolean {
  const { isTablet, isSSR } = usePlatform();
  return isSSR ? false : isTablet;
}

export function usePlatformIsDesktop(): boolean {
  const { isDesktop, isSSR } = usePlatform();
  return isSSR ? true : isDesktop; // Default to desktop during SSR
}

export function usePlatformIsMobileOrTablet(): boolean {
  const { isMobileOrTablet, isSSR } = usePlatform();
  return isSSR ? false : isMobileOrTablet;
}
