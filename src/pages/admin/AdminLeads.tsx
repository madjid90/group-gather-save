import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Lead {
  id: string; created_at: string; code_postal: string; ville: string; type_energie: string;
  superficie: string; telephone: string; fournisseur_actuel: string; conso_estimee_kwh: number;
  economie_estimee: number; statut: string; note: string;
}

const PAGE_SIZE = 50;

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [globalStats, setGlobalStats] = useState({ total: 0, nouveau: 0, contacte: 0, converti: 0 });

  const fetchStats = useCallback(async () => {
    const { count: total } = await supabase.from('leads' as any).select('*', { count: 'exact', head: true });
    const { count: nouveau } = await supabase.from('leads' as any).select('*', { count: 'exact', head: true }).eq('statut', 'nouveau');
    const { count: contacte } = await supabase.from('leads' as any).select('*', { count: 'exact', head: true }).eq('statut', 'contacte');
    const { count: converti } = await supabase.from('leads' as any).select('*', { count: 'exact', head: true }).eq('statut', 'converti');
    setGlobalStats({ total: total || 0, nouveau: nouveau || 0, contacte: contacte || 0, converti: converti || 0 });
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from('leads' as any).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (statusFilter) query = query.eq('statut', statusFilter);
    const { data, count } = await query;
    setLeads((data as any as Lead[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: string, statut: string) => {
    await supabase.from('leads' as any).update({ statut } as any).eq('id', id);
    fetchLeads();
    fetchStats();
  };

  const updateNote = async (id: string) => {
    const note = prompt('Note :');
    if (note !== null) {
      await supabase.from('leads' as any).update({ note } as any).eq('id', id);
      fetchLeads();
    }
  };

  const exportCSV = async () => {
    // Export ALL leads, not just current page
    let allLeads: Lead[] = [];
    let from = 0;
    while (true) {
      let q = supabase.from('leads' as any).select('*').order('created_at', { ascending: false }).range(from, from + 999);
      if (statusFilter) q = q.eq('statut', statusFilter);
      const { data } = await q;
      if (!data || data.length === 0) break;
      allLeads = allLeads.concat(data as any);
      if (data.length < 1000) break;
      from += 1000;
    }
    const headers = 'Date,CP,Ville,Énergie,Surface,Téléphone,Fournisseur,Conso,Économie,Statut\n';
    const rows = allLeads.map(l => `${new Date(l.created_at).toLocaleDateString('fr-FR')},${l.code_postal},${l.ville || ''},${l.type_energie || ''},${l.superficie || ''},${l.telephone || ''},${l.fournisseur_actuel || ''},${l.conso_estimee_kwh || ''},${l.economie_estimee || ''},${l.statut || ''}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leads-switchly.csv'; a.click();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const filtered = leads.filter(l => !filter || l.code_postal?.includes(filter) || l.telephone?.includes(filter) || l.ville?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <Helmet><title>Leads — Admin Switchly</title><meta name="robots" content="noindex" /></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leads</h1>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV (tout)</Button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center"><p className="text-2xl font-bold">{globalStats.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="bg-card border border-border rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{globalStats.nouveau}</p><p className="text-xs text-muted-foreground">Nouveaux</p></div>
          <div className="bg-card border border-border rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{globalStats.contacte}</p><p className="text-xs text-muted-foreground">Contactés</p></div>
          <div className="bg-card border border-border rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{globalStats.converti}</p><p className="text-xs text-muted-foreground">Convertis</p></div>
        </div>

        {/* Filtres */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input placeholder="Rechercher CP, ville, tél..." value={filter} onChange={e => setFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm">
            <option value="">Tous</option>
            <option value="nouveau">Nouveau</option>
            <option value="contacte">Contacté</option>
            <option value="converti">Converti</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left py-2 px-3">Date</th><th className="text-left py-2 px-3">CP + Ville</th>
                <th className="text-left py-2 px-3">Énergie</th><th className="text-left py-2 px-3">Tél</th>
                <th className="text-right py-2 px-3">Conso</th><th className="text-right py-2 px-3">Éco.</th>
                <th className="text-left py-2 px-3">Statut</th><th className="text-left py-2 px-3">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="py-2 px-3 text-xs">{new Date(l.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2 px-3">{l.code_postal} {l.ville}</td>
                    <td className="py-2 px-3">{l.type_energie}</td>
                    <td className="py-2 px-3">{l.telephone || '-'}</td>
                    <td className="py-2 px-3 text-right">{l.conso_estimee_kwh || '-'}</td>
                    <td className="py-2 px-3 text-right text-primary font-medium">{l.economie_estimee ? `${l.economie_estimee}€` : '-'}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${l.statut === 'nouveau' ? 'bg-yellow-100 text-yellow-700' : l.statut === 'contacte' ? 'bg-blue-100 text-blue-700' : l.statut === 'converti' ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                        {l.statut}
                      </span>
                    </td>
                    <td className="py-2 px-3 space-x-1">
                      <button onClick={() => updateStatus(l.id, 'contacte')} className="text-xs text-blue-600 hover:underline">Contacté</button>
                      <button onClick={() => updateStatus(l.id, 'converti')} className="text-xs text-green-600 hover:underline">Converti</button>
                      <button onClick={() => updateNote(l.id)} className="text-xs text-muted-foreground hover:underline">Note</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} / {totalPages} · {totalCount} lead{totalCount > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
