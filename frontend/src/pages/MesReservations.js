import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FiltreReservations from '../components/reservations/FiltreReservations'
import ListeReservations from '../components/reservations/ListeReservations'
import { reservationsAPI } from '../services/api'

// Le backend renvoie les statuts en MAJUSCULES avec underscore : EN_ATTENTE, CONFIRMÉ, REFUSÉ
function MesReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [erreur, setErreur]             = useState('')
  const [filtreActif, setFiltreActif]   = useState('Tout')

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true)
      setErreur('')
      try {
        const data = await reservationsAPI.mesDemandes()
        // data est un tableau de DemandeResponse
        setReservations(Array.isArray(data) ? data : [])
      } catch (err) {
        setErreur('Erreur lors du chargement des réservations.')
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  const reservationsFiltrees = reservations.filter((r) => {
    if (filtreActif === 'Tout') return true
    const s = (r.statut || '').toUpperCase()
    if (filtreActif === 'Confirmé')   return s === 'CONFIRMÉ' || s === 'CONFIRME'
    if (filtreActif === 'En attente') return s === 'EN_ATTENTE'
    if (filtreActif === 'Refusé')     return s === 'REFUSÉ'   || s === 'REFUSE'
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="etudiant" />

      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-3xl font-display text-on-surface mb-8">Mes Réservations</h1>

          <FiltreReservations filtreActif={filtreActif} onFiltreChange={setFiltreActif} />

          {erreur && (
            <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-base">error</span>{erreur}
            </div>
          )}

          {loading ? (
            <div className="text-center text-on-surface-variant py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl block mb-2">progress_activity</span>
              Chargement...
            </div>
          ) : reservationsFiltrees.length === 0 ? (
            <div className="text-center text-on-surface-variant py-12">
              <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">inbox</span>
              <p>Aucune réservation{filtreActif !== 'Tout' ? ` avec le statut "${filtreActif}"` : ''}.</p>
            </div>
          ) : (
            <ListeReservations reservations={reservationsFiltrees} />
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MesReservations