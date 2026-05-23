import { useNavigate } from 'react-router-dom'

function CarteReservation({ reservation }) {
  const navigate = useNavigate()

  // Statuts exacts renvoyés par le backend
  const badgeStyle = {
    'CONFIRMÉ':   'bg-green-100 text-green-800',
    'EN_ATTENTE': 'bg-amber-100 text-amber-800',
    'REFUSÉ':     'bg-red-100 text-red-800',
  }

  const statut = reservation.statut || ''

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">

      <div className="flex items-start justify-between mb-4">
        {/* backend : titreEvenement (pas titre) */}
        <h3 className="font-display text-on-surface text-lg">{reservation.titreEvenement}</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${badgeStyle[statut] ?? 'bg-surface-container text-on-surface-variant'}`}>
          {statut.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <span className="material-symbols-outlined text-base">calendar_today</span>
          {reservation.date} {reservation.creneau && `· ${reservation.creneau}`}
        </div>
        {/* backend : salle (pas lieu) */}
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <span className="material-symbols-outlined text-base">location_on</span>
          {reservation.salle}
        </div>
        {reservation.typeEvenement && (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-base">category</span>
            {reservation.typeEvenement}
          </div>
        )}
        {reservation.motifRefus && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
            <span className="material-symbols-outlined text-base">info</span>
            Motif : {reservation.motifRefus}
          </div>
        )}
      </div>

      {statut === 'REFUSÉ' ? (
        <p className="text-center text-sm text-on-surface-variant py-2 border border-outline-variant/20 rounded-lg">
          Réservation refusée
        </p>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/annulation')}
            className="flex-1 border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary font-bold py-2 rounded-lg text-sm transition-all"
          >
            Annuler
          </button>
        </div>
      )}

    </div>
  )
}

export default CarteReservation