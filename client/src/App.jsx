import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PatientsPage from './pages/PatientsPage.jsx'
import AppointmentsPage from './pages/AppointmentsPage.jsx'
import BillingPage from './pages/BillingPage.jsx'
import DoctorsPage from './pages/DoctorsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
