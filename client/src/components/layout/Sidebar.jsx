import { NavLink } from 'react-router-dom'
import {
  Activity,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Menu,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
]

export default function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-hospital-600 text-white shadow-md shadow-hospital-900/20'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
    }`

  const shell = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hospital-600 text-lg font-bold text-white">
          <Activity className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">MedCare</p>
          <p className="truncate text-xs text-slate-400">Hospital admin</p>
        </div>
        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const NavIcon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
              <NavIcon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        Internal use only · No authentication
      </div>
    </>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-900 shadow-xl md:flex md:flex-col">
        {shell}
      </aside>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col bg-slate-900 shadow-xl transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {shell}
      </aside>
    </>
  )
}

export function SidebarMenuButton({ onOpen }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 md:hidden"
      onClick={onOpen}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
