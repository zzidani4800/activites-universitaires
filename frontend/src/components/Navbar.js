import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar({ role }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleDeconnexion = () => {
    logout()
    navigate('/')
  }

  // Initiale pour l'avatar
  const initiale = user?.prenom?.[0]?.toUpperCase() ?? user?.nom?.[0]?.toUpperCase() ?? '?'
  // Nom affiché : "P. Nom" si prenom dispo, sinon juste nom
  const nomAffiche = user
    ? user.prenom
      ? `${user.prenom[0].toUpperCase()}. ${user.nom}`
      : user.nom
    : '—'

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbf9f4]/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#002444] text-2xl">account_balance</span>
          <span className="text-xl font-bold font-headline text-[#002444] tracking-tight">
            Université Cadi Ayyad
          </span>
        </div>

        {/* Liens selon le rôle */}
        <nav className="hidden md:flex items-center gap-6">
          {role === 'etudiant' && (
            <>
              <Link to="/inscription"      className="text-sm text-on-surface-variant hover:text-primary transition-colors">Inscription</Link>
              <Link to="/mes-reservations" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Mes réservations</Link>
              <Link to="/annulation"       className="text-sm text-on-surface-variant hover:text-primary transition-colors">Annuler</Link>
            </>
          )}
          {role === 'admin' && (
            <>
              <Link to="/admin/dashboard"         className="text-sm text-on-surface-variant hover:text-primary transition-colors">Tableau de bord</Link>
              <Link to="/admin/creer-utilisateur" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Créer utilisateur</Link>
            </>
          )}
          <button onClick={handleDeconnexion} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            Déconnexion
          </button>
        </nav>

        {/* Avatar + nom réel */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[9px] text-outline tracking-widest uppercase">
              {role === 'admin' ? 'Session Admin' : 'Session Étudiant'}
            </p>
            <p className="text-sm font-bold text-on-surface">{nomAffiche}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">{initiale}</span>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Navbar