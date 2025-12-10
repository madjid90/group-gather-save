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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground">Gestion des Clients</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{profiles.length} utilisateurs inscrits</p>
        </div>
        {duplicates.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs py-2"
            onClick={() => setIsDuplicateDialogOpen(true)}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {duplicates.length} doublon(s)
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="rounded-xl">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm font-semibold">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom, téléphone, ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-xs h-9">
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
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="nom">Nom</SelectItem>
                  <SelectItem value="ville">Ville</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {paginatedProfiles.map((profile) => (
          <Card key={profile.id} className="rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile.prenom} {profile.nom}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile.telephone || "-"}
                  </p>
                  {profile.ville && (
                    <p className="text-xs text-muted-foreground">
                      {profile.ville}{profile.code_postal && ` (${profile.code_postal})`}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={() => openProfileDialog(profile)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getStatusBadge(profile.statut)}
                {profile.housing_form_completed ? (
                  <Badge className="bg-green-500/10 text-green-600 text-[10px] px-1.5 py-0">Formulaire ✓</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Formulaire ⏳</Badge>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {profile.created_at
                    ? format(new Date(profile.created_at), "dd/MM/yy", { locale: fr })
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nom</TableHead>
                  <TableHead className="text-xs">Téléphone</TableHead>
                  <TableHead className="text-xs">Ville</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs">Formulaire</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium text-sm">
                      {profile.prenom} {profile.nom}
                    </TableCell>
                    <TableCell className="text-sm">{profile.telephone || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {profile.ville || "-"}
                      {profile.code_postal && ` (${profile.code_postal})`}
                    </TableCell>
                    <TableCell>{getStatusBadge(profile.statut)}</TableCell>
                    <TableCell>
                      {profile.housing_form_completed ? (
                        <Badge className="bg-green-500 text-white text-xs">Complété</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">En attente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 bg-card rounded-xl">
          <p className="text-xs text-muted-foreground">
            {currentPage}/{totalPages} ({filteredProfiles.length})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedProfile?.prenom} {selectedProfile?.nom}
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Téléphone</Label>
                  <p className="text-sm font-medium">{selectedProfile.telephone || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium truncate">{selectedProfile.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ville</Label>
                  <p className="text-sm font-medium">{selectedProfile.ville || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Code postal</Label>
                  <p className="text-sm font-medium">{selectedProfile.code_postal || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <div className="mt-0.5">{getStatusBadge(selectedProfile.statut)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Formulaire</Label>
                  <div className="mt-0.5">
                    {selectedProfile.housing_form_completed ? (
                      <Badge className="bg-green-500 text-white text-xs">Complété</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">En attente</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold mb-2">Contrat</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="text-sm font-medium">
                      {selectedProfile.contrats === "electricite"
                        ? "Énergie"
                        : selectedProfile.contrats === "internet"
                        ? "Internet"
                        : "Les deux"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Énergie actuel</Label>
                    <p className="text-sm font-medium">{selectedProfile.fournisseur_energie_actuel || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Internet actuel</Label>
                    <p className="text-sm font-medium">{selectedProfile.fournisseur_internet_actuel || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inscription</Label>
                    <p className="text-sm font-medium">
                      {selectedProfile.created_at
                        ? format(new Date(selectedProfile.created_at), "dd/MM/yy", { locale: fr })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold mb-2">Admin</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inclusion" className="text-sm">Inclusion campagne</Label>
                    <Switch
                      id="inclusion"
                      checked={editedInclusion}
                      onCheckedChange={setEditedInclusion}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Notes internes..."
                      rows={2}
                      className="text-sm mt-1"
                    />
                  </div>
                  <Button onClick={saveProfileChanges} size="sm" className="w-full">
                    <Save className="h-3 w-3 mr-1" />
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
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Doublons ({duplicates.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {duplicates.map((group, index) => (
              <Card key={index} className="rounded-xl">
                <CardHeader className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {group.telephone}
                    </CardTitle>
                    <Button
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => mergeDuplicates(group)}
                      disabled={merging}
                    >
                      <Merge className="h-3 w-3 mr-1" />
                      Fusionner
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-2">
                    {group.profiles.map((profile, pIndex) => (
                      <div
                        key={profile.id}
                        className={`p-2 rounded-lg ${
                          pIndex === 0 ? "bg-green-50 border border-green-200" : "bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {profile.prenom} {profile.nom}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {profile.email}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {profile.created_at
                              ? format(new Date(profile.created_at), "dd/MM/yy", { locale: fr })
                              : "-"}
                          </span>
                        </div>
                        {pIndex === 0 && (
                          <Badge className="mt-1 bg-green-500 text-white text-[10px] px-1.5 py-0">
                            À conserver
                          </Badge>
                        )}
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
