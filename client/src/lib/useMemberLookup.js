import { useEffect, useRef, useState } from 'react'
import { membersApi } from '../services/membersApi.js'

/**
 * Debounced college ID lookup against the members directory.
 * Returns { state: 'idle'|'searching'|'found'|'missing'|'error', member, message }.
 * Auto-ignores stale responses after the ID changes.
 */
export function useMemberLookup(uid) {
  const [lookup, setLookup] = useState({ state: 'idle', member: null, message: '', uid: '' })
  const seq = useRef(0)

  useEffect(() => {
    const current = String(uid ?? '').trim()
    if (!current) return undefined

    const run = ++seq.current
    const t = setTimeout(async () => {
      if (run !== seq.current) return
      setLookup({ state: 'searching', member: null, message: '', uid: current })
      try {
        const res = await membersApi.lookupByUid(current)
        if (run !== seq.current) return
        if (res.found && res.data) {
          setLookup({
            state: 'found',
            member: res.data,
            message: `Found: ${res.data.name} · ${res.data.category} · ${res.data.department}`,
            uid: current,
          })
        } else {
          setLookup({
            state: 'missing',
            member: null,
            message: `College ID “${current}” is not in the members directory.`,
            uid: current,
          })
        }
      } catch {
        if (run === seq.current) setLookup({ state: 'error', member: null, message: '', uid: current })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [uid])

  const current = String(uid ?? '').trim()
  const active = lookup.uid === current ? lookup : { state: 'idle', member: null, message: '' }
  return active
}