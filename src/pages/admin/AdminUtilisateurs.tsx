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
import { 
  Search, 
  Eye, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Merge,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DuplicateGroup {
  telephone: string;
  profiles: Profile[];
}

const ITEMS_PER_PAGE = 15;

export default function AdminUtilisateurs() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateGroup | null>(null);
  const [editedNotes, setEditedNotes] = useState("");
  const [editedInclusion, setEditedInclusion] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, search, filterStatus, sortBy]);

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
      detectDuplicates(data || []);
    }
    setLoading(false);
  };

  const detectDuplicates = (profileList: Profile[]) => {
    const phoneMap = new Map<string, Profile[]>();
    
    profileList.forEach((profile) => {
      if (profile.telephone) {
        const phone = profile.telephone.replace(/\s/g, "");
        const existing = phoneMap.get(phone) || [];
        existing.push(profile);
        phoneMap.set(phone, existing);
      }
    });

    const duplicateGroups: DuplicateGroup[] = [];
    phoneMap.forEach((profiles, telephone) => {
      if (profiles.length > 1) {
        duplicateGroups.push({ telephone, profiles });
      }
    });

    setDuplicates(duplicateGroups);
  };

  const applyFilters = () => {
    let result = [...profiles];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom?.toLowerCase().includes(searchLower) ||
          p.prenom?.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower) ||
          p.telephone?.includes(searchLower) ||
          p.ville?.toLowerCase().includes(searchLower)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((p) => p.statut === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "nom":
          return (a.nom || "").localeCompare(b.nom || "");
        case "ville":
          return (a.ville || "").localeCompare(b.ville || "");
        default:
          return 0;
      }
    });

    setFilteredProfiles(result);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "inscrit":
        return <Badge variant="secondary">Inscrit</Badge>;
      case "offre_envoyee":
        return <Badge className="bg-blue-500 text-white">Offre envoyée</Badge>;
      case "clic":
        return <Badge className="bg-yellow-500 text-white">Clic</Badge>;
      case "souscription":
        return <Badge className="bg-green-500 text-white">Souscription</Badge>;
      default:
        return <Badge variant="outline">Inscrit</Badge>;
    }
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

  const mergeDuplicates = async (group: DuplicateGroup) => {
    if (!confirm(`Fusionner ${group.profiles.length} profils en un seul ?`)) return;

    setMerging(true);
    try {
      // Sort by created_at to keep the oldest one
      const sorted = [...group.profiles].sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
      
      const keepProfile = sorted[0];
      const deleteProfiles = sorted.slice(1);

      // Check if any profile has housing form completed
      const hasHousingForm = group.profiles.some((p) => p.housing_form_completed);

      // Update the kept profile with best data
      const updates: Partial<Profile> = {
        housing_form_completed: hasHousingForm,
      };

      // Take non-null values from other profiles
      for (const profile of deleteProfiles) {
        if (!keepProfile.ville && profile.ville) updates.ville = profile.ville;
        if (!keepProfile.code_postal && profile.code_postal) updates.code_postal = profile.code_postal;
        if (!keepProfile.fournisseur_energie_actuel && profile.fournisseur_energie_actuel) {
          updates.fournisseur_energie_actuel = profile.fournisseur_energie_actuel;
        }
        if (!keepProfile.fournisseur_internet_actuel && profile.fournisseur_internet_actuel) {
          updates.fournisseur_internet_actuel = profile.fournisseur_internet_actuel;
        }
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", keepProfile.id);
      }

      // Transfer housing profiles to kept profile
      for (const profile of deleteProfiles) {
        await supabase
          .from("housing_profiles")
          .update({ user_id: keepProfile.id })
          .eq("user_id", profile.id);

        // Transfer user offers
        await supabase
          .from("user_offers")
          .update({ user_id: keepProfile.id })
          .eq("user_id", profile.id);

        // Delete duplicate profile
        await supabase.from("profiles").delete().eq("id", profile.id);
      }

      toast.success(`${deleteProfiles.length} doublon(s) fusionné(s)`);
      setIsDuplicateDialogOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error("Error merging duplicates:", error);
      toast.error("Erreur lors de la fusion");
    } finally {
      setMerging(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Clients</h1>
          <p className="text-muted-foreground">{profiles.length} utilisateurs inscrits</p>
        </div>
        {duplicates.length > 0 && (
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => setIsDuplicateDialogOpen(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {duplicates.length} doublon(s) détecté(s)
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone, ville..."
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
                <SelectItem value="inscrit">Inscrit</SelectItem>
                <SelectItem value="offre_envoyee">Offre envoyée</SelectItem>
                <SelectItem value="clic">Clic</SelectItem>
                <SelectItem value="souscription">Souscription</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date d'inscription</SelectItem>
                <SelectItem value="nom">Nom</SelectItem>
                <SelectItem value="ville">Ville</SelectItem>
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
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Formulaire</TableHead>
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
                    <TableCell>{profile.telephone || "-"}</TableCell>
                    <TableCell>
                      {profile.ville || "-"}
                      {profile.code_postal && ` (${profile.code_postal})`}
                    </TableCell>
                    <TableCell>{getStatusBadge(profile.statut)}</TableCell>
                    <TableCell>
                      {profile.housing_form_completed ? (
                        <Badge className="bg-green-500 text-white">Complété</Badge>
                      ) : (
                        <Badge variant="secondary">En attente</Badge>
                      )}
                    </TableCell>
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
              Fiche Client - {selectedProfile?.prenom} {selectedProfile?.nom}
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
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
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedProfile.statut)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Formulaire logement</Label>
                  <div className="mt-1">
                    {selectedProfile.housing_form_completed ? (
                      <Badge className="bg-green-500 text-white">Complété</Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Contrat souhaité</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium">
                      {selectedProfile.contrats === "electricite"
                        ? "Énergie"
                        : selectedProfile.contrats === "internet"
                        ? "Internet"
                        : "Les deux"}
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
                    <Label className="text-muted-foreground">Date d'inscription</Label>
                    <p className="font-medium">
                      {selectedProfile.created_at
                        ? format(new Date(selectedProfile.created_at), "dd MMMM yyyy", { locale: fr })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

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
                    <Label htmlFor="notes">Notes admin</Label>
                    <Textarea
                      id="notes"
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Notes internes..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={saveProfileChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Duplicates Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Doublons détectés ({duplicates.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {duplicates.map((group, index) => (
              <Card key={index}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Téléphone : {group.telephone}
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => mergeDuplicates(group)}
                      disabled={merging}
                    >
                      <Merge className="h-4 w-4 mr-2" />
                      Fusionner
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {group.profiles.map((profile, pIndex) => (
                      <div
                        key={profile.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          pIndex === 0 ? "bg-green-50 border border-green-200" : "bg-muted"
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {profile.prenom} {profile.nom}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {profile.email}
                          </span>
                          {pIndex === 0 && (
                            <Badge className="ml-2 bg-green-500 text-white">
                              À conserver (plus ancien)
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.created_at
                            ? format(new Date(profile.created_at), "dd/MM/yyyy", { locale: fr })
                            : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
