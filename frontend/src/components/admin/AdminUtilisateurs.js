import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

const BADGE_ROLE = {
  'ETUDIANT':   'bg-blue-100 text-blue-800',
  'PROFESSEUR': 'bg-violet-100 text-violet-800',
  'ADMIN':      'bg-primary/10 text-primary',
}

const ROLES = ['ETUDIANT', 'PROFESSEUR', 'ADMIN']
const DEPARTEMENTS = [
  { label: 'Aucun',         value: '' },
  { label: 'Informatique',  value: 'INFORMATIQUE' },
  { label: 'Chimie',        value: 'CHIMIE' },
  { label: 'Physique',      value: 'PHYSIQUE' },
  { label: 'Biologie',      value: 'BIOLOGIE' },
  { label: 'Mathématiques', value: 'MATHEMATIQUES' },
]

function AdminUtilisateurs() {
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [erreur, setErreur]             = useState('')
  const [recherche, setRecherche]       = useState('')
  const [editUser, setEditUser]         = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [confirmSuppr, setConfirmSuppr] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [saveErreur, setSaveErreur]     = useState('')
  const [voirMDP, setVoirMDP]           = useState(false)

  useEffect(() => {
    const charger = async () => {
      setLoading(true); setErreur('')
      try {
        const data = await adminAPI.getUtilisateurs()
        setUsers(Array.isArray(data) ? data : [])
      } catch { setErreur('Erreur chargement utilisateurs.') }
      finally { setLoading(false) }
    }
    charger()
  }, [])

  const ouvrirEdition = (u) => {
    setEditUser(u)
    setSaveErreur('')
    setEditForm({
      prenom:         u.prenom        || '',
      nom:            u.nom           || '',
      email:          u.email         || '',
      numeroEtudiant: u.numeroEtudiant|| '',
      role:           u.role          || 'ETUDIANT',
      departement:    u.departement   || '',
      motDePasse:     '',
    })
    setVoirMDP(false)
  }

  const handleSauvegarder = async () => {
    setSaving(true); setSaveErreur('')
    // Validation email
    if (!editForm.email.endsWith('@uca.ac.ma')) {
      setSaveErreur("L'email doit se terminer par @uca.ac.ma")
      setSaving(false); return
    }
    try {
      const updated = await adminAPI.modifierUtilisateur(editUser.id, {
        prenom:         editForm.prenom         || null,
        nom:            editForm.nom            || null,
        email:          editForm.email          || null,
        numeroEtudiant: editForm.numeroEtudiant || null,
        role:           editForm.role           || null,
        departement:    editForm.departement    || null,
        motDePasse:     editForm.motDePasse     || null,
      })
      setUsers(p => p.map(u => u.id === editUser.id ? updated : u))
      setEditUser(null)
    } catch (e) { setSaveErreur(e.message) }
    finally { setSaving(false) }
  }

  const handleSupprimer = async (id) => {
    setSaving(true)
    try {
      await adminAPI.supprimerUtilisateur(id)
      setUsers(p => p.filter(u => u.id !== id))
      setConfirmSuppr(null)
    } catch (e) { setErreur(e.message) }
    finally { setSaving(false) }
  }

  const filtres = users.filter(u =>
    !recherche ||
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const ic = "w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary px-4 py-3 rounded-t-lg transition-all outline-none text-on-surface text-sm"

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>Chargement...
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-on-surface">Utilisateurs</h2>
        <p className="text-on-surface-variant text-sm mt-1">Gérer les comptes du portail</p>
      </div>

      {erreur && (
        <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>{erreur}
        </div>
      )}

      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input type="text" placeholder="Rechercher..." value={recherche}
          onChange={e => setRecherche(e.target.value)}
          className="w-full bg-surface-container-lowest border border-outline-variant/30 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-primary text-sm" />
      </div>

      <div className="rounded-xl border border-outline-variant/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Rôle</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">Département</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtres.map(u => (
              <tr key={u.id} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                <td className="px-4 py-3 font-medium text-on-surface">{u.prenom} {u.nom}</td>
                <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${BADGE_ROLE[u.role] ?? 'bg-surface-container text-on-surface-variant'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{u.departement || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => ouvrirEdition(u)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => setConfirmSuppr(u.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal modifier — tous les champs ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-display text-on-surface mb-6">Modifier l'utilisateur</h3>
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Prénom</label>
                  <input value={editForm.prenom} onChange={e => setEditForm({...editForm, prenom: e.target.value})} className={ic} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nom</label>
                  <input value={editForm.nom} onChange={e => setEditForm({...editForm, nom: e.target.value})} className={ic} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={ic} />
                {editForm.email && !editForm.email.endsWith('@uca.ac.ma') && (
                  <p className="text-xs text-error mt-1">Doit se terminer par @uca.ac.ma</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Numéro étudiant (APOGÉE)</label>
                <input value={editForm.numeroEtudiant} onChange={e => setEditForm({...editForm, numeroEtudiant: e.target.value})} className={ic} placeholder="20001234" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Rôle</label>
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className={ic + " appearance-none cursor-pointer"}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Département</label>
                  <select value={editForm.departement} onChange={e => setEditForm({...editForm, departement: e.target.value})} className={ic + " appearance-none cursor-pointer"}>
                    {DEPARTEMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nouveau mot de passe <span className="font-normal normal-case">(laisser vide = inchangé)</span></label>
                <div className="relative">
                  <input type={voirMDP ? 'text' : 'password'} value={editForm.motDePasse}
                    onChange={e => setEditForm({...editForm, motDePasse: e.target.value})}
                    placeholder="Min. 6 caractères" className={ic + ' pr-12'} />
                  <button type="button" onClick={() => setVoirMDP(!voirMDP)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">{voirMDP ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {saveErreur && (
                <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{saveErreur}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditUser(null)} className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-sm font-medium">Annuler</button>
              <button onClick={handleSauvegarder} disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold disabled:opacity-60">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal suppression ── */}
      {confirmSuppr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
            <span className="material-symbols-outlined text-4xl text-error mb-4 block">person_remove</span>
            <h3 className="text-lg font-display text-on-surface mb-2">Supprimer cet utilisateur ?</h3>
            <p className="text-on-surface-variant text-sm mb-8">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmSuppr(null)} className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-sm font-medium">Annuler</button>
              <button onClick={() => handleSupprimer(confirmSuppr)} disabled={saving} className="px-5 py-2.5 rounded-lg bg-error text-on-error text-sm font-bold hover:opacity-90 disabled:opacity-60">
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUtilisateurs