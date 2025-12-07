import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function AdminExport() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterContrat, setFilterContrat] = useState<string>("all");
  const [filterFournisseurEnergie, setFilterFournisseurEnergie] = useState<string>("all");
  const [filterFournisseurInternet, setFilterFournisseurInternet] = useState<string>("all");
  const [filterCodePostal, setFilterCodePostal] = useState("");

  // Unique values for filters
  const [fournisseursEnergie, setFournisseursEnergie] = useState<string[]>([]);
  const [fournisseursInternet, setFournisseursInternet] = useState<string[]>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des données");
    } else {
      setProfiles(data || []);

      // Extract unique providers
      const uniqueEnergie = [
        ...new Set(
          data?.map((p) => p.fournisseur_energie_actuel).filter(Boolean) || []
        ),
      ];
      const uniqueInternet = [
        ...new Set(
          data?.map((p) => p.fournisseur_internet_actuel).filter(Boolean) || []
        ),
      ];

      setFournisseursEnergie(uniqueEnergie as string[]);
      setFournisseursInternet(uniqueInternet as string[]);
    }
    setLoading(false);
  };

  const getFilteredProfiles = () => {
    let result = [...profiles];

    // Date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(
        (p) => p.created_at && new Date(p.created_at) >= fromDate
      );
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(
        (p) => p.created_at && new Date(p.created_at) <= toDate
      );
    }

    // Contract type filter
    if (filterContrat !== "all") {
      result = result.filter((p) => p.contrats === filterContrat);
    }

    // Provider filters
    if (filterFournisseurEnergie !== "all") {
      result = result.filter(
        (p) => p.fournisseur_energie_actuel === filterFournisseurEnergie
      );
    }
    if (filterFournisseurInternet !== "all") {
      result = result.filter(
        (p) => p.fournisseur_internet_actuel === filterFournisseurInternet
      );
    }

    // Postal code filter
    if (filterCodePostal) {
      result = result.filter((p) =>
        p.code_postal?.startsWith(filterCodePostal)
      );
    }

    return result;
  };

  const exportToCSV = () => {
    setExporting(true);
    const filtered = getFilteredProfiles();

    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Code Postal",
      "Ville",
      "Type Contrat",
      "Fournisseur Énergie",
      "Fournisseur Internet",
      "Type Compteur",
      "Type Connexion",
      "Prix Internet Actuel",
      "Puissance Compteur",
      "Inclusion Campagne",
      "Date Inscription",
    ];

    const rows = filtered.map((p) => [
      p.prenom || "",
      p.nom || "",
      p.email || "",
      p.telephone || "",
      p.code_postal || "",
      p.ville || "",
      p.contrats || "",
      p.fournisseur_energie_actuel || "",
      p.fournisseur_internet_actuel || "",
      p.type_compteur || "",
      p.type_connexion_internet || "",
      p.prix_actuel_internet?.toString() || "",
      p.puissance_compteur || "",
      p.inclusion_campagne ? "Oui" : "Non",
      p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy HH:mm") : "",
    ]);

    const csvContent =
      "\uFEFF" + // BOM for Excel UTF-8
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(";")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `switchly-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} utilisateurs exportés`);
    setExporting(false);
  };

  const exportToExcel = () => {
    // For simplicity, we'll export as CSV with .xlsx extension
    // A real Excel export would require a library like xlsx
    setExporting(true);
    const filtered = getFilteredProfiles();

    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Code Postal",
      "Ville",
      "Type Contrat",
      "Fournisseur Énergie",
      "Fournisseur Internet",
      "Type Compteur",
      "Type Connexion",
      "Prix Internet Actuel",
      "Puissance Compteur",
      "Inclusion Campagne",
      "Date Inscription",
    ];

    const rows = filtered.map((p) => [
      p.prenom || "",
      p.nom || "",
      p.email || "",
      p.telephone || "",
      p.code_postal || "",
      p.ville || "",
      p.contrats || "",
      p.fournisseur_energie_actuel || "",
      p.fournisseur_internet_actuel || "",
      p.type_compteur || "",
      p.type_connexion_internet || "",
      p.prix_actuel_internet?.toString() || "",
      p.puissance_compteur || "",
      p.inclusion_campagne ? "Oui" : "Non",
      p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy HH:mm") : "",
    ]);

    // Tab-separated for better Excel compatibility
    const content =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.join("\t")).join("\n");

    const blob = new Blob([content], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `switchly-export-${format(new Date(), "yyyy-MM-dd")}.xls`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} utilisateurs exportés`);
    setExporting(false);
  };

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setFilterContrat("all");
    setFilterFournisseurEnergie("all");
    setFilterFournisseurInternet("all");
    setFilterCodePostal("");
  };

  const filteredCount = getFilteredProfiles().length;

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
        <h1 className="text-2xl font-bold text-foreground">Export des Données</h1>
        <p className="text-muted-foreground">
          Exportez les données des utilisateurs au format CSV ou Excel
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Après filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtres actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                dateFrom,
                dateTo,
                filterContrat !== "all",
                filterFournisseurEnergie !== "all",
                filterFournisseurInternet !== "all",
                filterCodePostal,
              ].filter(Boolean).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres d'export
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select value={filterContrat} onValueChange={setFilterContrat}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="energie">Énergie</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="les_deux">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fournisseur énergie</Label>
              <Select
                value={filterFournisseurEnergie}
                onValueChange={setFilterFournisseurEnergie}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {fournisseursEnergie.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fournisseur internet</Label>
              <Select
                value={filterFournisseurInternet}
                onValueChange={setFilterFournisseurInternet}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {fournisseursInternet.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Code postal (commence par)</Label>
              <Input
                value={filterCodePostal}
                onChange={(e) => setFilterCodePostal(e.target.value)}
                placeholder="Ex: 75"
                maxLength={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Exporter les données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={exportToCSV}
              disabled={exporting || filteredCount === 0}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exporter en CSV ({filteredCount} utilisateurs)
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={exporting || filteredCount === 0}
              variant="outline"
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter en Excel ({filteredCount} utilisateurs)
            </Button>
          </div>

          {filteredCount === 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Aucun utilisateur ne correspond aux filtres sélectionnés
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
