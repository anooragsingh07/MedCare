import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Package,
  PieChart,
  Stethoscope,
  Users,
} from 'lucide-react'

/** All login roles in the system. */
export const ROLES = ['admin', 'doctor', 'staff', 'member']

/**
 * Single source of truth for which pages each role can see.
 * `labels` overrides the sidebar label for specific roles.
 */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'staff', 'member'] },
  {
    to: '/patients',
    label: 'Patients',
    icon: Users,
    roles: ['admin', 'doctor', 'staff', 'member'],
    labels: { member: 'My visits' },
  },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['admin', 'doctor', 'staff', 'member'] },
  { to: '/billing', label: 'Dispensary', icon: CreditCard, roles: ['admin', 'staff'] },
  { to: '/medicines', label: 'Inventory', icon: Package, roles: ['admin', 'doctor', 'staff'] },
  { to: '/reports', label: 'Reports', icon: PieChart, roles: ['admin', 'staff'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin', 'staff'] },
  { to: '/members', label: 'Members', icon: GraduationCap, roles: ['admin'] },
]

export function navItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => ({
    ...item,
    label: item.labels?.[role] ?? item.label,
  }))
}

export const pageRoles = Object.fromEntries(
  NAV_ITEMS.map((item) => [
    item.to.replace(/^\//, '') || 'dashboard',
    item.roles,
  ]),
)

export const pageAllowed = (page) => pageRoles[page] ?? []