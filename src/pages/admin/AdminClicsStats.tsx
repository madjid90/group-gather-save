import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Loader2, MousePointerClick, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface ClickEvent {
  id: string;
  event_type: string;
  source: string;
  created_at: string;
}

interface StatsData {
  totalClicks: number;
  ctaClicks: number;
  offersAccepted: number;
  offersRefused: number;
  bySource: { name: string; value: number }[];
  byDay: { date: string; cta: number; acceptees: number; refusees: number }[];
  conversionRate: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SOURCE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  cta_section: 'Section CTA',
  mobile_cta: 'CTA Mobile',
  navbar: 'Navbar',
  mon_offre: 'Page Offre',
  partage: 'Partage'
};

export default function AdminClicsStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all click events from the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: events, error } = await (supabase
        .from('click_events') as any)
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const clickEvents = (events || []) as ClickEvent[];

      // Calculate stats
      const ctaClicks = clickEvents.filter(e => e.event_type === 'cta_inscription').length;
      const offersAccepted = clickEvents.filter(e => e.event_type === 'offre_acceptee').length;
      const offersRefused = clickEvents.filter(e => e.event_type === 'offre_refusee').length;
      const totalClicks = clickEvents.length;

      // Group by source
      const sourceMap = new Map<string, number>();
      clickEvents
        .filter(e => e.event_type === 'cta_inscription')
        .forEach(e => {
          const count = sourceMap.get(e.source) || 0;
          sourceMap.set(e.source, count + 1);
        });
      
      const bySource = Array.from(sourceMap.entries()).map(([name, value]) => ({
        name: SOURCE_LABELS[name] || name,
        value
      }));

      // Group by day
      const dayMap = new Map<string, { cta: number; acceptees: number; refusees: number }>();
      
      // Initialize last 14 days
      for (let i = 13; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'dd/MM', { locale: fr });
        dayMap.set(date, { cta: 0, acceptees: 0, refusees: 0 });
      }

      clickEvents.forEach(e => {
        const date = format(new Date(e.created_at), 'dd/MM', { locale: fr });
        const existing = dayMap.get(date);
        if (existing) {
          if (e.event_type === 'cta_inscription') existing.cta++;
          if (e.event_type === 'offre_acceptee') existing.acceptees++;
          if (e.event_type === 'offre_refusee') existing.refusees++;
        }
      });

      const byDay = Array.from(dayMap.entries()).map(([date, counts]) => ({
        date,
        ...counts
      }));

      // Conversion rate
      const totalOfferResponses = offersAccepted + offersRefused;
      const conversionRate = totalOfferResponses > 0 
        ? Math.round((offersAccepted / totalOfferResponses) * 100) 
        : 0;

      setStats({
        totalClicks,
        ctaClicks,
        offersAccepted,
        offersRefused,
        bySource,
        byDay,
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching click stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistiques des clics</h1>
        <p className="text-muted-foreground text-sm">
          Analyse des clics CTA et des réponses aux offres (30 derniers jours)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MousePointerClick className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.ctaClicks}</p>
                <p className="text-xs text-muted-foreground">Clics CTA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.offersAccepted}</p>
                <p className="text-xs text-muted-foreground">Offres acceptées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.offersRefused}</p>
                <p className="text-xs text-muted-foreground">Offres refusées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Taux d'acceptation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart - Evolution over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évolution des clics (14 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.byDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cta" 
                    name="Clics CTA"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="acceptees" 
                    name="Acceptées"
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="refusees" 
                    name="Refusées"
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - CTA by source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clics CTA par source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.bySource.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.bySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    >
                      {stats.bySource.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
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

        {/* Bar Chart - Offer responses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Réponses aux offres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: 'Offres acceptées', value: stats.offersAccepted, fill: '#22c55e' },
                    { name: 'Offres refusées', value: stats.offersRefused, fill: '#ef4444' }
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
