import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, clearAuth, setAuth, getUser } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082'

const ROLES = [
  { label: 'Étudiant',   value: 'ETUDIANT' },
  { label: 'Professeur', value: 'PROFESSEUR' },
  { label: 'Admin',      value: 'ADMIN' },
]

const DEPARTEMENTS = [
  { label: 'Informatique',  value: 'INFORMATIQUE' },
  { label: 'Chimie',        value: 'CHIMIE' },
  { label: 'Physique',      value: 'PHYSIQUE' },
  { label: 'Biologie',      value: 'BIOLOGIE' },
  { label: 'Mathématiques', value: 'MATHEMATIQUES' },
]

const MESSAGES_ERREUR = {
  'prenom : must not be blank':       'Le prénom est obligatoire.',
  'nom : must not be blank':          'Le nom est obligatoire.',
  'email : must not be blank':        "L'email est obligatoire.",
  'email : must be a well-formed email address': "L'email n'est pas valide.",
  'motDePasse : must not be blank':   'Le mot de passe est obligatoire.',
  'motDePasse : size must be between 6': 'Le mot de passe doit contenir au moins 6 caractères.',
}

const traduireErreur = (msg = '') => {
  for (const [cle, val] of Object.entries(MESSAGES_ERREUR)) {
    if (msg.includes(cle)) return val
  }
  if (msg.includes('email') && msg.includes('utilisé')) return 'Cet email est déjà utilisé.'
  if (msg.includes('APOGÉE') || msg.includes('numeroEtudiant')) return 'Ce numéro APOGÉE est déjà enregistré.'
  return msg
}

function AdminCreerUtilisateur() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', numeroEtudiant: '',
    motDePasse: '', role: 'ETUDIANT', departement: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur]   = useState('')
  const [voirMDP, setVoirMDP] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const valider = () => {
    if (!form.prenom.trim()) return 'Le prénom est obligatoire.'
    if (!form.nom.trim())    return 'Le nom est obligatoire.'
    if (!form.email.trim())  return "Vous devez remplir ce champ avec une adresse Gmail"
    if (!form.motDePasse || form.motDePasse.length < 6)
      return 'Le mot de passe doit contenir au moins 6 caractères.'
    return null
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setErreur(''); setMessage('')
  const erreurLocale = valider()
  if (erreurLocale) { setErreur(erreurLocale); return }

  setLoading(true)
  try {
    const adminToken = getToken()
    
    // Vérifier que le token existe
    if (!adminToken) {
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        prenom:         form.prenom,
        nom:            form.nom,
        email:          form.email,
        motDePasse:     form.motDePasse,
        numeroEtudiant: form.numeroEtudiant || null,
        role:           form.role,
        departement:    form.departement || null,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.detail || err.message || `Erreur ${response.status}`)
    }

    // ✅ Succès - ne pas toucher au token admin
    setMessage(`✓ Utilisateur ${form.prenom} ${form.nom} créé avec succès !`)
    setForm({ prenom: '', nom: '', email: '', numeroEtudiant: '', motDePasse: '', role: 'ETUDIANT', departement: '' })
    
    // Rediriger vers le dashboard après 2 secondes
    setTimeout(() => {
      navigate('/admin/dashboard')
    }, 2000)
    
  } catch (err) {
    console.error('Erreur création:', err)
    setErreur(traduireErreur(err.message))
  } finally {
    setLoading(false)
  }
}

  const ic = "w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-3 rounded-t-lg transition-all outline-none text-on-surface text-sm placeholder:text-outline/50"

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="admin" />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto">

          <div className="mb-8">
            <button onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
              <span className="material-symbols-outlined text-base">arrow_back</span>Retour au dashboard
            </button>
            <h1 className="text-3xl font-display text-on-surface">Créer un utilisateur</h1>
            <p className="text-on-surface-variant text-sm mt-1">Le compte sera immédiatement actif.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8">



            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Zinedine" className={ic} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange} placeholder="Zidane" className={ic} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="z.zidane@gmail.com" className={ic} />

              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Numéro étudiant (APOGÉE)</label>
                <input name="numeroEtudiant" value={form.numeroEtudiant} onChange={handleChange}
                  placeholder="20001234" className={ic} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Mot de passe * (min. 6 caractères)</label>
                <div className="relative">
                  <input name="motDePasse" type={voirMDP ? 'text' : 'password'} value={form.motDePasse}
                    onChange={handleChange} placeholder="••••••••" className={ic + ' pr-12'} />
                  <button type="button" onClick={() => setVoirMDP(!voirMDP)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">{voirMDP ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Rôle *</label>
                  <select name="role" value={form.role} onChange={handleChange} className={ic + " appearance-none cursor-pointer"}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Département</label>
                  <select name="departement" value={form.departement} onChange={handleChange} className={ic + " appearance-none cursor-pointer"}>
                    <option value="">Aucun</option>
                    {DEPARTEMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {erreur && (
                <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{erreur}
                </div>
              )}
              {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>{message}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-lg shadow transition-all disabled:opacity-60">
                {loading
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Création...</>
                  : <><span className="material-symbols-outlined text-sm">person_add</span>Créer l'utilisateur</>
                }
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminCreerUtilisateur