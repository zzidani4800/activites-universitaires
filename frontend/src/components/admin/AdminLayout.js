import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AdminDashboard    from './AdminDashboard'
import AdminEvenements   from './AdminEvenements'
import AdminUtilisateurs from './AdminUtilisateurs'

const ONGLETS = [
  { id: 'dashboard',    label: 'Dashboard',    icone: 'dashboard' },
  { id: 'evenements',   label: 'Événements',   icone: 'calendar_month' },
  { id: 'utilisateurs', label: 'Utilisateurs', icone: 'group' },
]

function AdminLayout() {
  const [ongletActif, setOngletActif] = useState('dashboard')
  const navigate = useNavigate()
  const { user, logout } = useAuth()   // ← utilise le vrai logout du contexte

  const handleDeconnexion = () => {
    logout()                           // supprime token + met user=null dans le contexte
    navigate('/login-admin')
  }

  const rendrePage = () => {
    if (ongletActif === 'dashboard')    return <AdminDashboard />
    if (ongletActif === 'evenements')   return <AdminEvenements />
    if (ongletActif === 'utilisateurs') return <AdminUtilisateurs />
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">

      {/* ── Navbar Admin ── */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f4]/90 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#002444] text-2xl">account_balance</span>
            <div>
              <p className="font-bold font-headline text-[#002444] text-sm leading-none">Université Cadi Ayyad</p>
              <p className="text-[9px] text-primary tracking-widest uppercase">Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-outline tracking-widest uppercase">Session Admin</p>
              {/* Affiche le vrai nom de l'admin connecté */}
              <p className="text-sm font-bold text-on-surface">
                {user?.prenom} {user?.nom}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.prenom?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <Link
              to="/admin/creer-utilisateur"
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-container transition-colors text-sm"
            >
              + Créer un utilisateur
            </Link>
            <button
              onClick={handleDeconnexion}
              title="Se déconnecter"
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="max-w-6xl mx-auto px-8">
          <nav className="flex gap-1 border-b border-outline-variant/30">
            {ONGLETS.map((onglet) => (
              <button
                key={onglet.id}
                onClick={() => setOngletActif(onglet.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  ongletActif === onglet.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">{onglet.icone}</span>
                <span className="hidden sm:inline">{onglet.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {rendrePage()}
        </div>
      </main>

    </div>
  )
}

export default AdminLayout