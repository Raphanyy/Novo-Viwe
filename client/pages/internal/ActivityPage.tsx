import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Car,
  Route,
  DollarSign,
  Zap,
  Filter,
  Search,
  Download,
  Share2,
  Star,
  ChevronDown,
  ChevronRight,
  Award,
  Target,
  Fuel,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Progress } from "../../components/ui/progress";
import AdaptiveModal from "../../components/shared/AdaptiveModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { dashboardService } from "../../services/api";

type RouteStatus = "completed" | "paused" | "configured" | "forgotten";

interface RouteDetails {
  id: number;
  name: string;
  date: string;
  time: string;
  duration: string;
  distance: string;
  startAddress: string;
  endAddress: string;
  route: string;
  savings: { time: string; fuel: string; money: string };
  efficiency: number;
  traffic: "light" | "normal" | "heavy";
  cost: string;
  status: RouteStatus;
  description?: string;
}

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  description: string;
  details: {
    subtitle: string;
    items: { label: string; value: string }[];
    trend: string;
  };
}

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getActivity();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-foreground">Carregando atividades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="text-destructive mb-4 text-center">
          <p className="text-xl font-semibold">Erro ao carregar atividades</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-black rounded-2xl p-4 text-white border border-l-4 border-l-primary relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold">Atividades</h1>
                <p className="text-gray-300 text-xs">Histórico de atividades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Atividades Recentes ({activities.length})
            </h3>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-card rounded-xl border border-l-4 border-l-primary p-3"
              >
                <h4 className="font-semibold text-foreground text-sm">
                  {activity.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.timestamp).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Nenhuma atividade encontrada
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
