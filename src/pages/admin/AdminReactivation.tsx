import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface InactiveProfile {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  ville: string | null;
  created_at: string | null;
  updated_at: string | null;
  statut: string | null;
  housing_form_completed: boolean | null;
}

const ITEMS_PER_PAGE = 15;

export default function AdminReactivation() {
  const [inactiveProfiles, setInactiveProfiles] = useState<InactiveProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactivating, setReactivating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInactiveProfiles();
  }, []);

  const fetchInactiveProfiles = async () => {
    try {
      // Get profiles inactive for more than 12 months
      const twelveMonthsAgo = subMonths(new Date(), 12).toISOString();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, ville, created_at, updated_at, statut, housing_form_completed")
        .lt("updated_at", twelveMonthsAgo)
        .order("updated_at", { ascending: true });

      if (error) throw error;

      setInactiveProfiles(data || []);
    } catch (error) {
      console.error("Error fetching inactive profiles:", error);
      toast.error("Erreur lors du chargement des utilisateurs inactifs");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === inactiveProfiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inactiveProfiles.map((p) => p.id)));
    }
  };

  const reactivateSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error("Sélectionnez au moins un utilisateur");
      return;
    }

    if (!confirm(`Réactiver ${selectedIds.size} utilisateur(s) pour la prochaine campagne ?`)) {
      return;
    }

    setReactivating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          statut: "inscrit",
          inclusion_campagne: true,
          updated_at: new Date().toISOString(),
        })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      toast.success(`${selectedIds.size} utilisateur(s) réactivé(s)`);
      setSelectedIds(new Set());
      fetchInactiveProfiles();
    } catch (error) {
      console.error("Error reactivating profiles:", error);
      toast.error("Erreur lors de la réactivation");
    } finally {
      setReactivating(false);
    }
  };

  const reactivateSingle = async (id: string) => {
    setReactivating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          statut: "inscrit",
          inclusion_campagne: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Utilisateur réactivé");
      fetchInactiveProfiles();
    } catch (error) {
      console.error("Error reactivating profile:", error);
      toast.error("Erreur lors de la réactivation");
    } finally {
      setReactivating(false);
    }
  };

  const getInactivityDuration = (updatedAt: string | null) => {
    if (!updatedAt) return "Inconnu";
    const months = Math.floor(
      (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return `${months} mois`;
  };

  const totalPages = Math.ceil(inactiveProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = inactiveProfiles.slice(
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
          <h1 className="text-2xl font-bold text-foreground">Réactivation</h1>
          <p className="text-muted-foreground">
            {inactiveProfiles.length} utilisateur(s) inactif(s) depuis plus de 12 mois
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchInactiveProfiles}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={reactivateSelected}
            disabled={reactivating || selectedIds.size === 0}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {reactivating
              ? "Réactivation..."
              : `Réactiver ${selectedIds.size} sélectionné(s)`}
          </Button>
        </div>
      </div>

      {inactiveProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun utilisateur inactif</h3>
            <p className="text-muted-foreground">
              Tous les utilisateurs sont actifs depuis moins de 12 mois
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs inactifs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === inactiveProfiles.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead>Inactif depuis</TableHead>
                    <TableHead>Formulaire</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(profile.id)}
                          onCheckedChange={() => toggleSelect(profile.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {profile.prenom} {profile.nom}
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.telephone || "-"}</TableCell>
                      <TableCell>{profile.ville || "-"}</TableCell>
                      <TableCell>
                        {profile.updated_at
                          ? format(new Date(profile.updated_at), "dd MMM yyyy", {
                              locale: fr,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          {getInactivityDuration(profile.updated_at)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.housing_form_completed ? (
                          <Badge className="bg-green-500 text-white">Complété</Badge>
                        ) : (
                          <Badge variant="secondary">Non complété</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reactivateSingle(profile.id)}
                          disabled={reactivating}
                        >
                          Réactiver
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
      )}
    </div>
  );
}
