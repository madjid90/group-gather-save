import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  History, 
  Users, 
  Send, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface CampaignStats {
  id: string;
  export_date: string | null;
  total_profiles: number;
  offers_sent: number;
  offers_accepted: number;
  offers_refused: number;
  offers_pending: number;
  conversion_rate: number;
}

export default function AdminHistorique() {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalProfiles: 0,
    totalOffersSent: 0,
    totalAccepted: 0,
    avgConversion: 0,
  });

  useEffect(() => {
    fetchCampaignHistory();
  }, []);

  const fetchCampaignHistory = async () => {
    try {
      // Fetch all campaign exports
      const { data: exports, error: exportsError } = await supabase
        .from("campaign_exports")
        .select("*")
        .order("export_date", { ascending: false });

      if (exportsError) throw exportsError;

      // For each export, calculate statistics from user_offers
      const statsPromises = (exports || []).map(async (exp) => {
        const { data: offers } = await supabase
          .from("user_offers")
          .select("statut")
          .eq("export_id", exp.id);

        const offersList = offers || [];
        const sent = offersList.filter((o) => o.statut !== "draft").length;
        const accepted = offersList.filter((o) => o.statut === "acceptee").length;
        const refused = offersList.filter((o) => o.statut === "refusee").length;
        const pending = offersList.filter((o) => o.statut === "envoyee").length;

        return {
          id: exp.id,
          export_date: exp.export_date,
          total_profiles: exp.total_profiles || 0,
          offers_sent: sent,
          offers_accepted: accepted,
          offers_refused: refused,
          offers_pending: pending,
          conversion_rate: sent > 0 ? Math.round((accepted / sent) * 100) : 0,
        };
      });

      const campaignStats = await Promise.all(statsPromises);
      setCampaigns(campaignStats);

      // Calculate total stats
      const totals = campaignStats.reduce(
        (acc, c) => ({
          totalProfiles: acc.totalProfiles + c.total_profiles,
          totalOffersSent: acc.totalOffersSent + c.offers_sent,
          totalAccepted: acc.totalAccepted + c.offers_accepted,
          avgConversion: 0,
        }),
        { totalProfiles: 0, totalOffersSent: 0, totalAccepted: 0, avgConversion: 0 }
      );

      totals.avgConversion =
        totals.totalOffersSent > 0
          ? Math.round((totals.totalAccepted / totals.totalOffersSent) * 100)
          : 0;

      setTotalStats(totals);
    } catch (error) {
      console.error("Error fetching campaign history:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const getConversionBadge = (rate: number) => {
    if (rate >= 30) {
      return <Badge className="bg-green-500 text-white">{rate}%</Badge>;
    } else if (rate >= 15) {
      return <Badge className="bg-yellow-500 text-white">{rate}%</Badge>;
    } else if (rate > 0) {
      return <Badge className="bg-orange-500 text-white">{rate}%</Badge>;
    }
    return <Badge variant="secondary">-</Badge>;
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
        <h1 className="text-2xl font-bold text-foreground">Historique des Campagnes</h1>
        <p className="text-muted-foreground">
          {campaigns.length} campagne(s) réalisée(s)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalProfiles}</div>
            <p className="text-xs text-muted-foreground">
              sur toutes les campagnes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres Envoyées
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalOffersSent}</div>
            <p className="text-xs text-muted-foreground">
              offres transmises aux clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Souscriptions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStats.totalAccepted}
            </div>
            <p className="text-xs text-muted-foreground">offres acceptées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de Conversion
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalStats.avgConversion}%
            </div>
            <p className="text-xs text-muted-foreground">moyenne globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign History Table */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucune campagne</h3>
            <p className="text-muted-foreground">
              L'historique apparaîtra après le premier export de campagne
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Détail par campagne
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead className="text-center">Offres envoyées</TableHead>
                    <TableHead className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Acceptées
                      </span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Refusées
                      </span>
                    </TableHead>
                    <TableHead className="text-center">En attente</TableHead>
                    <TableHead className="text-center">Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        {campaign.export_date
                          ? format(new Date(campaign.export_date), "dd MMMM yyyy", {
                              locale: fr,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{campaign.total_profiles}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {campaign.offers_sent}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">
                          {campaign.offers_accepted}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">
                          {campaign.offers_refused}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">
                          {campaign.offers_pending}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getConversionBadge(campaign.conversion_rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Funnel */}
      {totalStats.totalProfiles > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entonnoir de Conversion Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Participants inscrits</span>
                  <span className="text-sm font-bold">{totalStats.totalProfiles}</span>
                </div>
                <div className="h-8 bg-primary/20 rounded-lg overflow-hidden">
                  <div className="h-full bg-primary rounded-lg" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Offres envoyées</span>
                  <span className="text-sm font-bold">
                    {totalStats.totalOffersSent}
                    <span className="text-muted-foreground font-normal ml-2">
                      ({totalStats.totalProfiles > 0
                        ? Math.round((totalStats.totalOffersSent / totalStats.totalProfiles) * 100)
                        : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-8 bg-blue-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-lg transition-all"
                    style={{
                      width: `${
                        totalStats.totalProfiles > 0
                          ? (totalStats.totalOffersSent / totalStats.totalProfiles) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Souscriptions</span>
                  <span className="text-sm font-bold text-green-600">
                    {totalStats.totalAccepted}
                    <span className="text-muted-foreground font-normal ml-2">
                      ({totalStats.avgConversion}%)
                    </span>
                  </span>
                </div>
                <div className="h-8 bg-green-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-lg transition-all"
                    style={{
                      width: `${
                        totalStats.totalOffersSent > 0
                          ? (totalStats.totalAccepted / totalStats.totalOffersSent) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
