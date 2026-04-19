import { NavLink } from 'react-router-dom'
import {
  Activity,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Menu,
  Shield,
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
    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-hospital-600 text-white shadow-lg shadow-hospital-950/30 ring-1 ring-white/10'
        : 'text-slate-300 hover:translate-x-0.5 hover:bg-slate-800/90 hover:text-white'
    }`

  const shell = (
    <>
      <div className="flex h-[4.25rem] items-center gap-3 border-b border-slate-800/80 px-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hospital-600 text-white shadow-lg shadow-hospital-950/40 ring-1 ring-white/10">
          <Activity className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">MedCare</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">Hospital admin</p>
        </div>
        <button
          type="button"
          className="ml-auto rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map((item) => {
          const NavIcon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
              <NavIcon
                className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105`}
                aria-hidden
              />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="flex items-start gap-2 border-t border-slate-800/80 p-4 text-[11px] leading-relaxed text-slate-500">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden />
        <span className="break-words">Internal use only · No authentication layer on this build.</span>
      </div>
    </>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 shadow-2xl shadow-black/25 md:flex md:flex-col">
        {shell}
      </aside>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col bg-slate-950 shadow-2xl transition-transform duration-200 ease-out md:hidden ${
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
      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow active:scale-[0.97] md:hidden"
      onClick={onOpen}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
