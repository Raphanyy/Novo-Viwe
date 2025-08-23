import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, Camera, Edit3 } from "lucide-react";

interface ProfileCardProps {
  variant?: "primary" | "secondary";
  showEditButton?: boolean;
  onEditClick?: () => void;
  onAvatarClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  variant = "primary",
  showEditButton = false,
  onEditClick,
  onAvatarClick,
}) => {
  const { user } = useAuth();

  if (variant === "secondary") {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            {onAvatarClick && (
              <button
                onClick={onAvatarClick}
                className="absolute -bottom-1 -right-1 p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {showEditButton && (
            <button
              onClick={onEditClick}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          {onAvatarClick && (
            <button
              onClick={onAvatarClick}
              className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
          <p className="text-muted-foreground">
            @{user?.name?.toLowerCase().replace(/\s+/g, "")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          {showEditButton && (
            <button
              onClick={onEditClick}
              className="mt-2 text-primary text-sm font-medium hover:text-primary/80 transition-colors flex items-center space-x-1"
            >
              <Edit3 className="h-4 w-4" />
              <span>Editar perfil</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
