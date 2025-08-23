import React from "react";
import { ChevronRight } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  rightContent,
  variant = "default",
  disabled = false,
}) => {
  const isDanger = variant === "danger";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`w-full bg-card rounded-xl p-4 border text-left transition-colors ${
        disabled 
          ? "opacity-50 cursor-not-allowed border-border"
          : onClick 
            ? `hover:bg-accent/50 ${
                isDanger 
                  ? "border-destructive/20 hover:border-destructive/30" 
                  : "border-border hover:border-border"
              }`
            : "border-border cursor-default"
      }`}
    >
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDanger 
              ? "bg-destructive/10" 
              : "bg-primary/10"
          }`}>
            <Icon className={`h-5 w-5 ${
              isDanger 
                ? "text-destructive" 
                : "text-primary"
            }`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${
            isDanger 
              ? "text-destructive" 
              : "text-foreground"
          }`}>
            {title}
          </h4>
          {subtitle && (
            <p className={`text-sm ${
              isDanger 
                ? "text-destructive/70" 
                : "text-muted-foreground"
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {rightContent}
          {onClick && (
            <ChevronRight className={`h-5 w-5 ${
              isDanger 
                ? "text-destructive/70" 
                : "text-muted-foreground"
            }`} />
          )}
        </div>
      </div>
    </button>
  );
};

export default SettingsSection;
