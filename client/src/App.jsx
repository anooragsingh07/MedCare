import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'Patients', active: false },
  { label: 'Appointments', active: false },
  { label: 'Departments', active: false },
  { label: 'Reports', active: false },
]

const stats = [
  { label: 'Patients today', value: '—', hint: 'Live once wired' },
  { label: 'Scheduled visits', value: '—', hint: 'Calendar module' },
  { label: 'Open beds', value: '—', hint: 'Ward overview' },
  { label: 'Staff on duty', value: '—', hint: 'Rosters' },
]

function App() {
  const [apiStatus, setApiStatus] = useState({ loading: true, ok: null, message: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setApiStatus({
          loading: false,
          ok: Boolean(data?.ok),
          message: data?.service ? `${data.service} responded` : 'API reachable',
        })
      })
      .catch(() => {
        if (cancelled) return
        setApiStatus({
          loading: false,
          ok: false,
          message: 'Start the server on port 5000',
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinical-600 text-lg font-bold text-white shadow-md shadow-clinical-600/25">
              +
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-clinical-700">
                Healthcare Management
              </p>
              <h1 className="text-xl font-semibold text-slate-900">MedCare</h1>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`rounded-lg px-3 py-2 transition ${
                  item.active
                    ? 'bg-clinical-50 text-clinical-800 ring-1 ring-clinical-100'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-clinical-700">Operations overview</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Hospital dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Central place for patient flow, scheduling, and ward visibility. Authentication is
                not enabled yet—this build focuses on layout, API wiring, and MongoDB readiness.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">API status</p>
              <p className="mt-1 text-slate-600">
                {apiStatus.loading && 'Checking /api/health…'}
                {!apiStatus.loading && apiStatus.ok && (
                  <span className="text-emerald-700">{apiStatus.message}</span>
                )}
                {!apiStatus.loading && !apiStatus.ok && (
                  <span className="text-amber-700">{apiStatus.message}</span>
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-2 text-xs text-slate-500">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">Today&apos;s focus</h3>
            <p className="mt-2 text-sm text-slate-600">
              Use this column for queues, alerts, and handoffs between departments. Replace with
              real data from your Express + MongoDB routes when modules are ready.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span>Triage wait time</span>
                <span className="font-medium text-slate-500">—</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span>OR block utilization</span>
                <span className="font-medium text-slate-500">—</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span>Pharmacy refills pending</span>
                <span className="font-medium text-slate-500">—</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-clinical-100 bg-gradient-to-b from-white to-clinical-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-clinical-900">Care standards</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              White-on-blue accents keep the interface calm and clinical. Extend with your brand
              palette while preserving contrast for accessibility.
            </p>
            <div className="mt-6 rounded-xl bg-white/80 p-4 text-xs text-slate-600 ring-1 ring-clinical-100">
              <p className="font-semibold text-clinical-800">Stack</p>
              <p className="mt-2">React · Vite · Tailwind · Express · Mongoose</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        MedCare · Internal hospital operations (demo)
      </footer>
    </div>
  )
}

export default App
