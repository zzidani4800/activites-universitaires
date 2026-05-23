/**
 * Service API — Gère toutes les requêtes au backend Spring Boot (port 8082)
 * JWT token management + request/response handling
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082'

const TOKEN_KEY = 'auth_token'
const USER_KEY  = 'auth_user'

export const getToken       = () => localStorage.getItem(TOKEN_KEY)
export const getUser        = () => {
  try {
    const u = localStorage.getItem(USER_KEY)
    if (!u || u === 'undefined' || u === 'null') return null
    return JSON.parse(u)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}
export const isAuthenticated = () => !!getToken()
export const setAuth        = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export const clearAuth      = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ─── Requête générique avec JWT ──────────────────────────────────────────────
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearAuth()
    window.location.href = '/'
    return
  }

  if (!response.ok) {
    // Le backend renvoie ProblemDetail → champ "detail"
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.message || `Erreur ${response.status}`)
  }

  // 204 No Content — pas de body
  if (response.status === 204) return null

  return response.json()
}

// Helper : backend envoie nom="Prénom NomFamille" — on split proprement
const splitNomPrenom = (nomComplet = '', prenomSepare = '') => {
  if (prenomSepare) return { prenom: prenomSepare, nom: nomComplet }
  const parts = nomComplet.trim().split(' ')
  if (parts.length === 1) return { prenom: '', nom: nomComplet }
  return { prenom: parts[0], nom: parts.slice(1).join(' ') }
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {

  login: async (email, motDePasse) => {
    const response = await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    })

    // Backend renvoie nom = "Prénom Nom" (concaténé dans AuthService)
    // On split pour séparer prenom et nom correctement
    if (response?.token) {
      const { prenom, nom } = splitNomPrenom(response.nom, response.prenom)
      const utilisateur = { id: response.id, nom, prenom, email: response.email, role: response.role }
      setAuth(response.token, utilisateur)
      return { token: response.token, utilisateur }
    }

    return response
  },

  register: async (data) => {
    const response = await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response?.token) {
      const { prenom, nom } = splitNomPrenom(response.nom, response.prenom)
      const utilisateur = { id: response.id, nom, prenom, email: response.email, role: response.role }
      setAuth(response.token, utilisateur)
      return { token: response.token, utilisateur }
    }

    return response
  },

  logout: () => clearAuth(),
}

// ─── RÉSERVATIONS (Étudiant) ─────────────────────────────────────────────────
export const reservationsAPI = {
  creer:      (demande) => fetchAPI('/api/reservations', { method: 'POST', body: JSON.stringify(demande) }),
  mesDemandes: ()       => fetchAPI('/api/reservations/mes'),
  getById:    (id)      => fetchAPI(`/api/reservations/${id}`),
  annuler:    (id)      => fetchAPI(`/api/reservations/${id}/annuler`, { method: 'PUT', body: JSON.stringify({}) }),
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:             ()             => fetchAPI('/api/admin/stats'),
  getToutesReservations: ()            => fetchAPI('/api/admin/reservations'),
  getEnAttente:          ()            => fetchAPI('/api/admin/reservations/en-attente'),
  changerStatut:        (id, decision, motif = null) =>
    fetchAPI(`/api/admin/reservations/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ decision, motif }),
    }),
  getUtilisateurs:       ()            => fetchAPI('/api/admin/utilisateurs'),
  modifierUtilisateur:   (id, data)    => fetchAPI(`/api/admin/utilisateurs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  supprimerUtilisateur:  (id)          => fetchAPI(`/api/admin/utilisateurs/${id}`, {
    method: 'DELETE',
  }),
  getEvenements:         ()            => fetchAPI('/api/admin/evenements'),
}

export default { authAPI, reservationsAPI, adminAPI, getToken, setAuth, getUser, clearAuth, isAuthenticated }
