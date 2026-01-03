import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Upload,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVRow {
  lineNumber: number;
  client_id: string;
  offre_nom?: string;
  prix_kwh?: string;
  abonnement_mensuel?: string;
  economie_estimee_mensuelle?: string;
  economie_estimee_annuelle?: string;
  commentaire_fournisseur?: string;
  errors: string[];
  warnings: string[];
}

interface ValidationResult {
  isValid: boolean;
  rows: CSVRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  headers: string[];
  missingHeaders: string[];
  separator: string;
}

interface CSVImportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onConfirmImport: () => void;
  isImporting: boolean;
}

const REQUIRED_HEADERS = ["client_id"];
const EXPECTED_HEADERS = [
  "client_id",
  "offre_nom",
  "prix_kwh",
  "abonnement_mensuel",
  "economie_estimee_mensuelle",
  "economie_estimee_annuelle",
  "commentaire_fournisseur",
];

function parseCSVContent(content: string): ValidationResult {
  const lines = content.split("\n").filter((line) => line.trim());

  if (lines.length < 1) {
    return {
      isValid: false,
      rows: [],
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      headers: [],
      missingHeaders: REQUIRED_HEADERS,
      separator: ",",
    };
  }

  // Remove BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xfeff) {
    headerLine = headerLine.substring(1);
  }

  // Detect separator
  const separator = headerLine.includes(";") ? ";" : ",";

  // Parse headers
  const headers = headerLine
    .split(separator)
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, "_"));

  // Check for missing required headers
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0 || lines.length < 2) {
    return {
      isValid: false,
      rows: [],
      totalRows: lines.length - 1,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      headers,
      missingHeaders,
      separator,
    };
  }

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line handling quoted values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create row object
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index]?.replace(/^"|"$/g, "") || "";
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate client_id
    if (!rowData.client_id || rowData.client_id.trim() === "") {
      errors.push("client_id manquant");
    }

    // Check if at least one offer field is filled
    const hasOfferData =
      rowData.offre_nom ||
      rowData.prix_kwh ||
      rowData.abonnement_mensuel ||
      rowData.economie_estimee_mensuelle ||
      rowData.economie_estimee_annuelle ||
      rowData.commentaire_fournisseur;

    if (!hasOfferData && rowData.client_id) {
      warnings.push("Aucune donnée d'offre");
    }

    // Validate numeric fields
    const numericFields = [
      { key: "prix_kwh", label: "Prix kWh" },
      { key: "abonnement_mensuel", label: "Abonnement" },
      { key: "economie_estimee_mensuelle", label: "Économie mensuelle" },
      { key: "economie_estimee_annuelle", label: "Économie annuelle" },
    ];

    numericFields.forEach(({ key, label }) => {
      const value = rowData[key];
      if (value && value.trim() !== "") {
        const parsed = parseFloat(value.replace(",", "."));
        if (isNaN(parsed)) {
          errors.push(`${label} invalide: "${value}"`);
        } else if (parsed < 0) {
          warnings.push(`${label} négatif`);
        }
      }
    });

    rows.push({
      lineNumber: i + 1,
      client_id: rowData.client_id || "",
      offre_nom: rowData.offre_nom,
      prix_kwh: rowData.prix_kwh,
      abonnement_mensuel: rowData.abonnement_mensuel,
      economie_estimee_mensuelle: rowData.economie_estimee_mensuelle,
      economie_estimee_annuelle: rowData.economie_estimee_annuelle,
      commentaire_fournisseur: rowData.commentaire_fournisseur,
      errors,
      warnings,
    });
  }

  const errorRows = rows.filter((r) => r.errors.length > 0).length;
  const warningRows = rows.filter((r) => r.warnings.length > 0 && r.errors.length === 0).length;
  const validRows = rows.filter((r) => r.errors.length === 0).length;

  return {
    isValid: errorRows === 0 && rows.length > 0,
    rows,
    totalRows: rows.length,
    validRows,
    errorRows,
    warningRows,
    headers,
    missingHeaders: [],
    separator,
  };
}

export default function CSVImportPreview({
  open,
  onOpenChange,
  file,
  onConfirmImport,
  isImporting,
}: CSVImportPreviewProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters state
  const [showValid, setShowValid] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showErrors, setShowErrors] = useState(true);

  // Read file when it changes
  useMemo(() => {
    if (file && open) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string || "");
        setIsLoading(false);
      };
      reader.onerror = () => {
        setFileContent("");
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else {
      setFileContent("");
    }
  }, [file, open]);

  const validation = useMemo(() => {
    if (!fileContent) return null;
    return parseCSVContent(fileContent);
  }, [fileContent]);

  // Filtered rows based on visibility toggles
  const filteredRows = useMemo(() => {
    if (!validation) return [];
    return validation.rows.filter((row) => {
      const hasError = row.errors.length > 0;
      const hasWarning = row.warnings.length > 0 && !hasError;
      const isValid = row.errors.length === 0 && row.warnings.length === 0;

      if (hasError && !showErrors) return false;
      if (hasWarning && !showWarnings) return false;
      if (isValid && !showValid) return false;

      return true;
    });
  }, [validation, showValid, showWarnings, showErrors]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Aperçu de l'import CSV
          </DialogTitle>
        </DialogHeader>

        {file && (
          <p className="text-sm text-muted-foreground">
            Fichier: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} Ko)
          </p>
        )}

        {validation && (
          <>
            {/* Summary with clickable filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Total lignes</p>
                <p className="text-xl font-bold">{validation.totalRows}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowValid(!showValid)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  showValid 
                    ? "bg-card ring-2 ring-green-500/50" 
                    : "bg-muted/50 opacity-60"
                }`}
              >
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Valides
                  {!showValid && <span className="ml-1 text-[10px]">(masquées)</span>}
                </p>
                <p className="text-xl font-bold text-green-600">{validation.validRows}</p>
              </button>
              <button
                type="button"
                onClick={() => setShowWarnings(!showWarnings)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  showWarnings 
                    ? "bg-card ring-2 ring-yellow-500/50" 
                    : "bg-muted/50 opacity-60"
                }`}
              >
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  Alertes
                  {!showWarnings && <span className="ml-1 text-[10px]">(masquées)</span>}
                </p>
                <p className="text-xl font-bold text-yellow-600">{validation.warningRows}</p>
              </button>
              <button
                type="button"
                onClick={() => setShowErrors(!showErrors)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  showErrors 
                    ? "bg-card ring-2 ring-red-500/50" 
                    : "bg-muted/50 opacity-60"
                }`}
              >
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  Erreurs
                  {!showErrors && <span className="ml-1 text-[10px]">(masquées)</span>}
                </p>
                <p className="text-xl font-bold text-red-600">{validation.errorRows}</p>
              </button>
            </div>

            {/* Filter info */}
            {(!showValid || !showWarnings || !showErrors) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                <span>
                  Affichage: {filteredRows.length} / {validation.totalRows} lignes
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowValid(true);
                    setShowWarnings(true);
                    setShowErrors(true);
                  }}
                  className="text-primary hover:underline"
                >
                  Afficher tout
                </button>
              </div>
            )}

            {/* Missing headers alert */}
            {validation.missingHeaders.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Colonnes requises manquantes: <strong>{validation.missingHeaders.join(", ")}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Headers info */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Colonnes détectées ({validation.separator === ";" ? "séparateur ;" : "séparateur ,"}): </span>
              {validation.headers.join(", ")}
            </div>

            {/* Data preview table */}
            {filteredRows.length > 0 && (
              <ScrollArea className="flex-1 rounded-md border max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-16">Statut</TableHead>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Offre</TableHead>
                      <TableHead className="text-right">Prix kWh</TableHead>
                      <TableHead className="text-right">Abonnement</TableHead>
                      <TableHead className="text-right">Éco. annuelle</TableHead>
                      <TableHead>Messages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.slice(0, 100).map((row) => (
                      <TableRow
                        key={row.lineNumber}
                        className={
                          row.errors.length > 0
                            ? "bg-red-50 dark:bg-red-950/20"
                            : row.warnings.length > 0
                            ? "bg-yellow-50 dark:bg-yellow-950/20"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.lineNumber}
                        </TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : row.warnings.length > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.client_id || "-"}</TableCell>
                        <TableCell className="text-sm truncate max-w-[150px]">
                          {row.offre_nom || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {row.prix_kwh || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {row.abonnement_mensuel || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {row.economie_estimee_annuelle || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {row.errors.map((err, i) => (
                              <Badge key={i} variant="destructive" className="text-[10px] px-1 py-0">
                                {err}
                              </Badge>
                            ))}
                            {row.warnings.map((warn, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 text-yellow-600 border-yellow-400">
                                {warn}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredRows.length > 100 && (
                  <div className="p-2 text-center text-xs text-muted-foreground border-t">
                    Affichage limité à 100 lignes sur {filteredRows.length}
                  </div>
                )}
              </ScrollArea>
            )}
            
            {/* Empty state when all filtered out */}
            {filteredRows.length === 0 && validation.rows.length > 0 && (
              <div className="rounded-md border p-8 text-center text-muted-foreground">
                <p className="text-sm">Aucune ligne à afficher avec les filtres actuels</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowValid(true);
                    setShowWarnings(true);
                    setShowErrors(true);
                  }}
                  className="text-primary hover:underline text-sm mt-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Validation summary */}
            {validation.errorRows > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validation.errorRows} ligne(s) contiennent des erreurs et seront ignorées lors de l'import.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Annuler
          </Button>
          <Button
            onClick={onConfirmImport}
            disabled={!validation || validation.validRows === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importer {validation?.validRows || 0} offre(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
