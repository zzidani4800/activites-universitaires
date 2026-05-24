import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

function LoginAdmin() {
  const [voirMDP, setVoirMDP] = useState(false)
  const [email, setEmail]     = useState('')
  const [mdp, setMdp]         = useState('')
  const [erreur, setErreur]   = useState('')
  const [chargement, setChargement] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleConnexion = async (e) => {
    e.preventDefault()
    if (!email || !mdp) {
      setErreur('Veuillez remplir tous les champs.')
      return
    }

    setChargement(true)
    setErreur('')

    try {
      const response = await login(email, mdp)
      const role = response.utilisateur?.role

      if (role !== 'ADMIN') {
        // Compte non-admin → accès refusé
        setErreur('Accès refusé. Ce portail est réservé aux administrateurs.')
        // On déconnecte immédiatement pour ne pas garder le token
        import('../services/api').then(({ clearAuth }) => clearAuth())
        return
      }

      navigate('/admin/dashboard')
    } catch (error) {
      setErreur('Email ou mot de passe incorrect.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 max-w-6xl w-full gap-8 items-center">

          {/* Côté gauche */}
          <div className="hidden lg:block lg:col-span-7 pr-12 relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-5xl font-display text-on-surface leading-tight mb-6">
                Espace <br/>
                <span className="text-primary italic">Administration</span>
              </h2>
              <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
                Gérez et validez les événements académiques, suivez les inscriptions
                et supervisez l'activité de l'université.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="material-symbols-outlined text-primary mb-3 block">event_available</span>
                  <div className="font-bold text-on-surface">Validation</div>
                  <div className="text-sm text-on-surface-variant">Événements en attente</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="material-symbols-outlined text-primary mb-3 block">bar_chart</span>
                  <div className="font-bold text-on-surface">Statistiques</div>
                  <div className="text-sm text-on-surface-variant">Tableau de bord</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire Admin */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-surface-container-lowest p-10 md:p-12 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-bl-full"></div>

              <div className="relative z-10">
                <div className="mb-10 text-center lg:text-left">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto lg:mx-0 mb-6">
                    <span className="material-symbols-outlined text-white">shield_person</span>
                  </div>
                  <h1 className="text-3xl font-display text-on-surface mb-2">Connexion Admin</h1>
                  <p className="text-on-surface-variant text-sm tracking-wide uppercase font-medium">
                    Portail de l'Archiviste Moderne
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleConnexion}>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                      Email Académique
                    </label>
                    <input
                      type="email"
                      placeholder="prenom.nom@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-4 rounded-t-lg transition-all duration-300 outline-none text-on-surface placeholder:text-outline/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={voirMDP ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={mdp}
                        onChange={(e) => setMdp(e.target.value)}
                        className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-4 rounded-t-lg transition-all duration-300 outline-none text-on-surface placeholder:text-outline/50"
                      />
                      <button
                        type="button"
                        onClick={() => setVoirMDP(!voirMDP)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          {voirMDP ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  {erreur && (
                    <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      {erreur}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={chargement}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {chargement ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        Connexion en cours...
                      </>
                    ) : 'Se connecter'}
                  </button>
                </form>

              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LoginAdmin