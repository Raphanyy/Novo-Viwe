import React, { useState, useEffect } from "react";
import {
  Navigation,
  Play,
  Pause,
  Square,
  MapPin,
  Clock,
  Route,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface NavigationStep {
  id: string;
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
  isCompleted: boolean;
}

interface NavigationStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isCompleted: boolean;
  timeSpent?: number;
  notes?: string;
}

interface NavigationSession {
  id: string;
  routeId: string;
  routeName: string;
  status: "active" | "paused" | "completed";
  currentStopIndex: number;
  totalStops: number;
  totalDistance: string;
  estimatedDuration: string;
  elapsedTime: number;
  currentLatitude?: number;
  currentLongitude?: number;
}

interface NavigationInterfaceProps {
  session: NavigationSession;
  stops: NavigationStop[];
  currentSteps: NavigationStep[];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCompleteStop: (stopId: string, timeSpent: number, notes?: string) => void;
  onUpdateLocation: (lat: number, lng: number) => void;
}

const NavigationInterface: React.FC<NavigationInterfaceProps> = ({
  session,
  stops,
  currentSteps,
  onPause,
  onResume,
  onStop,
  onCompleteStop,
  onUpdateLocation,
}) => {
  const [elapsedTime, setElapsedTime] = useState(session.elapsedTime);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Timer para elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session.status === "active") {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.status]);

  // Geolocation tracking
  useEffect(() => {
    let watchId: number;

    if (session.status === "active" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          onUpdateLocation(latitude, longitude);
        },
        (error) => {
          console.warn("Erro ao obter localização:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [session.status, onUpdateLocation]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const completedStops = stops.filter((stop) => stop.isCompleted).length;
  const progressPercentage = (completedStops / session.totalStops) * 100;
  const currentStop = stops[session.currentStopIndex];
  const nextStep = currentSteps.find((step) => !step.isCompleted);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Status da Navegação */}
      <div className="bg-black p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg">
                {session.routeName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {session.status === "active" ? "Navegando..." : 
                 session.status === "paused" ? "Pausado" : "Concluído"}
              </p>
            </div>
          </div>
          
          {/* Controles */}
          <div className="flex space-x-2">
            {session.status === "active" ? (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : session.status === "paused" ? (
              <Button variant="outline" size="sm" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            ) : null}
            
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Parada {session.currentStopIndex + 1} de {session.totalStops}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercentage)}% concluído
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-muted-foreground">Tempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {session.totalDistance}
            </div>
            <div className="text-xs text-muted-foreground">Distância</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {session.estimatedDuration}
            </div>
            <div className="text-xs text-muted-foreground">Estimado</div>
          </div>
        </div>
      </div>

      {/* Próxima Instrução */}
      {nextStep && (
        <div className="bg-primary/10 border-l-4 border-l-primary p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <ChevronRight className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {nextStep.instruction}
              </p>
              <p className="text-sm text-muted-foreground">
                {nextStep.distance} • {nextStep.duration}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Paradas */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>Paradas da Rota</span>
        </h3>

        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`p-4 rounded-lg border transition-all ${
                index === session.currentStopIndex
                  ? "border-primary bg-primary/5"
                  : stop.isCompleted
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stop.isCompleted
                        ? "bg-green-500 text-white"
                        : index === session.currentStopIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stop.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{stop.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stop.address}
                    </p>
                    {stop.isCompleted && stop.timeSpent && (
                      <p className="text-xs text-green-600 mt-1">
                        Tempo na parada: {formatTime(stop.timeSpent)}
                      </p>
                    )}
                  </div>
                </div>

                {index === session.currentStopIndex && !stop.isCompleted && (
                  <Button
                    size="sm"
                    onClick={() => onCompleteStop(stop.id, 300, "Parada concluída")} // 5 minutes default
                    className="ml-3"
                  >
                    Concluir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status da Localização */}
      {currentLocation && (
        <div className="bg-muted/50 px-4 py-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Localização atual:</span>
            <span className="text-foreground font-mono">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationInterface;
