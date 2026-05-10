'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Wifi, Package, CreditCard, Ticket, Zap } from 'lucide-react';
import { getForfaits, getRouteurs } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

export default function HomePage() {
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [routeurs, setRouteurs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getForfaits().then(setForfaits).catch(() => {});
    getRouteurs().then(setRouteurs).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-16">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(37,99,235,0.05)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 backdrop-blur-sm"
            style={{ border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.05)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-medium">Plateforme active — connexion instantanee</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.04] tracking-tight mb-6">
            <span className="text-white">Acces WiFi</span><br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 bg-clip-text text-transparent">
              instantane et automatise
            </span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Payez avec Wave et connectez-vous immediatement grace a une gestion intelligente des tickets WiFi.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => router.push('/forfaits')} className="btn-primary text-base px-7 py-3.5 rounded-xl group">
              Acheter maintenant
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => router.push('/forfaits')} className="btn-ghost text-base px-7 py-3.5 rounded-xl">
              Voir les forfaits <ChevronRight size={16} />
            </button>
          </div>

          {routeurs.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-zinc-600 text-xs">Disponible sur :</span>
              {routeurs.map(r => (
                <span key={r.id} className="px-3 py-1 rounded-full text-zinc-400 text-xs"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${r.statut === 'actif' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {r.site}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <div className="py-16 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Utilisateurs connectes', value: '247+' },
            { label: 'Tickets generes', value: '14,820+' },
            { label: 'Uptime reseau', value: '99.9%' },
            { label: 'Vitesse moyenne', value: '48 Mbps' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{value}</div>
              <div className="text-zinc-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ETAPES */}
      <section className="py-24 px-6 bg-[#0a0a0a]" id="fonctionnement">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connexion en 4 etapes</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Un processus simplifie pour vous connecter en moins d'une minute.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Package, label: 'Choisir un forfait', desc: 'Selectionnez la duree et la vitesse adaptees.' },
              { icon: CreditCard, label: 'Payer avec Wave', desc: 'Paiement securise en quelques secondes.' },
              { icon: Ticket, label: 'Recevoir le ticket', desc: 'Vos identifiants sont generes instantanement.' },
              { icon: Wifi, label: 'Se connecter', desc: 'Connectez-vous au WiFi avec vos identifiants.' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-2xl bg-[#141414] flex items-center justify-center mb-5 transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon size={22} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#0f0f0f] flex items-center justify-center text-xs text-zinc-500 font-semibold"
                    style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{label}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORFAITS */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Forfaits disponibles</h2>
            <p className="text-zinc-500">Choisissez le forfait qui correspond a vos besoins.</p>
          </div>
          {forfaits.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-4">
              {forfaits.map((plan, i) => (
                <div key={plan.id}
                  className="relative rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{
                    border: i === 1 ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: i === 1 ? 'linear-gradient(to bottom,rgba(37,99,235,0.08),#141414)' : '#141414',
                    boxShadow: i === 1 ? '0 0 40px rgba(37,99,235,0.12)' : 'none'
                  }}
                  onClick={() => router.push('/forfaits')}>
                  {i === 1 && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-xs font-semibold"
                      style={{ boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}>
                      Populaire
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">{plan.nom}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{plan.prix.toLocaleString('fr')}</span>
                      <span className="text-zinc-500 text-xs">FCFA</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap size={11} className="text-blue-400" />
                      <span className="text-blue-400 text-xs">{plan.vitesse}</span>
                    </div>
                  </div>
                  <button className={`w-full py-2.5 rounded-xl text-xs font-medium mt-auto transition-all ${i === 1 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'text-zinc-300'}`}
                    style={i !== 1 ? { border: '1px solid rgba(255,255,255,0.10)' } : {}}>
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-600 py-12">Chargement des forfaits...</div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.2)' }}>
              <Wifi size={14} className="text-blue-400" />
            </div>
            <span className="text-zinc-500 text-sm">NetPass Pro — Plateforme WiFi intelligente</span>
          </div>
          <p className="text-zinc-600 text-xs">Infrastructure propulsee par MikroTik</p>
        </div>
      </footer>
    </div>
  );
}
