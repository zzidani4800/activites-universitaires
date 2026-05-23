import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

// Les "événements" dans ce contexte = toutes les demandes de réservation (confirmées ou non)
function AdminEvenements() {
  const [demandes, setDemandes]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [erreur, setErreur]         = useState('')
  const [recherche, setRecherche]   = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')

  useEffect(() => {
    const charger = async () => {
      setLoading(true); setErreur('')
      try {
        const data = await adminAPI.getToutesReservations()
        setDemandes(Array.isArray(data) ? data : [])
      } catch { setErreur('Erreur chargement des réservations.') }
      finally { setLoading(false) }
    }
    charger()
  }, [])

  // ✅ AJOUT DU BADGE "ANNULE"
  const BADGE = {
    'EN_ATTENTE': 'bg-amber-100 text-amber-800',
    'CONFIRMÉ':   'bg-emerald-100 text-emerald-800',
    'REFUSÉ':     'bg-red-100 text-red-800',
    'ANNULE':     'bg-gray-100 text-gray-600',
  }

  const filtrees = demandes.filter(d => {
    const matchStatut = filtreStatut === 'TOUS' || d.statut === filtreStatut
    const matchRecherche = !recherche ||
      `${d.titreEvenement} ${d.organisateurNom} ${d.salle}`.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>Chargement...
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-on-surface">Événements</h2>
        <p className="text-on-surface-variant text-sm mt-1">Toutes les demandes de réservation</p>
      </div>

      {erreur && (
        <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>{erreur}
        </div>
      )}

      {/* Filtres - AJOUT DE 'ANNULE' */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input type="text" placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/30 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-primary text-sm" />
        </div>
        {['TOUS', 'EN_ATTENTE', 'CONFIRMÉ', 'REFUSÉ', 'ANNULE'].map(s => (
          <button key={s} onClick={() => setFiltreStatut(s)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              filtreStatut === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}>
            {s === 'TOUS' ? 'Tous' : 
             s === 'ANNULE' ? 'Annulé' : 
             s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtrees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-3 block opacity-40">event_busy</span>
          <p className="font-medium">Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Titre</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Organisateur</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">Date · Salle</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtrees.map(d => (
                <tr key={d.id} className={`bg-surface-container-lowest hover:bg-surface-container transition-colors ${d.enConflit ? 'border-l-2 border-orange-400' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{d.titreEvenement}</p>
                    <p className="text-xs text-on-surface-variant">{d.typeEvenement} · {d.departement}</p>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{d.organisateurNom}</td>
                  <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                    <p>{d.date}</p><p className="text-xs">{d.salle} · {d.creneau}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${BADGE[d.statut] ?? 'bg-surface-container text-on-surface-variant'}`}>
                        {d.statut === 'ANNULE' ? 'Annulé' : (d.statut || '').replace('_', ' ')}
                      </span>
                      {d.enConflit && (
                        <span title="Conflit de créneau" className="material-symbols-outlined text-orange-500 text-base">warning</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminEvenements