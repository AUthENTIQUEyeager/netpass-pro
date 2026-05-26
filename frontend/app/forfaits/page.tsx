'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Zap, Shield, Star, X, Phone, Search } from 'lucide-react';
import { getForfaits, getRouteurs } from '@/lib/api';
import API from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';

export default function ForfaitsPage() {
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [routeurs, setRouteurs] = useState<any[]>([]);
  const [selectedRouteur, setSelectedRouteur] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState<any>(null);
  const [clientTel, setClientTel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getForfaits().then(setForfaits).catch(() => setError('Erreur chargement forfaits'));
    getRouteurs().then(data => {
      setRouteurs(data);
      if (data.length === 1) setSelectedRouteur(data[0].id);
    }).catch(() => {});
  }, []);

  const handleAchat = (forfait: any) => {
    if (!selectedRouteur) { setError('Veuillez sélectionner un site WiFi'); return; }
    setError('');
    setSelectedForfait(forfait);
    setClientTel('');
    setShowPopup(true);
  };

  const handleConfirmerPaiement = async () => {
    if (!clientTel || clientTel.length < 8) return;
    setLoading(true);
    try {
      const data = await API.post('/api/commandes', {
        forfait_id: selectedForfait.id,
        routeur_id: selectedRouteur,
        client_tel: clientTel
      }).then(r => r.data);

      // Redirect to Wave checkout URL returned by backend
      window.location.href = data.checkout_url;
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.error || 'Erreur lors de la création de la commande');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20">

        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Choisissez votre forfait</h1>
          <p className="text-zinc-500 text-lg font-light">Payez avec Wave, recevez votre ticket instantanément.</p>
        </div>

        {routeurs.length > 1 && (
          <div className="mb-10 max-w-sm mx-auto">
            <label className="block text-xs text-zinc-500 font-medium mb-2 uppercase tracking-widest">Site WiFi</label>
            <select value={selectedRouteur} onChange={e => setSelectedRouteur(e.target.value)}
              className="form-input" style={{ background: '#141414' }}>
              <option value="">Sélectionnez un site</option>
              {routeurs.map(r => (
                <option key={r.id} value={r.id} disabled={r.statut !== 'actif'}>
                  {r.site} — {r.nom} {r.statut !== 'actif' ? '(Hors ligne)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-6 max-w-md mx-auto rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {forfaits.map((plan, i) => (
            <div key={plan.id}
              className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1
                ${i === 1
                  ? 'border-blue-500/50 bg-gradient-to-b from-blue-600/8 to-transparent shadow-[0_0_50px_rgba(37,99,235,0.12)]'
                  : 'border-white/8 bg-[#141414] hover:border-white/15'}`}>

              {i === 1 && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                  px-3 py-1 rounded-full bg-blue-600 text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                  <Star size={9} fill="currentColor" /> Populaire
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4
                ${i === 1 ? 'bg-blue-600/20' : 'bg-white/4 border border-white/6'}`}>
                <Zap size={17} className={i === 1 ? 'text-blue-400' : 'text-zinc-500'} />
              </div>

              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">{plan.nom}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-3xl font-bold">{plan.prix.toLocaleString('fr')}</span>
                <span className="text-zinc-500 text-sm">FCFA</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs mb-5">
                <Zap size={11} className="text-blue-400" />
                <span className="text-blue-400 font-medium">{plan.vitesse}</span>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {(plan.description ? plan.description.split(',') : [`${plan.duree_heures}h de connexion`, 'Ticket instantané', 'Support inclus']).map((f: string, fi: number) => (
                  <li key={fi} className="flex items-start gap-2 text-zinc-400 text-sm">
                    <CheckCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    {f.trim()}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleAchat(plan)}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${i === 1
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'}`}>
                Payer avec Wave
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <div className="flex-1 rounded-2xl border border-white/6 bg-[#141414] p-5 flex items-center gap-4">
            <Shield size={26} className="text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold mb-1">Paiement sécurisé via Wave</p>
              <p className="text-zinc-500 text-xs">Votre ticket vous sera envoyé après confirmation.</p>
            </div>
          </div>

          <Link href="/mon-ticket"
            className="flex items-center justify-center gap-2 px-6 rounded-2xl border border-blue-500/20 bg-blue-600/5 hover:bg-blue-600/10 text-blue-400 text-sm font-medium transition-all">
            <Search size={15} />
            Récupérer mon ticket
          </Link>
        </div>
      </div>

      {/* POPUP NUMÉRO */}
      {showPopup && selectedForfait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative z-10 w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl p-6">
            <button onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors">
              <X size={16} />
            </button>

            <div className="mb-5">
              <p className="text-white font-semibold text-sm mb-1">Avant de payer</p>
              <p className="text-zinc-500 text-xs">
                Laissez votre numéro pour récupérer votre ticket après paiement.
              </p>
            </div>

            <div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 mb-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-semibold">{selectedForfait.nom}</p>
                  <p className="text-zinc-500 text-xs">{selectedForfait.vitesse} — {selectedForfait.duree_heures}h</p>
                </div>
                <span className="text-white font-bold text-sm">{selectedForfait.prix.toLocaleString('fr')} F</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                <Phone size={11} /> Votre numéro WhatsApp
              </label>
              <input type="tel" placeholder="ex: 77 123 45 67" value={clientTel}
                onChange={e => setClientTel(e.target.value)}
                className="form-input" autoFocus />
            </div>

            <button onClick={handleConfirmerPaiement} disabled={loading || clientTel.length < 8}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
              {loading ? 'Redirection...' : 'Continuer vers Wave →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
