'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Power, Link } from 'lucide-react';
import { getForfaits, creerForfait, modifierForfait } from '@/lib/api';

const emptyForm = { nom: '', duree_heures: 1, prix: 0, vitesse: '', description: '', wave_link: '' };

export default function ForfaitsPage() {
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadForfaits(); }, []);

  const loadForfaits = () => {
    getForfaits().then(setForfaits).catch(() => setForfaits([]));
  };

  const handleEdit = (f: any) => {
    setForm({ nom: f.nom, duree_heures: f.duree_heures, prix: f.prix, vitesse: f.vitesse, description: f.description || '', wave_link: f.wave_link || '' });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const handleSave = async () => {
    if (!form.nom || !form.vitesse) return alert('Nom et vitesse requis');
    setSaving(true);
    try {
      if (editId) {
        await modifierForfait(editId, form);
      } else {
        await creerForfait(form);
      }
      loadForfaits();
      handleCancel();
    } catch (e: any) { alert(e.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };

  const toggleActif = async (f: any) => {
    try {
      await modifierForfait(f.id, { actif: !f.actif });
      loadForfaits();
    } catch {}
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-sm">{forfaits.length} forfait{forfaits.length > 1 ? 's' : ''} configurés</p>
        <button onClick={() => { handleCancel(); setShowForm(true); }} className="btn-primary text-xs py-2 px-3">
          <Plus size={13} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="gcard space-y-4">
          <p className="text-white font-semibold text-sm">{editId ? 'Modifier le forfait' : 'Nouveau forfait'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Nom</label>
              <input className="form-input" placeholder="ex: 3 Heures" value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Durée (heures)</label>
              <input type="number" className="form-input" value={form.duree_heures}
                onChange={e => setForm(f => ({ ...f, duree_heures: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Prix (FCFA)</label>
              <input type="number" className="form-input" value={form.prix}
                onChange={e => setForm(f => ({ ...f, prix: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Vitesse</label>
              <input className="form-input" placeholder="ex: 25 Mbps" value={form.vitesse}
                onChange={e => setForm(f => ({ ...f, vitesse: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Description (séparée par virgules)</label>
            <input className="form-input" placeholder="Connexion immédiate, 2 appareils, Support inclus"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 flex items-center gap-1.5">
              <Link size={11} /> Lien Wave (copiez depuis l'app Wave Business)
            </label>
            <input className="form-input font-mono text-xs" placeholder="https://pay.wave.com/m/..."
              value={form.wave_link} onChange={e => setForm(f => ({ ...f, wave_link: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-2.5 text-xs">
              {saving ? 'Sauvegarde...' : editId ? 'Modifier' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {forfaits.map(f => (
          <div key={f.id} className="gcard !p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${f.actif ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <div>
                <p className="text-white font-semibold text-sm">{f.nom}</p>
                <p className="text-zinc-500 text-xs">{f.vitesse} — {f.duree_heures}h</p>
                {f.wave_link
                  ? <p className="text-emerald-500 text-xs mt-0.5 flex items-center gap-1"><Link size={9} /> Lien Wave configuré</p>
                  : <p className="text-amber-500 text-xs mt-0.5">⚠ Lien Wave manquant</p>
                }
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">{f.prix.toLocaleString('fr')} FCFA</span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(f)}
                  className="w-7 h-7 rounded-lg bg-white/3 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => toggleActif(f)}
                  className="w-7 h-7 rounded-lg bg-white/3 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-colors">
                  <Power size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
