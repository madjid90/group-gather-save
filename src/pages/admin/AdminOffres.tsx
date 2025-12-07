import { useEffect, useState, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Upload, ExternalLink, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OfferType = Database["public"]["Enums"]["offer_type"];
type OfferTarget = Database["public"]["Enums"]["offer_target"];

interface Offer {
  id: string;
  fournisseur: string;
  type: OfferType;
  prix_negocie: number | null;
  avantage_client: string | null;
  conditions: string | null;
  date_validite: string | null;
  lien_affilie: string | null;
  fichier_url: string | null;
  groupe_cible: OfferTarget;
  publie: boolean;
  actif: boolean;
  created_at: string;
}

const emptyOffer: Omit<Offer, "id" | "created_at"> = {
  fournisseur: "",
  type: "electricite",
  prix_negocie: null,
  avantage_client: "",
  conditions: "",
  date_validite: null,
  lien_affilie: "",
  fichier_url: null,
  groupe_cible: "tous",
  publie: false,
  actif: true,
};

export default function AdminOffres() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("offres")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des offres");
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  };

  const openNewOfferDialog = () => {
    setEditingOffer({ ...emptyOffer });
    setIsDialogOpen(true);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer({ ...offer });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("offer-files")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload du fichier");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("offer-files")
      .getPublicUrl(fileName);

    setEditingOffer((prev) => ({
      ...prev,
      fichier_url: urlData.publicUrl,
    }));
    setUploading(false);
    toast.success("Fichier uploadé");
  };

  const saveOffer = async () => {
    if (!editingOffer?.fournisseur || !editingOffer.type) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const offerData = {
      fournisseur: editingOffer.fournisseur,
      type: editingOffer.type,
      prix_negocie: editingOffer.prix_negocie,
      avantage_client: editingOffer.avantage_client,
      conditions: editingOffer.conditions,
      date_validite: editingOffer.date_validite,
      lien_affilie: editingOffer.lien_affilie,
      fichier_url: editingOffer.fichier_url,
      groupe_cible: editingOffer.groupe_cible || "tous",
      publie: editingOffer.publie ?? false,
      actif: editingOffer.actif ?? true,
    };

    if (editingOffer.id) {
      const { error } = await supabase
        .from("offres")
        .update(offerData)
        .eq("id", editingOffer.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
      } else {
        toast.success("Offre mise à jour");
        fetchOffers();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("offres").insert([offerData]);

      if (error) {
        toast.error("Erreur lors de la création");
      } else {
        toast.success("Offre créée");
        fetchOffers();
        setIsDialogOpen(false);
      }
    }
  };

  const togglePublish = async (offer: Offer) => {
    const { error } = await supabase
      .from("offres")
      .update({ publie: !offer.publie })
      .eq("id", offer.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(offer.publie ? "Offre dépubliée" : "Offre publiée");
      fetchOffers();
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

    const { error } = await supabase.from("offres").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Offre supprimée");
      fetchOffers();
    }
  };

  const getTypeLabel = (type: OfferType) => {
    switch (type) {
      case "electricite":
        return "Électricité";
      case "combo":
        return "Électricité + Gaz";
      case "internet":
        return "Internet";
      default:
        return type;
    }
  };

  const getTargetLabel = (target: OfferTarget) => {
    switch (target) {
      case "energie":
        return "Énergie";
      case "internet":
        return "Internet";
      case "tous":
        return "Tous";
      default:
        return target;
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
          <h1 className="text-2xl font-bold text-foreground">Gestion des Offres</h1>
          <p className="text-muted-foreground">{offers.length} offres négociées</p>
        </div>
        <Button onClick={openNewOfferDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      {/* Offers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix négocié</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.fournisseur}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(offer.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {offer.prix_negocie ? `${offer.prix_negocie}€` : "-"}
                  </TableCell>
                  <TableCell>{getTargetLabel(offer.groupe_cible)}</TableCell>
                  <TableCell>
                    {offer.date_validite
                      ? format(new Date(offer.date_validite), "dd MMM yyyy", { locale: fr })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        offer.publie
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      }
                    >
                      {offer.publie ? "Publiée" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(offer)}
                        title={offer.publie ? "Dépublier" : "Publier"}
                      >
                        {offer.publie ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(offer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteOffer(offer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune offre créée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer?.id ? "Modifier l'offre" : "Nouvelle offre"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Input
                  value={editingOffer?.fournisseur || ""}
                  onChange={(e) =>
                    setEditingOffer((prev) => ({ ...prev, fournisseur: e.target.value }))
                  }
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'offre *</Label>
                <Select
                  value={editingOffer?.type || "electricite"}
                  onValueChange={(value) =>
                    setEditingOffer((prev) => ({ ...prev, type: value as OfferType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricite">Électricité</SelectItem>
                    <SelectItem value="combo">Électricité + Gaz</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prix négocié (€/mois)</Label>
                <Input
                  type="number"
                  value={editingOffer?.prix_negocie || ""}
                  onChange={(e) =>
                    setEditingOffer((prev) => ({
                      ...prev,
                      prix_negocie: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Ex: 29.99"
                />
              </div>

              <div className="space-y-2">
                <Label>Groupe cible</Label>
                <Select
                  value={editingOffer?.groupe_cible || "tous"}
                  onValueChange={(value) =>
                    setEditingOffer((prev) => ({
                      ...prev,
                      groupe_cible: value as OfferTarget,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les utilisateurs</SelectItem>
                    <SelectItem value="energie">Énergie uniquement</SelectItem>
                    <SelectItem value="internet">Internet uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date de validité</Label>
                <Input
                  type="date"
                  value={
                    editingOffer?.date_validite
                      ? editingOffer.date_validite.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingOffer((prev) => ({
                      ...prev,
                      date_validite: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Lien de souscription</Label>
                <Input
                  value={editingOffer?.lien_affilie || ""}
                  onChange={(e) =>
                    setEditingOffer((prev) => ({ ...prev, lien_affilie: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avantage client</Label>
              <Textarea
                value={editingOffer?.avantage_client || ""}
                onChange={(e) =>
                  setEditingOffer((prev) => ({ ...prev, avantage_client: e.target.value }))
                }
                placeholder="Décrivez l'avantage pour le client..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Conditions</Label>
              <Textarea
                value={editingOffer?.conditions || ""}
                onChange={(e) =>
                  setEditingOffer((prev) => ({ ...prev, conditions: e.target.value }))
                }
                placeholder="Conditions de l'offre..."
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Document (PDF/Image)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Upload..." : "Choisir un fichier"}
                </Button>
                {editingOffer?.fichier_url && (
                  <a
                    href={editingOffer.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Voir le fichier
                  </a>
                )}
              </div>
            </div>

            {/* Publish Switch */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label>Publier l'offre</Label>
                <p className="text-sm text-muted-foreground">
                  Les offres publiées sont visibles par les utilisateurs
                </p>
              </div>
              <Switch
                checked={editingOffer?.publie ?? false}
                onCheckedChange={(checked) =>
                  setEditingOffer((prev) => ({ ...prev, publie: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={saveOffer}>
                {editingOffer?.id ? "Mettre à jour" : "Créer l'offre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
