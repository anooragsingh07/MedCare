/**
 * JSON fetch helper for proxied `/api` routes.
 */
export async function apiJson(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options = { ...options, body: JSON.stringify(options.body) }
  }
  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.error || res.statusText || 'Request failed'
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/**
 * Download a PDF from the same-origin API (e.g. prescription or bill).
 * @param {string} path - e.g. `/api/patients/:id/prescription.pdf`
 * @param {string} [filename] - suggested download name
 */
export async function downloadPdf(path, filename = 'document.pdf') {
  const token = localStorage.getItem('medcare_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(path, { headers })
  const ct = res.headers.get('Content-Type') || ''
  if (!res.ok) {
    const data = ct.includes('application/json') ? await res.json().catch(() => ({})) : {}
    const msg = data.message || data.error || res.statusText || 'Request failed'
    if (res.status === 401) {
      localStorage.removeItem('medcare_token')
      localStorage.removeItem('medcare_user')
      window.dispatchEvent(new CustomEvent('medcare:unauthorized'))
    }
    throw new Error(msg)
  }
  if (!ct.includes('application/pdf')) {
    const text = await res.text().catch(() => '')
    throw new Error(text?.slice(0, 200) || 'Expected PDF from server')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
