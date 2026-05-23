import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

const BADGE = {
  'EN_ATTENTE': 'bg-amber-100 text-amber-800',
  'CONFIRMÉ':   'bg-emerald-100 text-emerald-800',
  'REFUSÉ':     'bg-red-100 text-red-800',
}

function AdminDashboard() {
  const [stats, setStats]             = useState(null)
  const [demandes, setDemandes]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [erreur, setErreur]           = useState('')
  const [actionId, setActionId]       = useState(null)
  const [showMotif, setShowMotif]     = useState(null)
  const [motifRefus, setMotifRefus]   = useState('')

  const charger = async () => {
    setLoading(true); setErreur('')
    try {
      const [s, d] = await Promise.all([adminAPI.getStats(), adminAPI.getEnAttente()])
      setStats(s)
      setDemandes(Array.isArray(d) ? d : [])
    } catch { setErreur('Erreur chargement dashboard.') }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [])

  const valider = async (id) => {
    setActionId(id)
    try {
      await adminAPI.changerStatut(id, 'CONFIRMÉ', null)
      setDemandes(p => p.filter(d => d.id !== id))
      setStats(p => p ? { ...p, enAttente: (p.enAttente||1)-1, confirmees: (p.confirmees||0)+1 } : p)
    } catch (e) { setErreur(e.message) }
    finally { setActionId(null) }
  }

  const refuser = async (id) => {
    setActionId(id)
    try {
      await adminAPI.changerStatut(id, 'REFUSÉ', motifRefus || null)
      setDemandes(p => p.filter(d => d.id !== id))
      setStats(p => p ? { ...p, enAttente: (p.enAttente||1)-1, refusees: (p.refusees||0)+1 } : p)
      setShowMotif(null); setMotifRefus('')
    } catch (e) { setErreur(e.message) }
    finally { setActionId(null) }
  }

  // Clés exactes renvoyées par AdminService.getStats()
  const cartes = stats ? [
    { label: 'Total demandes',     valeur: stats.demandesTotal    ?? '—', icone: 'how_to_reg',    couleur: 'text-primary' },
    { label: 'En attente',         valeur: stats.enAttente        ?? '—', icone: 'pending',        couleur: 'text-amber-600' },
    { label: 'Confirmées',         valeur: stats.confirmees       ?? '—', icone: 'check_circle',   couleur: 'text-emerald-600' },
    { label: 'Refusées',           valeur: stats.refusees         ?? '—', icone: 'cancel',         couleur: 'text-red-500' },
    { label: 'Conflits détectés',  valeur: stats.conflitsDetectes ?? '—', icone: 'warning',        couleur: 'text-orange-500' },
    { label: "Taux d'approbation", valeur: stats.tauxApprobation  ?? '—', icone: 'percent',        couleur: 'text-primary' },
  ] : []

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
      Chargement...
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display text-on-surface">Dashboard</h2>
        <p className="text-on-surface-variant text-sm mt-1">Vue d'ensemble de l'activité du portail</p>
      </div>

      {erreur && (
        <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>{erreur}
          <button onClick={charger} className="ml-auto underline text-xs">Réessayer</button>
        </div>
      )}

      {/* Cartes stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cartes.map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-on-surface-variant">{s.label}</p>
              <span className={`material-symbols-outlined text-lg ${s.couleur}`}>{s.icone}</span>
            </div>
            <p className="text-3xl font-bold text-on-surface">{s.valeur}</p>
          </div>
        ))}
      </div>

      {/* Demandes en attente — à valider/refuser */}
      <div>
        <h3 className="text-lg font-display text-on-surface mb-4">
          Demandes à traiter
          {demandes.length > 0 && (
            <span className="ml-2 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{demandes.length}</span>
          )}
        </h3>

        {demandes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 block opacity-40">task_alt</span>
            <p className="font-medium">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-container">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Organisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Événement</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">Date · Créneau</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {demandes.map(d => (
                  <tr key={d.id} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{d.organisateurNom}</p>
                      <p className="text-xs text-on-surface-variant">{d.departement}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="font-medium text-on-surface">{d.titreEvenement}</p>
                      <p className="text-xs text-on-surface-variant">{d.typeEvenement} · {d.salle}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                      <p>{d.date}</p><p className="text-xs">{d.creneau}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => valider(d.id)} disabled={actionId === d.id}
                          className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          {actionId === d.id
                            ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                            : <span className="material-symbols-outlined text-sm">check</span>}
                          Valider
                        </button>
                        <button onClick={() => setShowMotif(d.id)} disabled={actionId === d.id}
                          className="flex items-center gap-1 bg-surface-container hover:bg-red-50 text-on-surface-variant hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          <span className="material-symbols-outlined text-sm">close</span>Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal motif refus */}
      {showMotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-lg font-display text-on-surface mb-4">Motif de refus</h3>
            <p className="text-sm text-on-surface-variant mb-4">Optionnel — sera communiqué à l'organisateur.</p>
            <textarea value={motifRefus} onChange={e => setMotifRefus(e.target.value)} rows={4}
              placeholder="Ex: Créneau déjà réservé..."
              className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-3 rounded-t-lg outline-none text-sm resize-none transition-all" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowMotif(null); setMotifRefus('') }}
                className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-sm font-medium">
                Annuler
              </button>
              <button onClick={() => refuser(showMotif)} disabled={actionId === showMotif}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-error text-on-error text-sm font-bold hover:opacity-90 disabled:opacity-50">
                {actionId === showMotif && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard