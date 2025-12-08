import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Home, Search, Filter, Loader2 } from "lucide-react";

interface HousingWithUser {
  id: string;
  user_id: string;
  type_logement: string | null;
  surface: number | null;
  nombre_occupants: number | null;
  isolation: string | null;
  mode_chauffage: string | null;
  chauffe_eau_electrique: boolean | null;
  fournisseur_electricite: string | null;
  option_tarifaire: string | null;
  puissance_compteur: string | null;
  montant_facture: number | null;
  type_connexion: string | null;
  fournisseur_internet: string | null;
  prix_mensuel_internet: number | null;
  satisfaction_internet: number | null;
  eligible_fibre: boolean | null;
  temps_domicile: string | null;
  equipements_energivores: string[] | null;
  recharge_vehicule_electrique: boolean | null;
  created_at: string;
  profiles: {
    nom: string;
    prenom: string;
    telephone: string | null;
  } | null;
}

const LABELS: Record<string, string> = {
  appartement: "Appartement",
  maison: "Maison",
  studio: "Studio",
  electrique: "Électrique",
  gaz: "Gaz",
  fioul: "Fioul",
  pompe_chaleur: "Pompe à chaleur",
  bois: "Bois",
  edf: "EDF",
  engie: "Engie",
  totalenergies: "TotalEnergies",
  eni: "Eni",
  fibre: "Fibre",
  adsl: "ADSL",
  "4g_box": "4G/5G",
  orange: "Orange",
  sfr: "SFR",
  free: "Free",
  bouygues: "Bouygues",
  bonne: "Bonne",
  moyenne: "Moyenne",
  faible: "Faible",
  peu: "< 8h/jour",
  moyen: "8-12h/jour",
  beaucoup: "> 12h/jour",
  teletravail: "Télétravail",
};

function getLabel(value: string | null): string {
  if (!value) return "-";
  return LABELS[value] || value;
}

export default function AdminLogements() {
  const [isLoading, setIsLoading] = useState(true);
  const [housingProfiles, setHousingProfiles] = useState<HousingWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChauffage, setFilterChauffage] = useState<string>("all");
  const [filterConnexion, setFilterConnexion] = useState<string>("all");
  const [filterFournisseur, setFilterFournisseur] = useState<string>("all");

  useEffect(() => {
    const fetchHousingProfiles = async () => {
      try {
        // Fetch housing profiles
        const { data: housingData, error: housingError } = await supabase
          .from("housing_profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (housingError) throw housingError;

        // Fetch profiles separately
        const userIds = housingData?.map(h => h.user_id) || [];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, nom, prenom, telephone")
          .in("id", userIds);

        // Merge data
        const mergedData = housingData?.map(housing => ({
          ...housing,
          profiles: profilesData?.find(p => p.id === housing.user_id) || null
        })) || [];

        setHousingProfiles(mergedData as HousingWithUser[]);
      } catch (error) {
        console.error("Error fetching housing profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHousingProfiles();
  }, []);

  const filteredProfiles = housingProfiles.filter((profile) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      profile.profiles?.nom?.toLowerCase().includes(searchLower) ||
      profile.profiles?.prenom?.toLowerCase().includes(searchLower) ||
      profile.profiles?.telephone?.includes(searchTerm);

    // Chauffage filter
    const matchesChauffage = 
      filterChauffage === "all" || profile.mode_chauffage === filterChauffage;

    // Connexion filter
    const matchesConnexion = 
      filterConnexion === "all" || profile.type_connexion === filterConnexion;

    // Fournisseur filter
    const matchesFournisseur = 
      filterFournisseur === "all" || 
      profile.fournisseur_electricite === filterFournisseur ||
      profile.fournisseur_internet === filterFournisseur;

    return matchesSearch && matchesChauffage && matchesConnexion && matchesFournisseur;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Home className="w-7 h-7 text-primary" />
          Informations logement
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez les informations logement de tous les utilisateurs.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={filterChauffage} onValueChange={setFilterChauffage}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Chauffage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous chauffages</SelectItem>
                <SelectItem value="electrique">Électrique</SelectItem>
                <SelectItem value="gaz">Gaz</SelectItem>
                <SelectItem value="fioul">Fioul</SelectItem>
                <SelectItem value="pompe_chaleur">Pompe à chaleur</SelectItem>
                <SelectItem value="bois">Bois</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterConnexion} onValueChange={setFilterConnexion}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Connexion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes connexions</SelectItem>
                <SelectItem value="fibre">Fibre</SelectItem>
                <SelectItem value="adsl">ADSL</SelectItem>
                <SelectItem value="4g_box">4G/5G</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFournisseur} onValueChange={setFilterFournisseur}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous fournisseurs</SelectItem>
                <SelectItem value="edf">EDF</SelectItem>
                <SelectItem value="engie">Engie</SelectItem>
                <SelectItem value="totalenergies">TotalEnergies</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="sfr">SFR</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="bouygues">Bouygues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total profils</p>
          <p className="text-2xl font-bold text-foreground">{housingProfiles.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Chauffage électrique</p>
          <p className="text-2xl font-bold text-foreground">
            {housingProfiles.filter(p => p.mode_chauffage === "electrique").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Fibre optique</p>
          <p className="text-2xl font-bold text-foreground">
            {housingProfiles.filter(p => p.type_connexion === "fibre").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Véhicule électrique</p>
          <p className="text-2xl font-bold text-foreground">
            {housingProfiles.filter(p => p.recharge_vehicule_electrique).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Logement</TableHead>
                <TableHead>Chauffage</TableHead>
                <TableHead>Électricité</TableHead>
                <TableHead>Internet</TableHead>
                <TableHead>Équipements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun profil trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {profile.profiles?.prenom} {profile.profiles?.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.profiles?.telephone || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{getLabel(profile.type_logement)}</p>
                        <p className="text-muted-foreground">
                          {profile.surface ? `${profile.surface} m²` : "-"}
                          {profile.nombre_occupants && ` • ${profile.nombre_occupants} pers.`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getLabel(profile.mode_chauffage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{getLabel(profile.fournisseur_electricite)}</p>
                        <p className="text-muted-foreground">
                          {profile.montant_facture ? `${profile.montant_facture} €/mois` : "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{getLabel(profile.fournisseur_internet)}</p>
                        <p className="text-muted-foreground">
                          {getLabel(profile.type_connexion)}
                          {profile.prix_mensuel_internet && ` • ${profile.prix_mensuel_internet} €`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {profile.equipements_energivores?.map((eq) => (
                          <Badge key={eq} variant="secondary" className="text-xs">
                            {getLabel(eq)}
                          </Badge>
                        ))}
                        {profile.recharge_vehicule_electrique && (
                          <Badge variant="secondary" className="text-xs">VE</Badge>
                        )}
                        {(!profile.equipements_energivores?.length && !profile.recharge_vehicule_electrique) && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
