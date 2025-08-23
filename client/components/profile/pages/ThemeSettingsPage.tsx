import React, { useState } from "react";
import { Sun, Moon, Smartphone, Monitor, Palette, Globe } from "lucide-react";

interface ThemeSettingsPageProps {
  onBack: () => void;
}

const ThemeSettingsPage: React.FC<ThemeSettingsPageProps> = ({ onBack }) => {
  const [selectedTheme, setSelectedTheme] = useState("auto");
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");

  const themeOptions = [
    { 
      id: "auto", 
      name: "Automático", 
      description: "Segue configuração do sistema",
      icon: Smartphone 
    },
    { 
      id: "light", 
      name: "Claro", 
      description: "Sempre usar tema claro",
      icon: Sun 
    },
    { 
      id: "dark", 
      name: "Escuro", 
      description: "Sempre usar tema escuro",
      icon: Moon 
    },
  ];

  const languageOptions = [
    { id: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
    { id: "en-US", name: "English (US)", flag: "🇺🇸" },
    { id: "es-ES", name: "Español", flag: "🇪🇸" },
    { id: "fr-FR", name: "Français", flag: "🇫🇷" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Seleção de Tema */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center space-x-2">
          <Palette className="h-5 w-5 text-primary" />
          <span>Tema do Aplicativo</span>
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {themeOptions.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border bg-card hover:bg-accent/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}>
                      {theme.name}
                    </h4>
                    <p className={`text-sm ${
                      isSelected ? "text-primary/70" : "text-muted-foreground"
                    }`}>
                      {theme.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seleção de Idioma */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-primary" />
          <span>Idioma</span>
        </h3>
        
        <div className="space-y-3">
          {languageOptions.map((language) => (
            <button
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                selectedLanguage === language.id
                  ? "bg-primary/5 border-2 border-primary"
                  : "bg-secondary hover:bg-accent border-2 border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <span className={`font-medium ${
                  selectedLanguage === language.id
                    ? "text-primary"
                    : "text-foreground"
                }`}>
                  {language.name}
                </span>
              </div>
              {selectedLanguage === language.id && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Personalização Adicional */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4">Personalização</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tamanho da fonte
            </label>
            <input
              type="range"
              min="12"
              max="20"
              defaultValue="16"
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Pequeno</span>
              <span>Médio</span>
              <span>Grande</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Densidade de informações
            </label>
            <select className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="compact">Compacto</option>
              <option value="normal" selected>Normal</option>
              <option value="comfortable">Confortável</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4">Visualização</h3>
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-primary rounded-full"></div>
            <div>
              <p className="font-medium text-foreground">Exemplo de texto</p>
              <p className="text-sm text-muted-foreground">Subtítulo de exemplo</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Este é um exemplo de como o texto aparecerá com suas configurações atuais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;
