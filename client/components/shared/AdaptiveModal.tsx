import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { usePlatform } from "../../contexts/PlatformContext";

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
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
        <div
          className={cn(
            "flex items-center justify-between border-b border-gray-200",
            isMobile ? "p-4 flex-shrink-0" : "p-6",
          )}
        >
          {title && (
            <h2
              className={cn(
                "font-semibold text-gray-900",
                isMobile ? "text-lg" : "text-xl",
              )}
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className={cn(
              "rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
              isMobile ? "p-2" : "p-1.5",
            )}
          >
            <X className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
          </button>
        </div>

        {/* Content */}
        <div className={cn("overflow-y-auto", isMobile ? "flex-1 p-4" : "p-6")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveModal;
