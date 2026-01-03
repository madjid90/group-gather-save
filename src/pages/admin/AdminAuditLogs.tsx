import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Search, RefreshCw } from "lucide-react";

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  admin_login: { label: "Connexion", variant: "default" },
  admin_logout: { label: "Déconnexion", variant: "secondary" },
  campaign_create: { label: "Création campagne", variant: "default" },
  campaign_update: { label: "Modification campagne", variant: "outline" },
  campaign_delete: { label: "Suppression campagne", variant: "destructive" },
  offer_create: { label: "Création offre", variant: "default" },
  offer_update: { label: "Modification offre", variant: "outline" },
  offer_delete: { label: "Suppression offre", variant: "destructive" },
  user_update: { label: "Modification utilisateur", variant: "outline" },
  user_delete: { label: "Suppression utilisateur", variant: "destructive" },
  sms_send: { label: "Envoi SMS", variant: "secondary" },
  export_generate: { label: "Export généré", variant: "secondary" },
  import_offers: { label: "Import offres", variant: "default" },
  settings_update: { label: "Paramètres modifiés", variant: "outline" },
  seo_page_create: { label: "Page SEO créée", variant: "default" },
  seo_page_update: { label: "Page SEO modifiée", variant: "outline" },
  seo_page_delete: { label: "Page SEO supprimée", variant: "destructive" },
};

export default function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select(`
          *,
          admin:admin_user_id (
            prenom,
            nom,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs d'audit</h1>
          <p className="text-muted-foreground">Historique des actions administratives</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Actions récentes</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrer par action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const actionInfo = actionLabels[log.action] || { label: log.action, variant: "outline" as const };
                    const admin = log.admin as any;
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {admin?.prenom} {admin?.nom}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {admin?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionInfo.variant}>
                            {actionInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.target_table || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details && Object.keys(log.details as object).length > 0 ? (
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-w-[200px]">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Aucun log d'audit trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
