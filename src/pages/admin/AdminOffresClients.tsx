import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Send, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface UserOffer {
  id: string;
  user_id: string;
  client_id: string | null;
  offre_nom: string | null;
  fournisseur_nom: string | null;
  prix_kwh: number | null;
  abonnement_mensuel: number | null;
  economie_estimee_mensuelle: number | null;
  economie_estimee_annuelle: number | null;
  commentaire_fournisseur: string | null;
  statut: string | null;
  created_at: string | null;
  profile?: {
    prenom: string;
    nom: string;
    telephone: string | null;
  };
}

const ITEMS_PER_PAGE = 15;

export default function AdminOffresClients() {
  const [offers, setOffers] = useState<UserOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<UserOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOffer, setSelectedOffer] = useState<UserOffer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [offers, search, filterStatus]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each offer
      const offersWithProfiles: UserOffer[] = [];
      for (const offer of data || []) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("prenom, nom, telephone")
          .eq("id", offer.user_id)
          .maybeSingle();

        offersWithProfiles.push({
          ...offer,
          profile: profileData || undefined,
        });
      }

      setOffers(offersWithProfiles);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...offers];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.client_id?.toLowerCase().includes(searchLower) ||
          o.offre_nom?.toLowerCase().includes(searchLower) ||
          o.fournisseur_nom?.toLowerCase().includes(searchLower) ||
          o.profile?.prenom?.toLowerCase().includes(searchLower) ||
          o.profile?.nom?.toLowerCase().includes(searchLower)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((o) => o.statut === filterStatus);
    }

    setFilteredOffers(result);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "envoyee":
        return <Badge className="bg-blue-500 text-white">Envoyée</Badge>;
      case "acceptee":
        return <Badge className="bg-green-500 text-white">Acceptée</Badge>;
      case "refusee":
        return <Badge className="bg-red-500 text-white">Refusée</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  const sendOfferSMS = async (offer: UserOffer) => {
    if (!offer.profile?.telephone) {
      toast.error("Pas de numéro de téléphone pour cet utilisateur");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-offer-sms", {
        body: {
          phone: offer.profile.telephone,
          offre_nom: offer.offre_nom,
          economie_mensuelle: offer.economie_estimee_mensuelle,
          user_id: offer.user_id,
        },
      });

      if (error) throw error;

      // Update offer status
      await supabase
        .from("user_offers")
        .update({ statut: "envoyee" })
        .eq("id", offer.id);

      // Update profile status
      await supabase
        .from("profiles")
        .update({ statut: "offre_envoyee" })
        .eq("id", offer.user_id);

      toast.success("SMS envoyé avec succès");
      fetchOffers();
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Erreur lors de l'envoi du SMS");
    } finally {
      setSending(false);
    }
  };

  const sendAllOffersSMS = async () => {
    const draftOffers = offers.filter(
      (o) => o.statut === "draft" && o.profile?.telephone
    );

    if (draftOffers.length === 0) {
      toast.error("Aucune offre en brouillon avec numéro de téléphone");
      return;
    }

    if (!confirm(`Envoyer ${draftOffers.length} SMS ?`)) return;

    setSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const offer of draftOffers) {
      try {
        await supabase.functions.invoke("send-offer-sms", {
          body: {
            phone: offer.profile?.telephone,
            offre_nom: offer.offre_nom,
            economie_mensuelle: offer.economie_estimee_mensuelle,
            user_id: offer.user_id,
          },
        });

        await supabase
          .from("user_offers")
          .update({ statut: "envoyee" })
          .eq("id", offer.id);

        await supabase
          .from("profiles")
          .update({ statut: "offre_envoyee" })
          .eq("id", offer.user_id);

        successCount++;
      } catch {
        errorCount++;
      }
    }

    toast.success(`${successCount} SMS envoyés, ${errorCount} erreurs`);
    fetchOffers();
    setSending(false);
  };

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const draftCount = offers.filter((o) => o.statut === "draft").length;

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
          <h1 className="text-2xl font-bold text-foreground">Offres Clients</h1>
          <p className="text-muted-foreground">
            {offers.length} offres importées • {draftCount} en attente d'envoi
          </p>
        </div>
        <Button
          onClick={sendAllOffersSMS}
          disabled={sending || draftCount === 0}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {sending ? "Envoi en cours..." : `Envoyer ${draftCount} offres par SMS`}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, offre, fournisseur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="envoyee">Envoyée</SelectItem>
                <SelectItem value="acceptee">Acceptée</SelectItem>
                <SelectItem value="refusee">Refusée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Économie/mois</TableHead>
                  <TableHead>Économie/an</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-mono text-sm">
                      {offer.client_id || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {offer.profile
                        ? `${offer.profile.prenom} ${offer.profile.nom}`
                        : "-"}
                    </TableCell>
                    <TableCell>{offer.offre_nom || "-"}</TableCell>
                    <TableCell>{offer.fournisseur_nom || "-"}</TableCell>
                    <TableCell>
                      {offer.economie_estimee_mensuelle
                        ? `${offer.economie_estimee_mensuelle}€`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {offer.economie_estimee_annuelle
                        ? `${offer.economie_estimee_annuelle}€`
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(offer.statut)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {offer.statut === "draft" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendOfferSMS(offer)}
                            disabled={sending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail de l'offre</DialogTitle>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client ID</Label>
                  <p className="font-mono">{selectedOffer.client_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="font-medium">
                    {selectedOffer.profile
                      ? `${selectedOffer.profile.prenom} ${selectedOffer.profile.nom}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Offre</Label>
                  <p className="font-medium">{selectedOffer.offre_nom || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fournisseur</Label>
                  <p className="font-medium">{selectedOffer.fournisseur_nom || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prix kWh</Label>
                  <p className="font-medium">
                    {selectedOffer.prix_kwh ? `${selectedOffer.prix_kwh}€` : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Abonnement</Label>
                  <p className="font-medium">
                    {selectedOffer.abonnement_mensuel
                      ? `${selectedOffer.abonnement_mensuel}€/mois`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Économie mensuelle</Label>
                  <p className="font-medium text-green-600">
                    {selectedOffer.economie_estimee_mensuelle
                      ? `${selectedOffer.economie_estimee_mensuelle}€`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Économie annuelle</Label>
                  <p className="font-medium text-green-600">
                    {selectedOffer.economie_estimee_annuelle
                      ? `${selectedOffer.economie_estimee_annuelle}€`
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedOffer.commentaire_fournisseur && (
                <div>
                  <Label className="text-muted-foreground">Commentaire fournisseur</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedOffer.commentaire_fournisseur}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>{getStatusBadge(selectedOffer.statut)}</div>
                {selectedOffer.statut === "draft" && (
                  <Button
                    onClick={() => {
                      sendOfferSMS(selectedOffer);
                      setIsDialogOpen(false);
                    }}
                    disabled={sending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer par SMS
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
