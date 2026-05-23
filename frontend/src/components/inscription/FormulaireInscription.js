import { useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import { reservationsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

// ⚠️  Valeurs EXACTES des enums backend (DemandeReservation.java)
const DEPARTEMENTS = [
  { label: 'Chimie',        value: 'CHIMIE' },
  { label: 'Biologie',      value: 'BIOLOGIE' },
  { label: 'Informatique',  value: 'INFORMATIQUE' },
  { label: 'Physique',      value: 'PHYSIQUE' },
  { label: 'Mathématique',  value: 'MATHEMATIQUE' },   // pas MATHEMATIQUES
]

const TYPES_EVENEMENT = [
  { label: 'Conférence',  value: 'CONFERENCE' },
  { label: 'Séminaire',   value: 'SEMINAIRE' },
  { label: 'Atelier',     value: 'ATELIER' },
  { label: 'Sport',       value: 'SPORT' },
  { label: 'Culturel',    value: 'CULTUREL' },
  { label: 'Autre',       value: 'AUTRE' },            // pas HACKATON
]

const TYPES_SALLE = [
  { label: 'Amphithéâtre',     value: 'AMPHI' },
  { label: 'Grand amphithéâtre', value: 'AMPHI_THEATRE' },
  { label: 'Salle polyvalente', value: 'SALLE_POLYVALENTE' },
  { label: 'Salle',            value: 'SALLE' },
  { label: 'Laboratoire',      value: 'LABORATOIRE' },
]

const CRENEAUX = [
  '08:30-10:30',
  '10:30-12:30',
  '14:00-16:00',
  '16:00-18:00',
]

function FormulaireInscription() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    titreEvenement: '',
    departement:    '',
    typeEvenement:  '',
    description:    '',
    salle:          '',
    date:           '',
    creneau:        '',
    motivation:     '',
  })
  const [erreur, setErreur]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { titreEvenement, departement, typeEvenement, salle, date, creneau, motivation } = form
    if (!titreEvenement || !departement || !typeEvenement || !salle || !date || !creneau || !motivation) {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setLoading(true)
    setErreur('')

    try {
      await reservationsAPI.creer({
        titreEvenement,
        departement,
        typeEvenement,
        description: form.description,
        salle,
        date,          // format "YYYY-MM-DD" — compatible LocalDate Spring
        creneau,
        motivation,
      })
      setShowPopup(true)
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la soumission. Vérifiez vos informations.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ titreEvenement: '', departement: '', typeEvenement: '', description: '', salle: '', date: '', creneau: '', motivation: '' })
    setErreur('')
  }

  const ic = "w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-3 rounded-t-lg transition-all outline-none text-on-surface placeholder:text-outline/50 text-sm"

  return (
    <>
      {showPopup && <ConfirmationPopup onFermer={() => { setShowPopup(false); handleReset() }} />}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>

          {/* ── Section I — Organisateur ── */}
          <div className="p-8 border-b border-outline-variant/20">
            <h2 className="text-xl font-display text-on-surface mb-6 flex items-center gap-2">
              <span className="text-primary text-sm font-bold">I.</span> Informations de l'Organisateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nom</label>
                <input type="text" value={user?.nom || ''} disabled className={ic + ' opacity-60 cursor-not-allowed'} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Prénom</label>
                <input type="text" value={user?.prenom || ''} disabled className={ic + ' opacity-60 cursor-not-allowed'} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
                <input type="email" value={user?.email || ''} disabled className={ic + ' opacity-60 cursor-not-allowed'} />
              </div>
            </div>
          </div>

          {/* ── Section II — Contexte Académique ── */}
          <div className="p-8 border-b border-outline-variant/20">
            <h2 className="text-xl font-display text-on-surface mb-6 flex items-center gap-2">
              <span className="text-primary text-sm font-bold">II.</span> Contexte Académique
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Titre de l'Événement *</label>
                <input name="titreEvenement" type="text" placeholder="Ex: Atelier React Avancé" value={form.titreEvenement} onChange={handleChange} className={ic} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Département *</label>
                <select name="departement" value={form.departement} onChange={handleChange} className={ic + ' appearance-none cursor-pointer'}>
                  <option value="">Sélectionner...</option>
                  {DEPARTEMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Type d'Événement *</label>
                <select name="typeEvenement" value={form.typeEvenement} onChange={handleChange} className={ic + ' appearance-none cursor-pointer'}>
                  <option value="">Sélectionner...</option>
                  {TYPES_EVENEMENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
                <textarea name="description" placeholder="Décrivez brièvement l'événement..." value={form.description} onChange={handleChange} rows={3} className={ic + ' resize-none'} />
              </div>
            </div>
          </div>

          {/* ── Section III — Logistique ── */}
          <div className="p-8">
            <h2 className="text-xl font-display text-on-surface mb-6 flex items-center gap-2">
              <span className="text-primary text-sm font-bold">III.</span> Détails Logistiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Date *</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} className={ic} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Créneau *</label>
                <select name="creneau" value={form.creneau} onChange={handleChange} className={ic + ' appearance-none cursor-pointer'}>
                  <option value="">Choisir...</option>
                  {CRENEAUX.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Salle *</label>
                <select name="salle" value={form.salle} onChange={handleChange} className={ic + ' appearance-none cursor-pointer'}>
                  <option value="">Choisir...</option>
                  {TYPES_SALLE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Motivation *</label>
              <textarea name="motivation" placeholder="Expliquez l'intérêt pédagogique ou scientifique de cet événement..." value={form.motivation} onChange={handleChange} rows={5} className={ic + ' resize-none'} />
            </div>

            {erreur && (
              <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-base">error</span>
                {erreur}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button type="button" onClick={handleReset} className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4">
                Annuler la saisie
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold px-8 py-3 rounded-lg shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60">
                {loading
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Envoi...</>
                  : <>Soumettre la demande<span className="material-symbols-outlined text-sm">send</span></>
                }
              </button>
            </div>
          </div>

        </form>
      </div>
    </>
  )
}

export default FormulaireInscription