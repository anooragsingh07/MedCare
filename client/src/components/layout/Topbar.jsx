import { useNavigate } from 'react-router-dom'
import { Activity, Building2, LogOut, Wifi, WifiOff } from 'lucide-react'
import { SidebarMenuButton } from './Sidebar.jsx'
import { useAuth } from '../../lib/auth-context.js'

const titles = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/billing': 'Dispensary',
  '/doctors': 'Doctors',
}

export default function Topbar({ pathname, onOpenMenu, apiOk }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const title = titles[pathname] ?? 'MedCare'
  const online = apiOk === true
  const checking = apiOk === null

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="flex h-[4.25rem] items-center gap-2 px-3 sm:gap-4 sm:px-4 md:px-7">
        <SidebarMenuButton onOpen={onOpenMenu} />
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hospital-50 text-hospital-700 ring-1 ring-hospital-100/80 sm:flex">
            <Building2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex items-center">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg md:text-xl">{title}</h1>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold shadow-sm transition-colors sm:hidden ${
            online
              ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800'
              : checking
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-amber-200/90 bg-amber-50 text-amber-900'
          }`}
          title="API health"
          aria-live="polite"
        >
          {online ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          ) : checking ? (
            <Activity className="h-3.5 w-3.5 animate-pulse text-slate-400" aria-hidden />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-amber-600" aria-hidden />
          )}
          <span className="max-[380px]:sr-only">{checking ? 'Checking' : online ? 'Online' : 'Offline'}</span>
        </div>

        <div
          className={`hidden items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors sm:flex ${
            online
              ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800'
              : checking
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-amber-200/90 bg-amber-50 text-amber-900'
          }`}
          title="Health check from /api/health"
        >
          {online ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          ) : checking ? (
            <Activity className="h-3.5 w-3.5 animate-pulse text-slate-400" aria-hidden />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-amber-600" aria-hidden />
          )}
          {checking ? 'Checking…' : online ? 'API online' : 'API offline'}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="hidden text-right leading-tight lg:block">
            <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
              {user?.uid} · {user?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden xl:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}