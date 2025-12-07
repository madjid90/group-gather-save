import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, UserPlus, Trash2, Shield, Mail, Code } from "lucide-react";
import { toast } from "sonner";

interface AdminSettings {
  id: string;
  nom_site: string;
  message_global: string | null;
  collecte_avancee_active: boolean;
  email_confirmation_active: boolean;
  email_statut_active: boolean;
  email_offre_active: boolean;
  script_analytics: string | null;
  pixel_publicitaire: string | null;
}

interface AdminUser {
  user_id: string;
  email: string;
  prenom: string;
  nom: string;
}

export default function AdminParametres() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch settings
      const { data: settingsData } = await supabase
        .from("admin_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch admin users
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesData && rolesData.length > 0) {
        const userIds = rolesData.map((r) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, prenom, nom")
          .in("id", userIds);

        if (profilesData) {
          setAdmins(
            profilesData.map((p) => ({
              user_id: p.id,
              email: p.email,
              prenom: p.prenom,
              nom: p.nom,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (field: keyof AdminSettings, value: unknown) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);

    const { error } = await supabase
      .from("admin_settings")
      .update({
        nom_site: settings.nom_site,
        message_global: settings.message_global,
        collecte_avancee_active: settings.collecte_avancee_active,
        email_confirmation_active: settings.email_confirmation_active,
        email_statut_active: settings.email_statut_active,
        email_offre_active: settings.email_offre_active,
        script_analytics: settings.script_analytics,
        pixel_publicitaire: settings.pixel_publicitaire,
      })
      .eq("id", settings.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Paramètres enregistrés");
    }
    setSaving(false);
  };

  const addAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Veuillez entrer un email");
      return;
    }

    setAddingAdmin(true);

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newAdminEmail)
      .maybeSingle();

    if (!profile) {
      toast.error("Utilisateur non trouvé");
      setAddingAdmin(false);
      return;
    }

    // Check if already admin
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", profile.id)
      .eq("role", "admin")
      .maybeSingle();

    if (existingRole) {
      toast.error("Cet utilisateur est déjà administrateur");
      setAddingAdmin(false);
      return;
    }

    // Add admin role
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: "admin" });

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Administrateur ajouté");
      setIsAddAdminOpen(false);
      setNewAdminEmail("");
      fetchData();
    }
    setAddingAdmin(false);
  };

  const removeAdmin = async (userId: string) => {
    if (admins.length <= 1) {
      toast.error("Impossible de supprimer le dernier administrateur");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir retirer les droits admin ?")) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Droits administrateur retirés");
      fetchData();
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les options de l'application</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Nom du site</Label>
            <Input
              value={settings?.nom_site || ""}
              onChange={(e) => updateSettings("nom_site", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Message global (affiché sur le dashboard client)</Label>
            <Textarea
              value={settings?.message_global || ""}
              onChange={(e) => updateSettings("message_global", e.target.value)}
              placeholder="Ce message sera affiché à tous les utilisateurs..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Collecte d'informations avancées</Label>
              <p className="text-sm text-muted-foreground">
                Demander les fournisseurs actuels, type de compteur, etc.
              </p>
            </div>
            <Switch
              checked={settings?.collecte_avancee_active ?? true}
              onCheckedChange={(checked) =>
                updateSettings("collecte_avancee_active", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails automatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Email de confirmation d'inscription</Label>
              <p className="text-sm text-muted-foreground">
                Envoyé après chaque nouvelle inscription
              </p>
            </div>
            <Switch
              checked={settings?.email_confirmation_active ?? true}
              onCheckedChange={(checked) =>
                updateSettings("email_confirmation_active", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notification changement de statut</Label>
              <p className="text-sm text-muted-foreground">
                Envoyé quand le statut de la campagne change
              </p>
            </div>
            <Switch
              checked={settings?.email_statut_active ?? true}
              onCheckedChange={(checked) =>
                updateSettings("email_statut_active", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notification nouvelle offre</Label>
              <p className="text-sm text-muted-foreground">
                Envoyé quand une nouvelle offre est publiée
              </p>
            </div>
            <Switch
              checked={settings?.email_offre_active ?? true}
              onCheckedChange={(checked) =>
                updateSettings("email_offre_active", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Scripts de suivi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Script Analytics (Google Analytics, etc.)</Label>
            <Textarea
              value={settings?.script_analytics || ""}
              onChange={(e) => updateSettings("script_analytics", e.target.value)}
              placeholder="Collez votre script analytics ici..."
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Pixel publicitaire (Facebook, etc.)</Label>
            <Textarea
              value={settings?.pixel_publicitaire || ""}
              onChange={(e) => updateSettings("pixel_publicitaire", e.target.value)}
              placeholder="Collez votre pixel publicitaire ici..."
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={saveSettings} disabled={saving} size="lg">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
      </Button>

      {/* Admin Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gestion des administrateurs
            </CardTitle>
            <CardDescription>
              Gérez les comptes ayant accès à l'espace admin
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddAdminOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.user_id}>
                  <TableCell className="font-medium">
                    {admin.prenom} {admin.nom}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary">Admin</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdmin(admin.user_id)}
                      disabled={admins.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email de l'utilisateur</Label>
              <Input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
              <p className="text-sm text-muted-foreground">
                L'utilisateur doit déjà avoir un compte sur la plateforme
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                Annuler
              </Button>
              <Button onClick={addAdmin} disabled={addingAdmin}>
                {addingAdmin ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
