import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import { RefreshCw, UserCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface InactiveProfile {
  id: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  updated_at: string | null;
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
      const twelveMonthsAgo = subMonths(new Date(), 12).toISOString();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone, updated_at, housing_form_completed")
        .lt("updated_at", twelveMonthsAgo)
        .order("updated_at", { ascending: true });

      if (error) throw error;
      setInactiveProfiles(data || []);
    } catch (error) {
      console.error("Error fetching inactive profiles:", error);
      toast.error("Erreur lors du chargement");
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
    if (selectedIds.size === 0) return;
    if (!confirm(`Réactiver ${selectedIds.size} utilisateur(s) ?`)) return;

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
      toast.error("Erreur lors de la réactivation");
    } finally {
      setReactivating(false);
    }
  };

  const getInactivityDuration = (updatedAt: string | null) => {
    if (!updatedAt) return "?";
    const months = Math.floor(
      (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return `${months}m`;
  };

  const totalPages = Math.ceil(inactiveProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = inactiveProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Réactivation</h1>
          <p className="text-sm text-muted-foreground">
            {inactiveProfiles.length} inactifs (+12 mois)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInactiveProfiles} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={reactivateSelected} disabled={reactivating || selectedIds.size === 0}>
            <UserCheck className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Réactiver</span> {selectedIds.size}
          </Button>
        </div>
      </div>

      {inactiveProfiles.length === 0 ? (
        <Card className="rounded-xl border border-border">
          <CardContent className="py-10 text-center">
            <UserCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold text-foreground">Aucun utilisateur inactif</h3>
            <p className="text-sm text-muted-foreground">Tous actifs depuis moins de 12 mois</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === inactiveProfiles.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Téléphone</TableHead>
                    <TableHead className="text-xs">Inactif</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Formulaire</TableHead>
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
                      <TableCell className="font-medium text-sm text-foreground">
                        {profile.prenom} {profile.nom}
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{profile.telephone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                          {getInactivityDuration(profile.updated_at)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {profile.housing_form_completed ? (
                          <Badge className="bg-green-500 text-white text-xs">OK</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Non</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t">
                <p className="text-xs text-muted-foreground">Page {currentPage}/{totalPages}</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
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
