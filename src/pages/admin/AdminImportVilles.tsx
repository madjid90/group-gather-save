import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

interface Job {
  batch_id: string;
  statut: string;
  total_cps: number;
  traites: number;
  publiees: number;
  a_valider: number;
  erreurs: number;
  cp_restants: string[];
  updated_at: string;
}

const DEFAULT_CPS = `44000
75001
69001
13001
33000
31000
06000
67000
59000
34000`;

export default function AdminImportVilles() {
  const { toast } = useToast();
  const [textarea, setTextarea] = useState(DEFAULT_CPS);
  const [job, setJob] = useState<Job | null>(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ total: 0, publiees: 0, a_valider: 0, erreurs: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeJobRef = useRef<string | null>(null);

  // Récupérer le job actif depuis localStorage au montage
  useEffect(() => {
    const savedBatchId = localStorage.getItem('switchly_batch_id');
    if (savedBatchId) {
      activeJobRef.current = savedBatchId;
      pollJobStatus(savedBatchId);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await (supabase.from('villes') as any)
      .select('statut_publication');
    if (data) {
      setStats({
        total:     data.length,
        publiees:  data.filter((v: any) => v.statut_publication === 'publiee').length,
        a_valider: data.filter((v: any) => v.statut_publication === 'a_valider_humain').length,
        erreurs:   data.filter((v: any) => v.statut_publication === 'rejetee').length,
      });
    }
  };

  const pollJobStatus = useCallback(async (batchId: string) => {
    const { data, error } = await supabase.functions.invoke('batch-import', {
      body: { action: 'status', batch_id: batchId },
    });
    if (!error && data?.job) {
      setJob(data.job);
      if (data.job.statut === 'termine' || data.job.statut === 'erreur' || data.job.statut === 'pause') {
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (data.job.statut === 'termine') {
          toast({ title: '✅ Import terminé !', description: `${data.job.publiees} publiées · ${data.job.a_valider} à valider` });
          localStorage.removeItem('switchly_batch_id');
        }
        fetchStats();
      }
    }
  }, [toast]);

  // Lancer un nouveau batch
  const startImport = async () => {
    const cps = textarea.split('\n').map(s => s.trim()).filter(Boolean);
    if (!cps.length) return;

    setRunning(true);
    const { data, error } = await supabase.functions.invoke('batch-import', {
      body: { action: 'start', codes_postaux: cps, batch_size: 3 },
    });

    if (error || !data?.batch_id) {
      toast({ title: 'Erreur démarrage', description: error?.message, variant: 'destructive' });
      setRunning(false);
      return;
    }

    activeJobRef.current = data.batch_id;
    localStorage.setItem('switchly_batch_id', data.batch_id);
    toast({ title: '🚀 Import démarré', description: `${cps.length} communes · batch_id: ${data.batch_id}` });

    // Démarrer le polling + déclencher les batches suivants
    startAutoProcess(data.batch_id);
  };

  // Reprendre un job en pause
  const resumeImport = async () => {
    if (!activeJobRef.current) return;
    setRunning(true);
    await supabase.functions.invoke('batch-import', {
      body: { action: 'resume', batch_id: activeJobRef.current, batch_size: 3 },
    });
    startAutoProcess(activeJobRef.current);
  };

  // Pause
  const pauseImport = async () => {
    if (!activeJobRef.current) return;
    await supabase.functions.invoke('batch-import', {
      body: { action: 'pause', batch_id: activeJobRef.current },
    });
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast({ title: '⏸️ Import mis en pause' });
  };

  // Auto-process : appelle resume toutes les 30s pour traiter le prochain batch
  const startAutoProcess = (batchId: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Poller l'état toutes les 5s
    intervalRef.current = setInterval(async () => {
      const { data } = await supabase.functions.invoke('batch-import', {
        body: { action: 'status', batch_id: batchId },
      });

      if (!data?.job) return;
      setJob(data.job);

      if (data.job.statut === 'termine') {
        clearInterval(intervalRef.current!);
        setRunning(false);
        toast({ title: '✅ Import terminé !', description: `${data.job.publiees} publiées · ${data.job.a_valider} à valider` });
        localStorage.removeItem('switchly_batch_id');
        fetchStats();
        return;
      }

      if (data.job.statut === 'pause') {
        clearInterval(intervalRef.current!);
        setRunning(false);
        return;
      }

      // Si en attente (batch précédent fini), lancer le suivant
      if (data.job.statut === 'en_attente' && data.job.cp_restants?.length > 0) {
        await supabase.functions.invoke('batch-import', {
          body: { action: 'resume', batch_id: batchId, batch_size: 3 },
        });
      }
    }, 8000); // Check toutes les 8s
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const progressPct = job ? Math.round((job.traites / job.total_cps) * 100) : 0;

  return (
    <>
      <Helmet><title>Import des communes — Admin Switchly</title><meta name="robots" content="noindex" /></Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Import des communes</h1>

        {/* Stats globales */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Communes</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.publiees * 2}</p>
            <p className="text-xs text-green-500">Pages publiées</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-500">{stats.a_valider}</p>
            <p className="text-xs text-orange-400">À valider</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-500">{stats.erreurs}</p>
            <p className="text-xs text-red-400">Erreurs</p>
          </div>
        </div>

        {/* Import */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <label className="text-sm font-medium mb-2 block">
            Codes postaux (1 par ligne) — 35 000 communes possibles
          </label>
          <textarea
            value={textarea}
            onChange={e => setTextarea(e.target.value)}
            rows={8}
            placeholder={"44000\n75001\n69001\n..."}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary resize-none"
            disabled={running}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {textarea.split('\n').filter(s => s.trim()).length} codes postaux · Traitement : 3 communes toutes les ~30s
          </p>

          <div className="flex gap-3 mt-4">
            {!running ? (
              <>
                <Button onClick={startImport} disabled={running} className="gap-2">
                  <Play className="w-4 h-4" /> Lancer l'import en arrière-plan
                </Button>
                {job && job.statut === 'pause' && job.cp_restants?.length > 0 && (
                  <Button variant="outline" onClick={resumeImport} className="gap-2">
                    <Play className="w-4 h-4" /> Reprendre ({job.cp_restants.length} restants)
                  </Button>
                )}
              </>
            ) : (
              <Button variant="outline" onClick={pauseImport} className="gap-2">
                <Pause className="w-4 h-4" /> Mettre en pause
              </Button>
            )}
          </div>
        </div>

        {/* Progression du job actif */}
        {job && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Progression de l'import</h3>
              <div className="flex items-center gap-2">
                {running && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  job.statut === 'en_cours' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                  job.statut === 'termine'  ? 'bg-green-100 text-green-600' :
                  job.statut === 'pause'    ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>{job.statut}</span>
              </div>
            </div>

            {/* Barre de progression */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{job.traites} / {job.total_cps} communes traitées</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Détail des résultats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted rounded-xl">
                <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{job.cp_restants?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Restants</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-green-600">{job.publiees}</p>
                <p className="text-xs text-green-500">Publiées auto</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <p className="text-lg font-bold text-orange-500">{job.a_valider}</p>
                <p className="text-xs text-orange-400">À valider</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <XCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <p className="text-lg font-bold text-red-500">{job.erreurs}</p>
                <p className="text-xs text-red-400">Erreurs</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              batch_id : <code className="font-mono">{job.batch_id}</code> ·
              Dernière mise à jour : {new Date(job.updated_at).toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}

        {/* Explication du pipeline */}
        <div className="bg-muted/40 border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Pipeline de génération automatique</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {[
              { step: '1', icon: '📡', title: 'Données Enedis', desc: 'Population, conso, réseau (APIs publiques)' },
              { step: '2', icon: '🤖', title: 'Contenu IA', desc: 'Gemini génère intro + contexte + conseils SEO' },
              { step: '3', icon: '🔍', title: 'Validation IA', desc: 'Gemini audite la qualité (score /100)' },
              { step: '4', icon: '✅', title: 'Publication', desc: 'Score ≥80 → auto · Score <80 → validation humaine' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="font-medium">{s.step}. {s.title}</p>
                  <p className="text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
