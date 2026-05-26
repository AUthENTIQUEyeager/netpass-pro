'use client';
import { useState } from 'react';
import { Phone, Wifi, Clock, Zap, Copy, CheckCircle } from 'lucide-react';
import API from '@/lib/api';
import Navbar from '@/components/ui/Navbar';

export default function MonTicketPage() {
  const [tel, setTel] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleVerifier = async () => {
    if (!tel || tel.length < 8) return;
    setLoading(true);
    setError('');
    setTicket(null);
    try {
      const data = await API.get(`/api/commandes/client/${tel.replace(/\s/g, '')}`).then(r => r.data);
      setTicket(data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Aucun ticket trouvé pour ce numéro');
    } finally { setLoading(false); }
  };

  const copier = (texte: string, champ: string) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopied(champ);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="max-w-md mx-auto px-6 pt-28 pb-20">

        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Wifi size={24} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Récupérer mon ticket</h1>
          <p className="text-zinc-500 text-sm">Entrez le numéro utilisé lors de votre achat</p>
        </div>

        {/* Formulaire */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 mb-4">
          <label className="block text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Phone size={11} /> Votre numéro WhatsApp
          </label>
          <input
            type="tel"
            placeholder="ex: 77 123 45 67"
            value={tel}
            onChange={e => { setTel(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleVerifier()}
            className="form-input mb-4"
            autoFocus
          />
          <button
            onClick={handleVerifier}
            disabled={loading || tel.length < 8}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  Recherche...
                </span>
              : 'Voir mon ticket'}
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-red-400 text-sm text-center mb-4">
            {error}
            <p className="text-zinc-600 text-xs mt-1">Si vous venez de payer, attendez quelques minutes que le gérant génère votre ticket.</p>
          </div>
        )}

        {/* Ticket trouvé */}
        {ticket && (
          <div className="bg-[#141414] border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-semibold text-sm">Ticket trouvé !</p>
            </div>

            {/* Infos forfait */}
            <div className="bg-white/3 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">{ticket.forfait}</p>
                <p className="text-zinc-500 text-xs">{ticket.site}</p>
              </div>
              <div className="flex items-center gap-1 text-blue-400 text-xs">
                <Zap size={11} /> {ticket.vitesse}
              </div>
            </div>

            {/* Username */}
            <div className="mb-3">
              <p className="text-xs text-zinc-500 mb-1.5">Identifiant</p>
              <div className="flex items-center justify-between bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                <span className="font-mono font-bold text-blue-400 text-lg tracking-wider">{ticket.username}</span>
                <button onClick={() => copier(ticket.username, 'username')}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  {copied === 'username' ? <CheckCircle size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <p className="text-xs text-zinc-500 mb-1.5">Mot de passe</p>
              <div className="flex items-center justify-between bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                <span className="font-mono font-bold text-emerald-400 text-lg tracking-wider">{ticket.password}</span>
                <button onClick={() => copier(ticket.password, 'password')}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  {copied === 'password' ? <CheckCircle size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* Expiration */}
            <div className="flex items-center gap-2 text-zinc-500 text-xs border-t border-white/6 pt-4">
              <Clock size={11} />
              Expire le {formatDate(ticket.date_expiration)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
