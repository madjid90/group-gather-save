import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, Target, Save, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

interface CampaignSettings {
  id: string;
  statut: CampaignStatus;
  objectif: number;
  date_debut: string | null;
  date_fin: string | null;
  message_officiel: string | null;
  prochaine_etape: string | null;
  description_publique: string | null;
}

interface TimelineStep {
  id: string;
  etape_numero: number;
  titre: string;
  description: string | null;
  date_prevue: string | null;
  completee: boolean;
}

const statusOptions: { value: CampaignStatus; label: string; color: string }[] = [
  { value: "ouverte", label: "Ouverte", color: "bg-green-500" },
  { value: "fermee", label: "Fermée", color: "bg-red-500" },
  { value: "en_negociation", label: "En négociation", color: "bg-yellow-500" },
  { value: "offre_prete", label: "Offre prête", color: "bg-blue-500" },
  { value: "archivee", label: "Archivée", color: "bg-gray-500" },
];

export default function AdminCampagne() {
  const [campaign, setCampaign] = useState<CampaignSettings | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch campaign settings
      const { data: campaignData } = await supabase
        .from("campaign_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (campaignData) {
        setCampaign(campaignData);
      }

      // Fetch timeline
      const { data: timelineData } = await supabase
        .from("campaign_timeline")
        .select("*")
        .order("etape_numero", { ascending: true });

      if (timelineData) {
        setTimeline(timelineData);
      }

      // Fetch participants count
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setParticipantsCount(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = (field: keyof CampaignSettings, value: unknown) => {
    if (campaign) {
      setCampaign({ ...campaign, [field]: value });
    }
  };

  const saveCampaign = async () => {
    if (!campaign) return;
    setSaving(true);

    const { error } = await supabase
      .from("campaign_settings")
      .update({
        statut: campaign.statut,
        objectif: campaign.objectif,
        date_debut: campaign.date_debut,
        date_fin: campaign.date_fin,
        message_officiel: campaign.message_officiel,
        prochaine_etape: campaign.prochaine_etape,
        description_publique: campaign.description_publique,
      })
      .eq("id", campaign.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Campagne mise à jour");
    }
    setSaving(false);
  };

  const updateTimelineStep = async (step: TimelineStep) => {
    const { error } = await supabase
      .from("campaign_timeline")
      .update({
        titre: step.titre,
        description: step.description,
        date_prevue: step.date_prevue,
        completee: step.completee,
      })
      .eq("id", step.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour de l'étape");
    } else {
      toast.success("Étape mise à jour");
    }
  };

  const handleTimelineChange = (
    index: number,
    field: keyof TimelineStep,
    value: unknown
  ) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStatus = statusOptions.find((s) => s.value === campaign?.statut);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion de la Campagne</h1>
        <p className="text-muted-foreground">Configurez les paramètres de la campagne en cours</p>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Statut</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={`${currentStatus?.color} text-white`}>
              {currentStatus?.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Objectif</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign?.objectif || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progression</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign?.objectif
                ? Math.round((participantsCount / campaign.objectif) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de la campagne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Statut de la campagne</Label>
              <Select
                value={campaign?.statut || "ouverte"}
                onValueChange={(value) => updateCampaign("statut", value as CampaignStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objectif (nombre de participants)</Label>
              <Input
                type="number"
                value={campaign?.objectif || 0}
                onChange={(e) => updateCampaign("objectif", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="datetime-local"
                value={campaign?.date_debut ? campaign.date_debut.slice(0, 16) : ""}
                onChange={(e) => updateCampaign("date_debut", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="datetime-local"
                value={campaign?.date_fin ? campaign.date_fin.slice(0, 16) : ""}
                onChange={(e) => updateCampaign("date_fin", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prochaine étape</Label>
            <Input
              value={campaign?.prochaine_etape || ""}
              onChange={(e) => updateCampaign("prochaine_etape", e.target.value)}
              placeholder="Décrivez la prochaine étape..."
            />
          </div>

          <div className="space-y-2">
            <Label>Description publique du statut</Label>
            <Textarea
              value={campaign?.description_publique || ""}
              onChange={(e) => updateCampaign("description_publique", e.target.value)}
              placeholder="Cette description sera visible par tous les utilisateurs..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Message officiel</Label>
            <Textarea
              value={campaign?.message_officiel || ""}
              onChange={(e) => updateCampaign("message_officiel", e.target.value)}
              placeholder="Message envoyé à tous les inscrits..."
              rows={4}
            />
          </div>

          <Button onClick={saveCampaign} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de la campagne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeline.map((step, index) => (
              <div
                key={step.id}
                className={`relative pl-8 pb-6 ${
                  index < timeline.length - 1 ? "border-l-2 border-border" : ""
                }`}
              >
                <div
                  className={`absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full ${
                    step.completee ? "bg-green-500" : "bg-muted border-2 border-primary"
                  }`}
                />

                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Étape {step.etape_numero}</Badge>
                      <Input
                        value={step.titre}
                        onChange={(e) =>
                          handleTimelineChange(index, "titre", e.target.value)
                        }
                        className="font-medium w-64"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`complete-${step.id}`} className="text-sm">
                          Complétée
                        </Label>
                        <Switch
                          id={`complete-${step.id}`}
                          checked={step.completee}
                          onCheckedChange={(checked) =>
                            handleTimelineChange(index, "completee", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <Textarea
                        value={step.description || ""}
                        onChange={(e) =>
                          handleTimelineChange(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Date prévue</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          value={step.date_prevue ? step.date_prevue.slice(0, 16) : ""}
                          onChange={(e) =>
                            handleTimelineChange(
                              index,
                              "date_prevue",
                              e.target.value ? new Date(e.target.value).toISOString() : null
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTimelineStep(step)}
                  >
                    <Save className="h-3 w-3 mr-2" />
                    Sauvegarder cette étape
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
