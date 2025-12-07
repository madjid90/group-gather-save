import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Zap,
  Wifi,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface Stats {
  totalInscrits: number;
  energieSeul: number;
  internetSeul: number;
  lesDeux: number;
}

interface CampaignSettings {
  statut: string;
  prochaine_etape: string | null;
  objectif: number;
}

interface DailyRegistration {
  date: string;
  count: number;
}

interface ProviderData {
  name: string;
  value: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const statusColors: Record<string, string> = {
  ouverte: "bg-green-500",
  fermee: "bg-red-500",
  en_negociation: "bg-yellow-500",
  offre_prete: "bg-blue-500",
  archivee: "bg-gray-500",
};

const statusLabels: Record<string, string> = {
  ouverte: "Ouverte",
  fermee: "Fermée",
  en_negociation: "En négociation",
  offre_prete: "Offre prête",
  archivee: "Archivée",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInscrits: 0,
    energieSeul: 0,
    internetSeul: 0,
    lesDeux: 0,
  });
  const [campaign, setCampaign] = useState<CampaignSettings | null>(null);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);
  const [energyProviders, setEnergyProviders] = useState<ProviderData[]>([]);
  const [internetProviders, setInternetProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles stats
      const { data: profiles } = await supabase
        .from("profiles")
        .select("contrats, created_at, fournisseur_energie_actuel, fournisseur_internet_actuel");

      if (profiles) {
        const totalInscrits = profiles.length;
        const energieSeul = profiles.filter(p => p.contrats === "electricite").length;
        const internetSeul = profiles.filter(p => p.contrats === "internet").length;
        const lesDeux = profiles.filter(p => p.contrats === "les_deux").length;

        setStats({ totalInscrits, energieSeul, internetSeul, lesDeux });

        // Process daily registrations (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), 29 - i);
          return format(date, "yyyy-MM-dd");
        });

        const registrationsByDay = last30Days.map(date => {
          const count = profiles.filter(p => 
            p.created_at && format(new Date(p.created_at), "yyyy-MM-dd") === date
          ).length;
          return { date: format(new Date(date), "dd MMM", { locale: fr }), count };
        });

        setDailyRegistrations(registrationsByDay);

        // Process energy providers
        const energyCount: Record<string, number> = {};
        profiles.forEach(p => {
          if (p.fournisseur_energie_actuel) {
            energyCount[p.fournisseur_energie_actuel] = (energyCount[p.fournisseur_energie_actuel] || 0) + 1;
          }
        });
        setEnergyProviders(
          Object.entries(energyCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
        );

        // Process internet providers
        const internetCount: Record<string, number> = {};
        profiles.forEach(p => {
          if (p.fournisseur_internet_actuel) {
            internetCount[p.fournisseur_internet_actuel] = (internetCount[p.fournisseur_internet_actuel] || 0) + 1;
          }
        });
        setInternetProviders(
          Object.entries(internetCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
        );
      }

      // Fetch campaign settings
      const { data: campaignData } = await supabase
        .from("campaign_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (campaignData) {
        setCampaign(campaignData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la plateforme Switchly</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inscrits</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInscrits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Énergie seul</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.energieSeul}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Internet seul</CardTitle>
            <Wifi className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.internetSeul}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Les deux</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lesDeux}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Statut Campagne</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={`${statusColors[campaign?.statut || "ouverte"]} text-white`}>
              {statusLabels[campaign?.statut || "ouverte"]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prochaine étape</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium truncate">
              {campaign?.prochaine_etape || "Non définie"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des inscriptions (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Inscriptions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Provider Distribution */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs Énergie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {energyProviders.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={energyProviders}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {energyProviders.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs Internet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {internetProviders.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={internetProviders}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {internetProviders.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
