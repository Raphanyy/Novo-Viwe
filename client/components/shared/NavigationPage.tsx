import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationInterface from "./NavigationInterface";
import { LoadingState } from "./LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

interface NavigationPageProps {}

const NavigationPage: React.FC<NavigationPageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [currentSteps, setCurrentSteps] = useState<any[]>([]);

  // Dados mock para demonstração
  useEffect(() => {
    if (!sessionId) {
      setError("ID da sessão não fornecido");
      setIsLoading(false);
      return;
    }

    // Simular carregamento de dados
    setTimeout(() => {
      setSession({
        id: sessionId,
        routeId: "route_1",
        routeName: "Rota Centro → Shopping",
        status: "active",
        currentStopIndex: 1,
        totalStops: 4,
        totalDistance: "12.5 km",
        estimatedDuration: "35 min",
        elapsedTime: 180, // 3 minutos
        currentLatitude: -23.5475,
        currentLongitude: -46.6361,
      });

      setStops([
        {
          id: "stop_1",
          name: "Ponto de Partida",
          address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
          latitude: -23.5475,
          longitude: -46.6361,
          isCompleted: true,
          timeSpent: 60,
        },
        {
          id: "stop_2",
          name: "Banco do Brasil",
          address: "Praça da Sé, 111 - Centro, São Paulo - SP",
          latitude: -23.5505,
          longitude: -46.6440,
          isCompleted: false,
        },
        {
          id: "stop_3",
          name: "Farmácia São Paulo",
          address: "R. Augusta, 850 - Consolação, São Paulo - SP",
          latitude: -23.5500,
          longitude: -46.6350,
          isCompleted: false,
        },
        {
          id: "stop_4",
          name: "Shopping Eldorado",
          address: "Av. Rebouças, 3970 - Pinheiros, São Paulo - SP",
          latitude: -23.5631,
          longitude: -46.6947,
          isCompleted: false,
        },
      ]);

      setCurrentSteps([
        {
          id: "step_1",
          instruction: "Continue reto na Av. Paulista por 800m",
          distance: "800m",
          duration: "2 min",
          maneuver: "straight",
          isCompleted: false,
        },
        {
          id: "step_2",
          instruction: "Vire à direita na R. da Consolação",
          distance: "200m",
          duration: "1 min",
          maneuver: "turn-right",
          isCompleted: false,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [sessionId]);

  const handlePause = () => {
    if (session) {
      setSession({ ...session, status: "paused" });
    }
  };

  const handleResume = () => {
    if (session) {
      setSession({ ...session, status: "active" });
    }
  };

  const handleStop = () => {
    if (session) {
      setSession({ ...session, status: "completed" });
      // Redirecionar para resumo da viagem após alguns segundos
      setTimeout(() => {
        navigate("/app/routes");
      }, 3000);
    }
  };

  const handleCompleteStop = (stopId: string, timeSpent: number, notes?: string) => {
    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.id === stopId
          ? { ...stop, isCompleted: true, timeSpent, notes }
          : stop
      )
    );

    // Avançar para próxima parada
    if (session) {
      const currentIndex = stops.findIndex((stop) => stop.id === stopId);
      if (currentIndex < stops.length - 1) {
        setSession({
          ...session,
          currentStopIndex: currentIndex + 1,
        });
      } else {
        // Última parada - completar navegação
        setSession({ ...session, status: "completed" });
      }
    }
  };

  const handleUpdateLocation = (lat: number, lng: number) => {
    if (session) {
      setSession({
        ...session,
        currentLatitude: lat,
        currentLongitude: lng,
      });
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="h-screen bg-background">
      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingText="Carregando navegação..."
        retryAction={() => window.location.reload()}
      >
        {session && (
          <NavigationInterface
            session={session}
            stops={stops}
            currentSteps={currentSteps}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onCompleteStop={handleCompleteStop}
            onUpdateLocation={handleUpdateLocation}
          />
        )}
      </LoadingState>
    </div>
  );
};

export default NavigationPage;
