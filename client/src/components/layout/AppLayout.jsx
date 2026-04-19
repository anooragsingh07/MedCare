import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppLayout() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiOk, setApiOk] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setApiOk(Boolean(d?.ok))
      })
      .catch(() => {
        if (!cancelled) setApiOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMenuOpen(false))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="md:pl-64">
        <Topbar pathname={pathname} onOpenMenu={() => setMenuOpen(true)} apiOk={apiOk} />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
