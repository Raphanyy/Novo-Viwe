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

  // Mobile uses full screen sheet style, desktop uses centered modal
  const modalClasses = isMobile
    ? "fixed inset-0 z-50 bg-white"
    : cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black bg-opacity-50",
      );

  const contentClasses = isMobile
    ? "flex flex-col h-full"
    : cn(
        "bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden",
        sizeClasses[size],
        "w-full",
      );

  return (
    <div className={modalClasses} onClick={isMobile ? undefined : onClose}>
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
            onClose={onClose}
            rightContent={rightContent}
          />
        )}

        {/* Content */}
        <div className={cn("overflow-y-auto", isMobile ? "flex-1" : "", title ? "" : "p-4")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveModal;
