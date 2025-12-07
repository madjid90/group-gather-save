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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Eye, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const ITEMS_PER_PAGE = 10;

export default function AdminUtilisateurs() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterContrat, setFilterContrat] = useState<string>("all");
  const [filterCompteur, setFilterCompteur] = useState<string>("all");
  const [filterConnexion, setFilterConnexion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [editedInclusion, setEditedInclusion] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, search, filterContrat, filterCompteur, filterConnexion, sortBy]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...profiles];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom?.toLowerCase().includes(searchLower) ||
          p.prenom?.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower) ||
          p.ville?.toLowerCase().includes(searchLower) ||
          p.fournisseur_energie_actuel?.toLowerCase().includes(searchLower) ||
          p.fournisseur_internet_actuel?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by contract type
    if (filterContrat !== "all") {
      result = result.filter((p) => p.contrats === filterContrat);
    }

    // Filter by compteur type
    if (filterCompteur !== "all") {
      result = result.filter((p) => p.type_compteur === filterCompteur);
    }

    // Filter by connexion type
    if (filterConnexion !== "all") {
      result = result.filter((p) => p.type_connexion_internet === filterConnexion);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "ville":
          return (a.ville || "").localeCompare(b.ville || "");
        case "fournisseur_energie":
          return (a.fournisseur_energie_actuel || "").localeCompare(b.fournisseur_energie_actuel || "");
        case "fournisseur_internet":
          return (a.fournisseur_internet_actuel || "").localeCompare(b.fournisseur_internet_actuel || "");
        default:
          return 0;
      }
    });

    setFilteredProfiles(result);
    setCurrentPage(1);
  };

  const openProfileDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditedNotes(profile.notes_admin || "");
    setEditedInclusion(profile.inclusion_campagne ?? true);
    setIsDialogOpen(true);
  };

  const saveProfileChanges = async () => {
    if (!selectedProfile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        notes_admin: editedNotes,
        inclusion_campagne: editedInclusion,
      })
      .eq("id", selectedProfile.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Modifications enregistrées");
      fetchProfiles();
      setIsDialogOpen(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Utilisateur supprimé");
      fetchProfiles();
      setIsDialogOpen(false);
    }
  };

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">{profiles.length} utilisateurs inscrits</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, ville, fournisseur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterContrat} onValueChange={setFilterContrat}>
              <SelectTrigger>
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les contrats</SelectItem>
                <SelectItem value="energie">Énergie seule</SelectItem>
                <SelectItem value="internet">Internet seul</SelectItem>
                <SelectItem value="les_deux">Les deux</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCompteur} onValueChange={setFilterCompteur}>
              <SelectTrigger>
                <SelectValue placeholder="Type compteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous compteurs</SelectItem>
                <SelectItem value="linky">Linky</SelectItem>
                <SelectItem value="ancien">Ancien</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date d'inscription</SelectItem>
                <SelectItem value="ville">Ville</SelectItem>
                <SelectItem value="fournisseur_energie">Fournisseur énergie</SelectItem>
                <SelectItem value="fournisseur_internet">Fournisseur internet</SelectItem>
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
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Contrat</TableHead>
                  <TableHead>Fournisseur Énergie</TableHead>
                  <TableHead>Fournisseur Internet</TableHead>
                  <TableHead>Date inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.prenom} {profile.nom}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.telephone}</TableCell>
                    <TableCell>
                      {profile.ville} {profile.code_postal && `(${profile.code_postal})`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {profile.contrats === "electricite"
                          ? "Énergie"
                          : profile.contrats === "internet"
                          ? "Internet"
                          : "Les deux"}
                      </Badge>
                    </TableCell>
                    <TableCell>{profile.fournisseur_energie_actuel || "-"}</TableCell>
                    <TableCell>{profile.fournisseur_internet_actuel || "-"}</TableCell>
                    <TableCell>
                      {profile.created_at
                        ? format(new Date(profile.created_at), "dd MMM yyyy", { locale: fr })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openProfileDialog(profile)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({filteredProfiles.length} résultats)
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

      {/* Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Fiche Utilisateur - {selectedProfile?.prenom} {selectedProfile?.nom}
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prénom</Label>
                  <p className="font-medium">{selectedProfile.prenom}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nom</Label>
                  <p className="font-medium">{selectedProfile.nom}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedProfile.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p className="font-medium">{selectedProfile.telephone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ville</Label>
                  <p className="font-medium">{selectedProfile.ville || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Code postal</Label>
                  <p className="font-medium">{selectedProfile.code_postal || "-"}</p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informations Contrat</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type de contrat souhaité</Label>
                    <p className="font-medium">
                      {selectedProfile.contrats === "electricite"
                        ? "Énergie uniquement"
                        : selectedProfile.contrats === "internet"
                        ? "Internet uniquement"
                        : "Énergie et Internet"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fournisseur énergie actuel</Label>
                    <p className="font-medium">{selectedProfile.fournisseur_energie_actuel || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fournisseur internet actuel</Label>
                    <p className="font-medium">{selectedProfile.fournisseur_internet_actuel || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type de compteur</Label>
                    <p className="font-medium">
                      {selectedProfile.type_compteur === "linky"
                        ? "Linky"
                        : selectedProfile.type_compteur === "ancien"
                        ? "Ancien"
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type de connexion</Label>
                    <p className="font-medium">
                      {selectedProfile.type_connexion_internet === "fibre"
                        ? "Fibre"
                        : selectedProfile.type_connexion_internet === "adsl"
                        ? "ADSL"
                        : selectedProfile.type_connexion_internet === "4g_box"
                        ? "4G Box"
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Prix internet actuel</Label>
                    <p className="font-medium">
                      {selectedProfile.prix_actuel_internet
                        ? `${selectedProfile.prix_actuel_internet}€/mois`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Puissance compteur</Label>
                    <p className="font-medium">{selectedProfile.puissance_compteur || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date d'inscription</Label>
                    <p className="font-medium">
                      {selectedProfile.created_at
                        ? format(new Date(selectedProfile.created_at), "dd MMMM yyyy à HH:mm", {
                            locale: fr,
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Section Admin</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inclusion">Inclusion campagne</Label>
                    <Switch
                      id="inclusion"
                      checked={editedInclusion}
                      onCheckedChange={setEditedInclusion}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes internes</Label>
                    <Textarea
                      id="notes"
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Ajoutez des notes sur cet utilisateur..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => deleteProfile(selectedProfile.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button onClick={saveProfileChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
