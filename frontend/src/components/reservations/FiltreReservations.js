function FiltreReservations({ filtreActif, onFiltreChange }) {
  // ← ajout de 'Refusé'
  const filtres = ['Tout', 'Confirmé', 'En attente', 'Refusé']

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {filtres.map((filtre) => (
        <button
          key={filtre}
          onClick={() => onFiltreChange(filtre)}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
            filtreActif === filtre
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {filtre}
        </button>
      ))}
    </div>
  )
}

export default FiltreReservations