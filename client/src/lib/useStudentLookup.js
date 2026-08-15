import { useEffect, useRef, useState } from 'react'
import { studentsApi } from '../services/studentsApi.js'

/**
 * Debounced UID lookup against the student directory.
 * Returns { state: 'idle'|'searching'|'found'|'missing'|'error', student, message }.
 * Auto-ignores stale responses after the UID changes.
 */
export function useStudentLookup(uid) {
  const [lookup, setLookup] = useState({ state: 'idle', student: null, message: '', uid: '' })
  const seq = useRef(0)

  useEffect(() => {
    const current = String(uid ?? '').trim()
    if (!current) return undefined

    const run = ++seq.current
    const t = setTimeout(async () => {
      if (run !== seq.current) return
      setLookup({ state: 'searching', student: null, message: '', uid: current })
      try {
        const res = await studentsApi.lookupByUid(current)
        if (run !== seq.current) return
        if (res.found && res.data) {
          setLookup({
            state: 'found',
            student: res.data,
            message: `Found: ${res.data.name} · ${res.data.department}`,
            uid: current,
          })
        } else {
          setLookup({
            state: 'missing',
            student: null,
            message: `Roll number “${current}” is not in the student directory.`,
            uid: current,
          })
        }
      } catch {
        if (run === seq.current) setLookup({ state: 'error', student: null, message: '', uid: current })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [uid])

  const current = String(uid ?? '').trim()
  const active = lookup.uid === current ? lookup : { state: 'idle', student: null, message: '' }
  return active
}