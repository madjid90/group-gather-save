import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, FileText, Send, CheckCircle, TrendingUp, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CampaignStats {
  id: string;
  nom: string;
  total_clients: number;
  taux_acceptation: number;
  economie_moyenne: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
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
      // Total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Formulaires complétés
      const { count: formulairesCompletes } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("housing_form_completed", true);

      // Campagnes en cours
      const { count: campagnesEnCours } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .neq("statut", "terminee");

      // Offres envoyées
      const { count: offresEnvoyees } = await supabase
        .from("user_offers")
        .select("*", { count: "exact", head: true })
        .eq("statut", "envoyee");

      // Offres acceptées
      const { count: offresAcceptees } = await supabase
        .from("user_offers")
        .select("*", { count: "exact", head: true })
        .eq("statut", "acceptee");

      // Économie totale (somme des économies annuelles des offres acceptées)
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

      // Fetch last 3 campaigns with stats
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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Formulaires complétés
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.formulairesCompletes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 
                ? `${Math.round((stats.formulairesCompletes / stats.totalUsers) * 100)}% des inscrits`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campagnes en cours
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campagnesEnCours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres envoyées
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offresEnvoyees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres acceptées
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offresAcceptees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Économie totale
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.economieTotale.toLocaleString("fr-FR")} €/an
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune campagne créée
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Taux d'acceptation</TableHead>
                  <TableHead className="text-right">Économie moyenne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.nom}</TableCell>
                    <TableCell className="text-right">{campaign.total_clients}</TableCell>
                    <TableCell className="text-right">
                      {campaign.taux_acceptation.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.economie_moyenne.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €/an
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
