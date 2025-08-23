import React, { useState } from "react";
import SettingsToggle from "../SettingsToggle";
import {
  Bell,
  Mail,
  MessageSquare,
  Route,
  Award,
  DollarSign,
} from "lucide-react";

interface NotificationSettingsPageProps {
  onBack: () => void;
}

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({
  onBack,
}) => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    trafficAlerts: true,
    routeUpdates: true,
    achievements: true,
    marketing: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-4 space-y-6">
      {/* Notificações Push */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <span>Notificações Push</span>
        </h3>
        <div className="space-y-3">
          <SettingsToggle
            title="Ativar notificações push"
            subtitle="Receber alertas no dispositivo"
            isEnabled={settings.pushNotifications}
            onChange={(value) => updateSetting("pushNotifications", value)}
          />

          <SettingsToggle
            title="Alertas de trânsito"
            subtitle="Congestionamentos e incidentes"
            icon={Route}
            isEnabled={settings.trafficAlerts}
            onChange={(value) => updateSetting("trafficAlerts", value)}
            disabled={!settings.pushNotifications}
          />

          <SettingsToggle
            title="Atualizações de rota"
            subtitle="Novas rotas sugeridas"
            icon={Route}
            isEnabled={settings.routeUpdates}
            onChange={(value) => updateSetting("routeUpdates", value)}
            disabled={!settings.pushNotifications}
          />

          <SettingsToggle
            title="Conquistas"
            subtitle="Marcos e realizações"
            icon={Award}
            isEnabled={settings.achievements}
            onChange={(value) => updateSetting("achievements", value)}
            disabled={!settings.pushNotifications}
          />
        </div>
      </div>

      {/* Notificações por Email */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center space-x-2">
          <Mail className="h-5 w-5 text-primary" />
          <span>Notificações por Email</span>
        </h3>
        <div className="space-y-3">
          <SettingsToggle
            title="Ativar emails"
            subtitle="Receber notificações por email"
            isEnabled={settings.emailNotifications}
            onChange={(value) => updateSetting("emailNotifications", value)}
          />

          <SettingsToggle
            title="Marketing"
            subtitle="Novidades e promoções"
            icon={DollarSign}
            isEnabled={settings.marketing}
            onChange={(value) => updateSetting("marketing", value)}
          />
        </div>
      </div>

      {/* Configurações de Som */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Som e Vibração</span>
        </h3>
        <div className="space-y-3">
          <SettingsToggle
            title="Som das notificações"
            subtitle="Tocar som ao receber notificações"
            isEnabled={settings.soundEnabled}
            onChange={(value) => updateSetting("soundEnabled", value)}
          />

          <SettingsToggle
            title="Vibração"
            subtitle="Vibrar ao receber notificações"
            isEnabled={settings.vibrationEnabled}
            onChange={(value) => updateSetting("vibrationEnabled", value)}
          />
        </div>
      </div>

      {/* Horários de silêncio */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium text-foreground mb-3">Não perturbe</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure horários em que não deseja receber notificações
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Das
            </label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Até
            </label>
            <input
              type="time"
              defaultValue="07:00"
              className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
