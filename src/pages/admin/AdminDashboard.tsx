import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, FileText, MapPin, Zap, Euro, Loader2, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [updatingTarifs, setUpdatingTarifs] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsNouveau: 0,
    leadsContacte: 0,
    leadsConverti: 0,
    totalVilles: 0,
    villesAvecIA: 0,
  });
  const [tarifs, setTarifs] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalLeads },
        { count: leadsNouveau },
        { count: leadsContacte },
        { count: leadsConverti },
        { count: totalVilles },
        { count: villesAvecIA },
        { data: tarifsData },
        { data: leads },
      ] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("statut", "nouveau"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("statut", "contacte"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("statut", "converti"),
        (supabase.from("villes") as any).select("*", { count: "exact", head: true }),
        (supabase.from("villes") as any).select("*", { count: "exact", head: true }).not("contenu_genere_at", "is", null),
        (supabase.from("tarifs_energie") as any).select("*").eq("id", "current").single(),
        supabase.from("leads").select("id, ville, code_postal, type_energie, economie_estimee, statut, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      setStats({
        totalLeads: totalLeads || 0,
        leadsNouveau: leadsNouveau || 0,
        leadsContacte: leadsContacte || 0,
        leadsConverti: leadsConverti || 0,
        totalVilles: totalVilles || 0,
        villesAvecIA: villesAvecIA || 0,
      });
      setTarifs(tarifsData);
      setRecentLeads(leads || []);
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
        fetchStats();
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
          <p className="text-sm text-muted-foreground">Vue d'ensemble comparateur & SEO</p>
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
            <CardTitle className="text-xs font-medium text-muted-foreground">Total leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.leadsNouveau} nouveau · {stats.leadsContacte} contacté · {stats.leadsConverti} converti
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Villes importées</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalVilles}</div>
            <p className="text-xs text-muted-foreground">{stats.villesAvecIA} avec contenu IA</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">TRV Élec</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{tarifs?.trv_elec_kwh?.toFixed(4) || '—'} €/kWh</div>
            <p className="text-xs text-muted-foreground">Abo {tarifs?.trv_elec_abo_annuel || '—'}€/an</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tarif repère Gaz</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{tarifs?.trv_gaz_kwh?.toFixed(4) || '—'} €/kWh</div>
            <p className="text-xs text-muted-foreground">Abo {tarifs?.trv_gaz_abo_annuel || '—'}€/an</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Meilleure élec</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{tarifs?.meilleure_offre_elec_kwh?.toFixed(4) || '—'} €/kWh</div>
            <p className="text-xs text-muted-foreground">Source: {tarifs?.source_offres || '—'}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Dernière MAJ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-sm font-bold text-foreground">
              {tarifs?.updated_at ? new Date(tarifs.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">par {tarifs?.updated_by || '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="rounded-xl border border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold text-foreground">Derniers leads</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun lead reçu</p>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Ville</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Économie</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-sm">{lead.ville || '—'} <span className="text-muted-foreground text-xs">({lead.code_postal})</span></TableCell>
                      <TableCell className="text-sm">{lead.type_energie === 'gaz' ? '🔥' : '⚡'} {lead.type_energie || '—'}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{lead.economie_estimee ? `${lead.economie_estimee}€` : '—'}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${lead.statut === 'nouveau' ? 'bg-primary/10 text-primary' : lead.statut === 'converti' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                          {lead.statut}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground hidden sm:table-cell">
                        {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
