import { useEffect, useState } from 'react'
import Dashboard from './Dashboard.jsx'

export default function App() {
  const [apiOk, setApiOk] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setApiOk(Boolean(data?.ok))
      })
      .catch(() => {
        if (!cancelled) setApiOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative">
      <span className="sr-only">
        API status: {apiOk === null ? 'checking' : apiOk ? 'connected' : 'offline'}
      </span>
      <Dashboard />
    </div>
  )
}
