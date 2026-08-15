import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PatientsPage from './pages/PatientsPage.jsx'
import AppointmentsPage from './pages/AppointmentsPage.jsx'
import BillingPage from './pages/BillingPage.jsx'
import DoctorsPage from './pages/DoctorsPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import MedicinesPage from './pages/MedicinesPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { useAuth } from './lib/auth-context.js'
import { pageAllowed } from './lib/roles.js'
import Spinner from './components/ui/Spinner.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef2f6]">
        <Spinner size="lg" caption="Loading…" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function Page({ page, children }) {
  const { user } = useAuth()
  const roles = pageAllowed(page)
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route
              path="/billing"
              element={
                <Page page="billing">
                  <BillingPage />
                </Page>
              }
            />
            <Route
              path="/doctors"
              element={
                <Page page="doctors">
                  <DoctorsPage />
                </Page>
              }
            />
            <Route
              path="/reports"
              element={
                <Page page="reports">
                  <ReportsPage />
                </Page>
              }
            />
            <Route
              path="/medicines"
              element={
                <Page page="medicines">
                  <MedicinesPage />
                </Page>
              }
            />
            <Route
              path="/members"
              element={
                <Page page="members">
                  <MembersPage />
                </Page>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}