import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'

// On enveloppe dans BrowserRouter car Navbar utilise <Link>
const renderNavbar = (role) =>
  render(
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Navbar role={role} />
      </BrowserRouter>
    </AuthProvider>
  )

test("affiche le nom de l'université", () => {
  renderNavbar('etudiant')
  expect(screen.getByText('Université Cadi Ayyad')).toBeInTheDocument()
})

test('affiche les liens étudiant quand role=etudiant', () => {
  renderNavbar('etudiant')
  expect(screen.getByText('Inscription')).toBeInTheDocument()
  expect(screen.getByText('Mes réservations')).toBeInTheDocument()
  expect(screen.getByText('Annuler')).toBeInTheDocument()
})

test('affiche les liens admin quand role=admin', () => {
  renderNavbar('admin')
  expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
})

test('affiche le bouton déconnexion', () => {
  renderNavbar('etudiant')
  expect(screen.getByText('Déconnexion')).toBeInTheDocument()
})