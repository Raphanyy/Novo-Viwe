import React from "react";
import { ArrowLeft } from "lucide-react";

interface ModalHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  showBackButton = false,
  onBack,
  rightContent,
}) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default ModalHeader;
