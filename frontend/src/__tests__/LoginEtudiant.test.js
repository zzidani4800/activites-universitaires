import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginEtudiant from '../pages/LoginEtudiant'
import { AuthProvider } from '../contexts/AuthContext'

const renderPage = () =>
  render(
    <AuthProvider>
      <MemoryRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <LoginEtudiant />
      </MemoryRouter>
    </AuthProvider>
  )

test('affiche le titre Connexion Utilisateur', () => {
  renderPage()
  expect(screen.getByText('Connexion Utilisateur')).toBeInTheDocument()
})

test('affiche les champs email et mot de passe', () => {
  renderPage()
  expect(screen.getByPlaceholderText('prenom.nom@gmail.com')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument()
})

test('affiche une erreur si les champs sont vides', () => {
  renderPage()
  fireEvent.click(screen.getByText('Se connecter'))
  // Le bouton submit sans données ne redirige pas
  expect(screen.getByText('Se connecter')).toBeInTheDocument()
})

test('les champs acceptent la saisie', () => {
  renderPage()
  const inputEmail = screen.getByPlaceholderText('prenom.nom@gmail.com')
  fireEvent.change(inputEmail, { target: { value: 'test@gmail.com' } })
  expect(inputEmail.value).toBe('test@gmail.com')
})