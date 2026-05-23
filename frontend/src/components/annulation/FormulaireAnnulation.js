import { useState, useEffect } from 'react'
import { reservationsAPI } from '../../services/api'

function FormulaireAnnulation() {
  const [reservations, setReservations]   = useState([])
  const [loadingResa, setLoadingResa]     = useState(true)
  const [form, setForm]                   = useState({ idReservation: '', motif: '', confirme: false })
  const [erreur, setErreur]               = useState('')
  const [loading, setLoading]             = useState(false)
  const [showPopup, setShowPopup]         = useState(false)

  useEffect(() => {
    const charger = async () => {
      setLoadingResa(true)
      try {
        const data = await reservationsAPI.mesDemandes()
        // ⚠️ Seul EN_ATTENTE peut être annulé par l'étudiant
        // CONFIRMÉ → le backend renvoie 409 ConflitException
        const annulables = (Array.isArray(data) ? data : []).filter(r =>
          (r.statut || '').toUpperCase() === 'EN_ATTENTE'
        )
        setReservations(annulables)
      } catch {
        setErreur('Impossible de charger vos réservations.')
      } finally {
        setLoadingResa(false)
      }
    }
    charger()
  }, [])

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.idReservation) { setErreur('Veuillez sélectionner une réservation.'); return }
    if (!form.motif.trim())  { setErreur("Veuillez indiquer un motif d'annulation."); return }
    if (!form.confirme)      { setErreur('Veuillez cocher la case de confirmation.'); return }

    setLoading(true)
    setErreur('')
    try {
      await reservationsAPI.annuler(form.idReservation)
      setReservations(prev => prev.filter(r => String(r.id) !== String(form.idReservation)))
      setForm({ idReservation: '', motif: '', confirme: false })
      setShowPopup(true)
    } catch (err) {
      // 409 = déjà confirmée ou déjà refusée
      setErreur(err.message || "Erreur lors de l'annulation.")
    } finally {
      setLoading(false)
    }
  }

  const ic = "w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-3 rounded-t-lg transition-all outline-none text-on-surface text-sm"
  const selected = reservations.find(r => String(r.id) === String(form.idReservation))

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">check</span>
            </div>
            <h2 className="text-2xl font-display text-primary mb-3">Annulation Confirmée</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Votre annulation a été enregistrée avec succès.
            </p>
            <button onClick={() => setShowPopup(false)}
              className="flex items-center gap-2 mx-auto bg-primary text-on-primary font-bold px-8 py-3 rounded-lg transition-all hover:scale-[1.01]">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Retour
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-display text-on-surface mb-6">Formulaire d'Annulation</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Réservation à annuler *
              </label>
              {loadingResa ? (
                <div className="flex items-center gap-2 text-on-surface-variant text-sm py-3">
                  <span className="material-symbols-outlined animate-spin text-primary text-base">progress_activity</span>
                  Chargement...
                </div>
              ) : reservations.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5">info</span>
                  <span>
                    Aucune demande <strong>EN ATTENTE</strong> à annuler.<br />
                    Les réservations déjà confirmées ne peuvent pas être annulées ici — contactez l'administration.
                  </span>
                </div>
              ) : (
                <select name="idReservation" value={form.idReservation} onChange={handleChange}
                  className={ic + ' appearance-none cursor-pointer'}>
                  <option value="">Sélectionner une réservation...</option>
                  {reservations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.titreEvenement} — {r.date} ({r.creneau})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selected && (
              <div className="bg-surface-container-low rounded-lg p-4 text-sm space-y-1 border border-outline-variant/20">
                <p><span className="font-bold text-on-surface-variant">Type :</span> {selected.typeEvenement}</p>
                <p><span className="font-bold text-on-surface-variant">Salle :</span> {selected.salle}</p>
                <p><span className="font-bold text-on-surface-variant">Créneau :</span> {selected.creneau}</p>
                <p>
                  <span className="font-bold text-on-surface-variant">Statut : </span>
                  <span className="text-amber-600 font-semibold">EN ATTENTE</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Motif d'Annulation *
              </label>
              <textarea name="motif" placeholder="Expliquez brièvement la raison de votre annulation..."
                value={form.motif} onChange={handleChange} rows={4}
                className={ic + ' resize-none'} />
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" name="confirme" id="confirme" checked={form.confirme}
                onChange={handleChange} className="mt-1 w-4 h-4 accent-primary cursor-pointer" />
              <label htmlFor="confirme" className="text-sm text-on-surface-variant cursor-pointer">
                Je confirme vouloir annuler cette réservation. Cette action est définitive.
              </label>
            </div>

            {erreur && (
              <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>{erreur}
              </div>
            )}

            <button type="submit" disabled={loading || reservations.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold px-8 py-3 rounded-lg shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Envoi...</>
                : <><span className="material-symbols-outlined text-sm">cancel</span>Confirmer l'annulation</>
              }
            </button>

          </form>
        </div>
      </div>
    </>
  )
}

export default FormulaireAnnulation