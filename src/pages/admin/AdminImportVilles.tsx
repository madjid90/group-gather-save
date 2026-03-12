import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogEntry { cp: string; status: 'loading' | 'success' | 'partial' | 'error'; message?: string; }
interface VilleRow { slug: string; nom: string; code_postal: string; population: number | null; conso_moyenne_kwh: number | null; conso_gaz_kwh: number | null; reseau_elec: string | null; contenu_genere_at: string | null; }

const DEFAULT_CPS = `44000\n75001\n69001\n13001\n33000\n31000\n06000\n67000\n59000\n34000`;

export default function AdminImportVilles() {
  const [textarea, setTextarea] = useState(DEFAULT_CPS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [villes, setVilles] = useState<VilleRow[]>([]);
  const [showVilles, setShowVilles] = useState(false);

  const fetchVilles = async () => {
    const { data } = await supabase.from('villes' as any).select('slug, nom, code_postal, population, conso_moyenne_kwh, conso_gaz_kwh, reseau_elec, contenu_genere_at').order('population', { ascending: false });
    if (data) setVilles(data as any as VilleRow[]);
  };

  useEffect(() => { fetchVilles(); }, []);

  const handleImport = async () => {
    const cps = textarea.split('\n').map(s => s.trim()).filter(Boolean);
    if (!cps.length) return;
    setImporting(true); setLogs([]); setProgress({ current: 0, total: cps.length });

    for (let i = 0; i < cps.length; i++) {
      const cp = cps[i];
      setLogs(prev => [...prev, { cp, status: 'loading', message: 'Import Enedis...' }]);
      setProgress({ current: i + 1, total: cps.length });

      try {
        const { data, error } = await supabase.functions.invoke('ville-data', { body: { code_postal: cp } });
        if (error || !data?.success) {
          setLogs(prev => prev.map(l => l.cp === cp ? { ...l, status: 'error', message: error?.message || data?.error || 'Erreur' } : l));
          continue;
        }

        const villeSlug = data.data.slug;
        setLogs(prev => prev.map(l => l.cp === cp ? { ...l, message: `✅ ${data.data.nom} importé · Génération IA...` } : l));

        // Generate IA content
        await new Promise(r => setTimeout(r, 2000));
        const { error: iaError } = await supabase.functions.invoke('generate-ville-content', { body: { slug: villeSlug, type: 'both' } });

        if (iaError) {
          setLogs(prev => prev.map(l => l.cp === cp ? { ...l, status: 'partial', message: `✅ ${data.data.nom} · ⚠️ Contenu IA échoué` } : l));
        } else {
          setLogs(prev => prev.map(l => l.cp === cp ? { ...l, status: 'success', message: `✅ ${data.data.nom} — Données + Contenu IA ✓` } : l));
        }
      } catch (e: any) {
        setLogs(prev => prev.map(l => l.cp === cp ? { ...l, status: 'error', message: e.message } : l));
      }
      await new Promise(r => setTimeout(r, 500));
    }
    setImporting(false); fetchVilles();
  };

  return (
    <>
      <Helmet><title>Import des communes — Admin</title><meta name="robots" content="noindex" /></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Import des communes</h1>

        <div className="bg-card border border-border rounded-2xl p-6">
          <label className="text-sm font-medium mb-2 block">Codes postaux (1 par ligne)</label>
          <textarea value={textarea} onChange={e => setTextarea(e.target.value)} rows={8}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary resize-none" disabled={importing} />
          <div className="flex items-center gap-4 mt-4">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Import en cours...</> : "Lancer l'import"}
            </Button>
            {progress.total > 0 && <span className="text-sm text-muted-foreground">{progress.current} / {progress.total}</span>}
          </div>
          {progress.total > 0 && (
            <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full transition-all" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 max-h-80 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">Journal</h3>
            <div className="space-y-1.5">
              {logs.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {l.status === 'loading' && <Clock className="w-4 h-4 text-muted-foreground mt-0.5 animate-pulse" />}
                  {l.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                  {l.status === 'partial' && <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />}
                  {l.status === 'error' && <XCircle className="w-4 h-4 text-destructive mt-0.5" />}
                  <span className="font-mono text-xs">{l.cp}</span>
                  <span className="text-muted-foreground text-xs">{l.status === 'loading' ? 'En cours...' : l.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Villes importées ({villes.length})</h3>
            <Button variant="outline" size="sm" onClick={() => { setShowVilles(!showVilles); if (!showVilles) fetchVilles(); }}>
              {showVilles ? 'Masquer' : 'Voir'}
            </Button>
          </div>
          {showVilles && villes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left py-2 px-3">Nom</th><th className="text-left py-2 px-3">CP</th>
                  <th className="text-right py-2 px-3">Pop.</th><th className="text-right py-2 px-3">Élec kWh</th>
                  <th className="text-right py-2 px-3">Gaz kWh</th><th className="text-left py-2 px-3">Réseau</th>
                  <th className="text-center py-2 px-3">IA</th><th className="text-left py-2 px-3">Pages</th>
                </tr></thead>
                <tbody>
                  {villes.map(v => (
                    <tr key={v.slug} className="border-t border-border">
                      <td className="py-2 px-3 font-medium">{v.nom}</td>
                      <td className="py-2 px-3">{v.code_postal}</td>
                      <td className="py-2 px-3 text-right">{v.population?.toLocaleString('fr-FR') || '-'}</td>
                      <td className="py-2 px-3 text-right">{v.conso_moyenne_kwh || '-'}</td>
                      <td className="py-2 px-3 text-right">{v.conso_gaz_kwh || '-'}</td>
                      <td className="py-2 px-3">{v.reseau_elec}</td>
                      <td className="py-2 px-3 text-center">{v.contenu_genere_at ? '✅' : '⏳'}</td>
                      <td className="py-2 px-3 space-x-2">
                        <Link to={`/electricite/${v.slug}`} className="text-primary hover:underline text-xs inline-flex items-center gap-0.5">Élec <ExternalLink className="w-3 h-3" /></Link>
                        <Link to={`/gaz/${v.slug}`} className="text-primary hover:underline text-xs inline-flex items-center gap-0.5">Gaz <ExternalLink className="w-3 h-3" /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
