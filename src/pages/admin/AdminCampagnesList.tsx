import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Eye, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

type CampaignStatus = 
  | "inscriptions_ouvertes"
  | "inscriptions_cloturees"
  | "export_genere"
  | "offres_importees"
  | "offres_envoyees"
  | "terminee";

interface Campaign {
  id: string;
  nom: string;
  statut: CampaignStatus;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
  clients_count?: number;
}

const statusLabels: Record<CampaignStatus, { label: string; color: string }> = {
  inscriptions_ouvertes: { label: "Ouvertes", color: "bg-green-500" },
  inscriptions_cloturees: { label: "Clôturées", color: "bg-yellow-500" },
  export_genere: { label: "Export OK", color: "bg-blue-500" },
  offres_importees: { label: "Importées", color: "bg-purple-500" },
  offres_envoyees: { label: "Envoyées", color: "bg-indigo-500" },
  terminee: { label: "Terminée", color: "bg-gray-500" },
};

export default function AdminCampagnesList() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDate, setNewCampaignDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const campaignsWithCounts = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { count } = await supabase
            .from("campaign_users")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          return {
            ...campaign,
            clients_count: count || 0,
          };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Erreur lors du chargement des campagnes");
    } finally {
      setLoading(false);
    }
  };

  const suggestNextCampaignName = () => {
    const currentDate = new Date();
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = currentDate.getFullYear();
    return `T${quarter} ${year}`;
  };

  const openCreateDialog = () => {
    setNewCampaignName(suggestNextCampaignName());
    setNewCampaignDate(new Date().toISOString().slice(0, 16));
    setIsCreateDialogOpen(true);
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("Veuillez entrer un nom pour la campagne");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          nom: newCampaignName.trim(),
          date_debut: newCampaignDate ? new Date(newCampaignDate).toISOString() : null,
          statut: "inscriptions_ouvertes",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Campagne créée avec succès");
      setIsCreateDialogOpen(false);
      fetchCampaigns();
      
      if (data) {
        navigate(`/admin/campagnes/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erreur lors de la création de la campagne");
    } finally {
      setCreating(false);
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Campagnes</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos campagnes d'achat groupé
          </p>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Nouvelle</span>
        </Button>
      </div>

      <Card className="rounded-xl border border-border">
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-base font-medium mb-2 text-foreground">Aucune campagne</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre première campagne
              </p>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-1.5" />
                Créer une campagne
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-xs text-right">Clients</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium text-sm text-foreground">{campaign.nom}</TableCell>
                      <TableCell>
                        <Badge className={`${statusLabels[campaign.statut]?.color || "bg-gray-500"} text-white text-xs`}>
                          {statusLabels[campaign.statut]?.label || campaign.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">
                        {campaign.date_debut
                          ? format(new Date(campaign.date_debut), "dd MMM yy", { locale: fr })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-right">{campaign.clients_count}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/campagnes/${campaign.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Nouvelle campagne</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="campaign-name" className="text-sm">Nom</Label>
              <Input
                id="campaign-name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Ex: T2 2025"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="campaign-date" className="text-sm">Date de début</Label>
              <Input
                id="campaign-date"
                type="datetime-local"
                value={newCampaignDate}
                onChange={(e) => setNewCampaignDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={createCampaign} disabled={creating}>
              {creating ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
