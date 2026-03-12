import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, FileText, Send, CheckCircle, TrendingUp, Euro, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignStats {
  id: string;
  nom: string;
  total_clients: number;
  taux_acceptation: number;
  economie_moyenne: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [updatingTarifs, setUpdatingTarifs] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    formulairesCompletes: 0,
    campagnesEnCours: 0,
    offresEnvoyees: 0,
    offresAcceptees: 0,
    economieTotale: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignStats[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: formulairesCompletes } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("housing_form_completed", true);

      const { count: campagnesEnCours } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .neq("statut", "terminee");

      const { count: offresEnvoyees } = await supabase
        .from("user_offers")
        .select("*", { count: "exact", head: true })
        .eq("statut", "envoyee");

      const { count: offresAcceptees } = await supabase
        .from("user_offers")
        .select("*", { count: "exact", head: true })
        .eq("statut", "acceptee");

      const { data: acceptedOffers } = await supabase
        .from("user_offers")
        .select("economie_estimee_annuelle")
        .eq("statut", "acceptee");

      const economieTotale = acceptedOffers?.reduce(
        (sum, offer) => sum + (offer.economie_estimee_annuelle || 0),
        0
      ) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        formulairesCompletes: formulairesCompletes || 0,
        campagnesEnCours: campagnesEnCours || 0,
        offresEnvoyees: offresEnvoyees || 0,
        offresAcceptees: offresAcceptees || 0,
        economieTotale,
      });

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, nom")
        .order("created_at", { ascending: false })
        .limit(3);

      if (campaigns) {
        const campaignStats: CampaignStats[] = [];
        
        for (const campaign of campaigns) {
          const { count: totalClients } = await supabase
            .from("campaign_users")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          const { data: offers } = await supabase
            .from("user_offers")
            .select("statut, economie_estimee_annuelle")
            .eq("campaign_id", campaign.id);

          const acceptedCount = offers?.filter(o => o.statut === "acceptee").length || 0;
          const totalOffers = offers?.length || 0;
          const tauxAcceptation = totalOffers > 0 ? (acceptedCount / totalOffers) * 100 : 0;
          
          const totalEconomie = offers
            ?.filter(o => o.statut === "acceptee")
            .reduce((sum, o) => sum + (o.economie_estimee_annuelle || 0), 0) || 0;
          const economieMoyenne = acceptedCount > 0 ? totalEconomie / acceptedCount : 0;

          campaignStats.push({
            id: campaign.id,
            nom: campaign.nom,
            total_clients: totalClients || 0,
            taux_acceptation: tauxAcceptation,
            economie_moyenne: economieMoyenne,
          });
        }

        setRecentCampaigns(campaignStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTarifs = async () => {
    setUpdatingTarifs(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-tarifs', { body: {} });
      if (!error && data) {
        toast({ title: "Tarifs mis à jour", description: data.log?.join(' | ') || 'Mise à jour terminée' });
      } else {
        toast({ title: "Erreur", description: error?.message || 'Erreur inconnue', variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setUpdatingTarifs(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Button onClick={updateTarifs} disabled={updatingTarifs} variant="outline" size="sm">
          {updatingTarifs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {updatingTarifs ? "Mise à jour..." : "Maj tarifs CRE"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Formulaires OK
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.formulairesCompletes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 
                ? `${Math.round((stats.formulairesCompletes / stats.totalUsers) * 100)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Campagnes actives
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.campagnesEnCours}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Offres envoyées
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.offresEnvoyees}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Offres acceptées
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.offresAcceptees}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Économie totale
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {stats.economieTotale.toLocaleString("fr-FR")} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="rounded-xl border border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold text-foreground">Dernières campagnes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucune campagne créée
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs text-right">Clients</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Taux</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Économie moy.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium text-sm text-foreground">{campaign.nom}</TableCell>
                      <TableCell className="text-sm text-right">{campaign.total_clients}</TableCell>
                      <TableCell className="text-sm text-right hidden sm:table-cell">
                        {campaign.taux_acceptation.toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-sm text-right hidden sm:table-cell">
                        {campaign.economie_moyenne.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
