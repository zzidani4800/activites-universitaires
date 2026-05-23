import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getUser, getToken, isAuthenticated } from '../services/api'

/**
 * Contexte d'authentification
 * Gère l'état de connexion et les données utilisateur
 */
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Vérifie si l'utilisateur est déjà connecté (au chargement)
  useEffect(() => {
    const storedUser = getUser()
    if (storedUser && isAuthenticated()) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email, motDePasse) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(email, motDePasse)
      setUser(response.utilisateur)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, motDePasse, nom, prenom, apogee) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.register(email, motDePasse, nom, prenom, apogee)
      setUser(response.utilisateur)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    authAPI.logout()
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && isAuthenticated(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook pour accéder au contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
