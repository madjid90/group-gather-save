import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Users,
  Calendar,
  Check,
  X,
  Lock,
  Download,
  Upload,
  Send,
  FileDown,
  Flag,
  Plus,
} from "lucide-react";
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
  progression_inscriptions_ouvertes: boolean;
  progression_inscriptions_cloturees: boolean;
  progression_export_genere: boolean;
  progression_offres_importees: boolean;
  progression_offres_envoyees: boolean;
  progression_acceptations_exportees: boolean;
}

const statusLabels: Record<CampaignStatus, { label: string; color: string }> = {
  inscriptions_ouvertes: { label: "Inscriptions ouvertes", color: "bg-green-500" },
  inscriptions_cloturees: { label: "Inscriptions clôturées", color: "bg-yellow-500" },
  export_genere: { label: "Export généré", color: "bg-blue-500" },
  offres_importees: { label: "Offres importées", color: "bg-purple-500" },
  offres_envoyees: { label: "Offres envoyées", color: "bg-indigo-500" },
  terminee: { label: "Terminée", color: "bg-gray-500" },
};

const progressionSteps = [
  { key: "progression_inscriptions_ouvertes", label: "Inscriptions ouvertes" },
  { key: "progression_inscriptions_cloturees", label: "Inscriptions clôturées" },
  { key: "progression_export_genere", label: "Export anonymisé généré" },
  { key: "progression_offres_importees", label: "Offres importées" },
  { key: "progression_offres_envoyees", label: "Offres envoyées" },
  { key: "progression_acceptations_exportees", label: "Acceptations exportées" },
];

export default function AdminCampagneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clientsCount, setClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCampaign(data);

      // Get clients count
      const { count } = await supabase
        .from("campaign_users")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", id);

      setClientsCount(count || 0);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Erreur lors du chargement de la campagne");
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (updates: Partial<Campaign>) => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", campaign.id);

      if (error) throw error;
      setCampaign({ ...campaign, ...updates });
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
  };

  // ACTION 1: Clôturer les inscriptions et envoyer SMS négociation
  const handleClotureInscriptions = async () => {
    if (!campaign) return;
    setActionLoading("cloture");

    try {
      // Get all users who registered during this campaign period and have inclusion_campagne = true
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("inclusion_campagne", true);

      if (usersError) throw usersError;

      // Add users to campaign_users
      if (users && users.length > 0) {
        const campaignUsers = users.map((user) => ({
          campaign_id: campaign.id,
          user_id: user.id,
          statut_dans_campagne: "inscrit",
        }));

        const { error: insertError } = await supabase
          .from("campaign_users")
          .upsert(campaignUsers, { onConflict: "campaign_id,user_id" });

        if (insertError) throw insertError;
      }

      await updateCampaign({
        statut: "inscriptions_cloturees",
        progression_inscriptions_cloturees: true,
      });

      setClientsCount(users?.length || 0);

      // Automatically send negotiation start SMS to all users in campaign
      try {
        const response = await supabase.functions.invoke("send-negotiation-start-sms", {
          body: { campaignId: campaign.id },
        });
        if (response.data?.sent) {
          toast.success(`Inscriptions clôturées. ${users?.length || 0} clients ajoutés. ${response.data.sent} SMS négociation envoyés.`);
        } else {
          toast.success(`Inscriptions clôturées. ${users?.length || 0} clients ajoutés à la campagne.`);
        }
      } catch (smsError) {
        console.log("Negotiation SMS not sent:", smsError);
        toast.success(`Inscriptions clôturées. ${users?.length || 0} clients ajoutés à la campagne.`);
      }
    } catch (error) {
      console.error("Error closing inscriptions:", error);
      toast.error("Erreur lors de la clôture des inscriptions");
    } finally {
      setActionLoading(null);
    }
  };

  // ACTION 2: Exporter clients anonymisés
  const handleExport = async () => {
    if (!campaign) return;
    setActionLoading("export");

    try {
      const response = await supabase.functions.invoke("export-campaign-anonymous", {
        body: { campaign_id: campaign.id },
      });

      if (response.error) throw new Error(response.error.message);

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export_${campaign.nom.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await updateCampaign({
        statut: "export_genere",
        progression_export_genere: true,
      });

      toast.success("Export généré avec succès");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setActionLoading(null);
    }
  };

  // ACTION 3: Importer les offres
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !campaign) return;

    setActionLoading("import");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaign_id", campaign.id);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/import-supplier-offers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erreur lors de l'import");
      }

      await updateCampaign({
        statut: "offres_importees",
        progression_offres_importees: true,
      });

      let message = `Import terminé : ${result.importedRows} offres importées.`;
      if (result.errors > 0) {
        message += ` ${result.errors} erreur(s).`;
      }
      if (result.notFoundClientIds?.length > 0) {
        message += ` Client(s) non trouvé(s) : ${result.notFoundClientIds.join(", ")}`;
      }
      toast.success(message);
    } catch (error) {
      console.error("Error importing offers:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'import");
    } finally {
      setActionLoading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ACTION 4: Envoyer les offres par SMS
  const handleSendOffers = async () => {
    if (!campaign) return;
    setActionLoading("send");

    try {
      const response = await supabase.functions.invoke("send-campaign-offers-sms", {
        body: { campaign_id: campaign.id },
      });

      if (response.error) throw new Error(response.error.message);

      await updateCampaign({
        statut: "offres_envoyees",
        progression_offres_envoyees: true,
      });

      const result = response.data;
      toast.success(`${result.sent} SMS envoyés avec succès. ${result.failed} échec(s).`);
    } catch (error) {
      console.error("Error sending offers:", error);
      toast.error("Erreur lors de l'envoi des SMS");
    } finally {
      setActionLoading(null);
    }
  };

  // ACTION 5: Exporter les acceptations
  const handleExportAcceptations = async () => {
    if (!campaign) return;
    setActionLoading("export-accept");

    try {
      const response = await supabase.functions.invoke("export-accepted-offers", {
        body: { campaign_id: campaign.id },
      });

      if (response.error) throw new Error(response.error.message);

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `acceptations_${campaign.nom.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await updateCampaign({
        progression_acceptations_exportees: true,
      });

      toast.success("Export des acceptations généré");
    } catch (error) {
      console.error("Error exporting acceptations:", error);
      toast.error("Erreur lors de l'export des acceptations");
    } finally {
      setActionLoading(null);
    }
  };

  // ACTION 6: Terminer la campagne
  const handleTerminer = async () => {
    if (!campaign) return;
    if (!confirm("Terminer cette campagne ? Elle sera figée et archivée.")) return;

    setActionLoading("terminer");
    try {
      await updateCampaign({
        statut: "terminee",
        date_fin: new Date().toISOString(),
      });

      toast.success("Campagne terminée");
    } catch (error) {
      console.error("Error finishing campaign:", error);
      toast.error("Erreur lors de la clôture");
    } finally {
      setActionLoading(null);
    }
  };

  // Create next campaign
  const handleCreateNextCampaign = async () => {
    if (!campaign) return;

    const currentDate = new Date();
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const nextQuarter = quarter === 4 ? 1 : quarter + 1;
    const year = quarter === 4 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
    const suggestedName = `T${nextQuarter} ${year}`;

    const name = prompt("Nom de la nouvelle campagne :", suggestedName);
    if (!name) return;

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          nom: name,
          date_debut: new Date().toISOString(),
          statut: "inscriptions_ouvertes",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Nouvelle campagne créée");
      if (data) {
        navigate(`/admin/campagnes/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erreur lors de la création");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campagne non trouvée</p>
        <Button variant="link" onClick={() => navigate("/admin/campagnes")}>
          Retour aux campagnes
        </Button>
      </div>
    );
  }

  const isTerminee = campaign.statut === "terminee";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/admin/campagnes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground truncate">{campaign.nom}</h1>
          <p className="text-xs text-muted-foreground">Détail campagne</p>
        </div>
        {isTerminee && (
          <Button size="sm" className="text-xs h-8 shrink-0" onClick={handleCreateNextCampaign}>
            <Plus className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Suivante</span>
          </Button>
        )}
      </div>

      {/* Info Block */}
      <Card className="rounded-xl">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Informations</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Statut</p>
              <Badge className={`${statusLabels[campaign.statut]?.color || "bg-gray-500"} text-white text-[10px] mt-0.5`}>
                {statusLabels[campaign.statut]?.label || campaign.statut}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Clients</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{clientsCount}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Début</p>
              <p className="text-sm font-medium">
                {campaign.date_debut
                  ? format(new Date(campaign.date_debut), "dd/MM/yy", { locale: fr })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Fin</p>
              <p className="text-sm font-medium">
                {campaign.date_fin
                  ? format(new Date(campaign.date_fin), "dd/MM/yy", { locale: fr })
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression Block */}
      <Card className="rounded-xl">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Progression</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {progressionSteps.map((step, index) => {
              const isComplete = campaign[step.key as keyof Campaign] as boolean;
              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isComplete ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{index + 1}</span>}
                  </div>
                  <span className={`text-xs ${isComplete ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions Block */}
      <Card className="rounded-xl">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2">
            {/* 1. Clôturer inscriptions */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
              onClick={handleClotureInscriptions}
              disabled={isTerminee || campaign.progression_inscriptions_cloturees || actionLoading === "cloture"}
            >
              <Lock className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "cloture" ? "..." : "Clôturer inscriptions"}
              </span>
            </Button>

            {/* 2. Exporter anonymisé */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
              onClick={handleExport}
              disabled={isTerminee || !campaign.progression_inscriptions_cloturees || actionLoading === "export"}
            >
              <Download className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "export" ? "..." : "Exporter anonymisé"}
              </span>
            </Button>

            {/* 3. Importer offres */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
              onClick={handleImportClick}
              disabled={isTerminee || !campaign.progression_export_genere || actionLoading === "import"}
            >
              <Upload className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "import" ? "..." : "Importer offres"}
              </span>
            </Button>

            {/* 4. Envoyer par SMS */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
              onClick={handleSendOffers}
              disabled={isTerminee || !campaign.progression_offres_importees || actionLoading === "send"}
            >
              <Send className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "send" ? "..." : "Envoyer SMS"}
              </span>
            </Button>

            {/* 5. Exporter acceptations */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
              onClick={handleExportAcceptations}
              disabled={isTerminee || !campaign.progression_offres_envoyees || actionLoading === "export-accept"}
            >
              <FileDown className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "export-accept" ? "..." : "Export acceptations"}
              </span>
            </Button>

            {/* 6. Terminer */}
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleTerminer}
              disabled={isTerminee || actionLoading === "terminer"}
            >
              <Flag className="h-4 w-4" />
              <span className="text-center leading-tight">
                {actionLoading === "terminer" ? "..." : "Terminer"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
