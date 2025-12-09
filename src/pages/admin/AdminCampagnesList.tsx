import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Eye, Calendar } from "lucide-react";
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
  inscriptions_ouvertes: { label: "Inscriptions ouvertes", color: "bg-green-500" },
  inscriptions_cloturees: { label: "Inscriptions clôturées", color: "bg-yellow-500" },
  export_genere: { label: "Export généré", color: "bg-blue-500" },
  offres_importees: { label: "Offres importées", color: "bg-purple-500" },
  offres_envoyees: { label: "Offres envoyées", color: "bg-indigo-500" },
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

      // Get client counts for each campaign
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
      
      // Navigate to the new campaign
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campagnes</h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes d'achat groupé
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune campagne</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre première campagne pour commencer
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une campagne
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.nom}</TableCell>
                    <TableCell>
                      <Badge className={`${statusLabels[campaign.statut]?.color || "bg-gray-500"} text-white`}>
                        {statusLabels[campaign.statut]?.label || campaign.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.date_debut
                        ? format(new Date(campaign.date_debut), "dd MMM yyyy", { locale: fr })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">{campaign.clients_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/campagnes/${campaign.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nom de la campagne</Label>
              <Input
                id="campaign-name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Ex: T2 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-date">Date de début</Label>
              <Input
                id="campaign-date"
                type="datetime-local"
                value={newCampaignDate}
                onChange={(e) => setNewCampaignDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createCampaign} disabled={creating}>
              {creating ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
