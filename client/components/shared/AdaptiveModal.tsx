import React from "react";
import { cn } from "../../lib/utils";
import { usePlatform } from "../../contexts/PlatformContext";
import ModalHeader from "./ModalHeader";

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  fullPage?: boolean;
}

const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
  showBackButton = false,
  onBack,
  rightContent,
  fullPage = false,
}) => {
  const { isMobile } = usePlatform();

  if (!isOpen) return null;

  // Size variants for different screen sizes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // Full page mode or mobile uses full screen, desktop uses centered modal
  const useFullScreen = fullPage || isMobile;

  const modalClasses = useFullScreen
    ? "fixed inset-0 z-50 bg-background"
    : cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black bg-opacity-50",
      );

  const contentClasses = useFullScreen
    ? "flex flex-col h-full"
    : cn(
        "bg-card rounded-lg shadow-xl max-h-[90vh] overflow-hidden border border-border",
        sizeClasses[size],
        "w-full",
      );

  return (
    <div className={modalClasses} onClick={useFullScreen ? undefined : onClose}>
      <div
        className={cn(contentClasses, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <ModalHeader
            title={title}
            showBackButton={showBackButton}
            onBack={onBack}
            rightContent={rightContent}
          />
        )}

        {/* Content */}
        <div
          className={cn(
            "overflow-y-auto",
            useFullScreen ? "flex-1" : "",
            title ? "" : "p-4",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveModal;
