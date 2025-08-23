import React from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface SettingsToggleProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isEnabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  title,
  subtitle,
  icon: Icon,
  isEnabled,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center space-x-3 flex-1">
        {Icon && (
          <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!isEnabled)}
        disabled={disabled}
        className={`transition-colors duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
        } ${isEnabled ? "text-primary" : "text-muted-foreground"}`}
      >
        {isEnabled ? (
          <ToggleRight className="h-8 w-8" />
        ) : (
          <ToggleLeft className="h-8 w-8" />
        )}
      </button>
    </div>
  );
};

export default SettingsToggle;
