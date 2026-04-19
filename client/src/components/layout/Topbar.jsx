import { SidebarMenuButton } from './Sidebar.jsx'

const titles = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/billing': 'Billing',
  '/doctors': 'Doctors',
}

export default function Topbar({ pathname, onOpenMenu, apiOk }) {
  const title = titles[pathname] ?? 'MedCare'
  const status =
    apiOk === null ? { label: 'Checking…', dot: 'bg-slate-300' } : apiOk
      ? { label: 'API online', dot: 'bg-emerald-500' }
      : { label: 'API offline', dot: 'bg-amber-500' }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <SidebarMenuButton onOpen={onOpenMenu} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-slate-900 md:text-xl">{title}</h1>
          <p className="hidden text-sm text-slate-500 sm:block">Hospital management system</p>
        </div>
        <div
          className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex"
          title="Health check from /api/health"
        >
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </div>
      </div>
    </header>
  )
}
