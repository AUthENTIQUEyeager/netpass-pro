'use client';
import { useEffect, useState } from 'react';
import { Search, RefreshCw, Power, Trash2, Plus, Printer, Filter } from 'lucide-react';
import { getTickets, desactiverTicket, supprimerTicket, getForfaits, getRouteurs, genererTicketsManuel } from '@/lib/api';

const Badge = ({ status }: { status: string }) => {
  const map: any = {
    actif: 'badge-active', expiré: 'badge-expired',
    désactivé: 'badge-disabled', en_attente: 'badge-pending'
  };
  const labels: any = { actif: 'Actif', expiré: 'Expiré', désactivé: 'Désactivé', en_attente: 'En attente' };
  return <span className={map[status] || 'badge-expired'}>{labels[status] || status}</span>;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [routeurs, setRouteurs] = useState<any[]>([]);
  const [genForm, setGenForm] = useState({ forfait_id: '', routeur_id: '', quantite: 1 });
  const [generating, setGenerating] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);

  useEffect(() => {
    loadTickets();
    getForfaits().then(setForfaits).catch(() => {});
    getRouteurs().then(setRouteurs).catch(() => {});
  }, [search, filter, page]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets({ search, statut: filter, page });
      setTickets(data.tickets);
      setTotal(data.total);
    } catch {
      // Mock data
      setTickets([
        { id: '1', username: 'usr_k9x2m', statut: 'actif', date_expiration: '2025-05-09T14:32:00', type: 'online', routeur: { site: 'Hotel Le Ran' }, commande: { montant: 3000 } },
        { id: '2', username: 'usr_p3n8q', statut: 'actif', date_expiration: '2025-05-08T20:15:00', type: 'online', routeur: { site: 'Cafe du Centre' }, commande: { montant: 1500 } },
        { id: '3', username: 'usr_r7t1w', statut: 'expiré', date_expiration: '2025-05-08T12:00:00', type: 'manuel', routeur: { site: 'Hotel Le Ran' }, commande: { montant: 500 } },
        { id: '4', username: 'usr_v5k4z', statut: 'actif', date_expiration: '2025-05-15T09:45:00', type: 'online', routeur: { site: 'Gare Routiere' }, commande: { montant: 12000 } },
      ]);
      setTotal(4);
    } finally { setLoading(false); }
  };

  const handleDesactiver = async (id: string) => {
    if (!confirm('Desactiver ce ticket ?')) return;
    try { await desactiverTicket(id); loadTickets(); } catch {}
  };

  const handleSupprimer = async (id: string) => {
    if (!confirm('Supprimer definitivement ce ticket ?')) return;
    try { await supprimerTicket(id); loadTickets(); } catch {}
  };

  const handleGenerer = async () => {
    if (!genForm.forfait_id || !genForm.routeur_id) return;
    setGenerating(true);
    try {
      const result = await genererTicketsManuel(genForm);
      setGeneratedTickets(result.tickets);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally { setGenerating(false); }
  };

  const filters = [
    { label: 'Tous', value: '' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Expires', value: 'expiré' },
    { label: 'Desactives', value: 'désactivé' },
  ];

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                ${filter === f.value ? 'border-blue-500 bg-blue-600/10 text-blue-400' : 'border-white/8 text-zinc-500 hover:border-white/15'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher..." className="bg-white/3 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 w-40 font-sans" />
          </div>
          <button onClick={() => { setShowModal(true); setGeneratedTickets([]); }}
            className="btn-primary text-xs py-2 px-3">
            <Plus size={13} /> Generer
          </button>
          <button onClick={loadTickets} className="w-8 h-8 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6">
                {['Utilisateur', 'Statut', 'Type', 'Site', 'Montant', 'Expiration', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Chargement...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Aucun ticket</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-white">{t.username}</td>
                  <td className="px-4 py-3"><Badge status={t.statut} /></td>
                  <td className="px-4 py-3 text-zinc-500 capitalize">{t.type}</td>
                  <td className="px-4 py-3 text-zinc-400">{t.routeur?.site}</td>
                  <td className="px-4 py-3 text-white font-medium">{t.commande?.montant?.toLocaleString('fr')} F</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(t.date_expiration).toLocaleDateString('fr-FR')} {new Date(t.date_expiration).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleDesactiver(t.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Desactiver">
                        <Power size={12} />
                      </button>
                      <button onClick={() => handleSupprimer(t.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Supprimer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between text-xs text-zinc-500">
          <span>{total} ticket{total > 1 ? 's' : ''}</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-2.5 py-1 rounded-lg border border-white/8 text-zinc-400 disabled:opacity-40 hover:border-white/15 transition-colors">
              Precedent
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400">{page}</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 rounded-lg border border-white/8 text-zinc-400 disabled:opacity-40 hover:border-white/15 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modal Génération */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-5">Generer des tickets manuellement</h3>

            {generatedTickets.length === 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Forfait</label>
                  <select value={genForm.forfait_id} onChange={e => setGenForm(f => ({ ...f, forfait_id: e.target.value }))}
                    className="form-input" style={{ background: '#1a1a1a' }}>
                    <option value="">Selectionner un forfait</option>
                    {forfaits.map(f => <option key={f.id} value={f.id}>{f.nom} — {f.prix.toLocaleString('fr')} FCFA</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Site WiFi</label>
                  <select value={genForm.routeur_id} onChange={e => setGenForm(f => ({ ...f, routeur_id: e.target.value }))}
                    className="form-input" style={{ background: '#1a1a1a' }}>
                    <option value="">Selectionner un site</option>
                    {routeurs.map(r => <option key={r.id} value={r.id}>{r.site} — {r.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Quantite (max 50)</label>
                  <input type="number" min={1} max={50} value={genForm.quantite}
                    onChange={e => setGenForm(f => ({ ...f, quantite: parseInt(e.target.value) || 1 }))}
                    className="form-input" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center py-2.5">Annuler</button>
                  <button onClick={handleGenerer} disabled={generating} className="btn-primary flex-1 justify-center py-2.5">
                    {generating ? <><div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Generation...</> : <><Plus size={13} />Generer</>}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  {generatedTickets.length} ticket{generatedTickets.length > 1 ? 's' : ''} genere{generatedTickets.length > 1 ? 's' : ''}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {generatedTickets.map((t, i) => (
                    <div key={i} className="bg-white/3 border border-white/6 rounded-xl px-3 py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-mono text-white text-xs font-medium">{t.username}</p>
                        <p className="font-mono text-zinc-500 text-xs">{t.password}</p>
                      </div>
                      <span className="text-zinc-600 text-xs">{t.forfait}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1 justify-center py-2.5 text-xs" onClick={() => window.print()}>
                    <Printer size={13} /> Imprimer
                  </button>
                  <button onClick={() => { setShowModal(false); loadTickets(); }} className="btn-primary flex-1 justify-center py-2.5 text-xs">
                    Terminer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
