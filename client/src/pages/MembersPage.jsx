import { startTransition, useCallback, useEffect, useState } from 'react'
import { GraduationCap, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select, Textarea } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { membersApi } from '../services/membersApi.js'
import EditMemberModal from '../components/members/EditMemberModal.jsx'

const emptyForm = () => ({
  uid: '',
  category: 'student',
  name: '',
  department: '',
  year: '',
  phone: '',
  gender: 'Other',
})

export default function MembersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [csv, setCsv] = useState('')
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const res = await membersApi.list(debouncedSearch)
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    startTransition(() => {
      void load()
    })
  }, [load])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await membersApi.create(form)
      toast.success('Member added')
      setForm(emptyForm())
      await load()
    } catch (err) {
      toast.error(err.message || 'Could not add member')
    } finally {
      setSaving(false)
    }
  }

  function parseCsv(text) {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    const header = lines[0]?.toLowerCase()
    const hasHeader = header && /uid/.test(header)
    return lines.slice(hasHeader ? 1 : 0).map((line) => {
      const [uid, category = 'student', name, department, year = '', phone = '', gender = 'Other'] = line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((cell) => cell.replace(/^"|"$/g, '').trim())
      return { uid, category: category === 'teacher' ? 'teacher' : 'student', name, department, year, phone, gender }
    })
  }

  async function handleImport() {
    const members = parseCsv(csv)
    if (members.length === 0) {
      toast.error('Paste CSV rows first (uid,category,name,department,year,phone,gender)')
      return
    }
    setImporting(true)
    try {
      const res = await membersApi.importMembers(members)
      toast.success(res.message || 'Members imported')
      setCsv('')
      await load()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <Card title="Add member" subtitle="Students use roll numbers; teachers use EMP-… codes">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="m-category">Category</Label>
                <Select id="m-category" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="m-uid">College ID</Label>
                <Input
                  id="m-uid"
                  required
                  value={form.uid}
                  onChange={(e) => setField('uid', e.target.value)}
                  placeholder="e.g. 2337373 or EMP-1001"
                />
              </div>
              <div>
                <Label htmlFor="m-name">Full name</Label>
                <Input id="m-name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="m-dept">Department</Label>
                <Input id="m-dept" required value={form.department} onChange={(e) => setField('department', e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <Label htmlFor="m-year">Year</Label>
                <Input id="m-year" value={form.year} onChange={(e) => setField('year', e.target.value)} placeholder="e.g. 2nd Year" />
              </div>
              <div>
                <Label htmlFor="m-phone">Phone</Label>
                <Input id="m-phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="m-gender">Gender</Label>
                <Select id="m-gender" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              <GraduationCap className="h-4 w-4" aria-hidden />
              {saving ? 'Saving…' : 'Add member'}
            </Button>
          </form>
        </Card>

        <Card title="Import members" subtitle="Paste CSV rows: uid,category,name,department,year,phone,gender (header optional)">
          <div className="space-y-3">
            <Textarea
              rows={7}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={'2337373,student,Arjun Nair,Computer Science,3rd Year,+91 98765 11101,Male\nEMP-1001,teacher,Prof. Kavitha Raman,Electronics & Communication,,+91 98765 11104,Female'}
            />
            <Button type="button" variant="secondary" onClick={handleImport} disabled={importing} className="gap-2">
              <Upload className="h-4 w-4" aria-hidden />
              {importing ? 'Importing…' : 'Import rows'}
            </Button>
            <p className="text-xs text-slate-500">
              Existing college IDs are updated; blank/invalid rows are skipped.
            </p>
          </div>
        </Card>
      </div>

      <Card
        title="College members directory"
        subtitle={
          loading
            ? 'Loading…'
            : `${rows.length} member(s)${debouncedSearch ? ` · filter “${debouncedSearch}” (ID, name, department)` : ''}`
        }
        actions={
          <Input
            className="w-full sm:w-64"
            placeholder="Search members…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={loading}
          />
        }
      >
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>College ID</th>
                <th className={th}>Name</th>
                <th className={th}>Category</th>
                <th className={th}>Department</th>
                <th className={th}>Year</th>
                <th className={th}>Phone</th>
                <th className={th}>Status</th>
                <th className={`${th} w-32 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading members…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} font-mono text-xs font-medium text-slate-900`}>{r.uid}</td>
                    <td className={`${td} font-medium text-slate-900`}>{r.name}</td>
                    <td className={td}>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.category === 'teacher' ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {r.category === 'teacher' ? 'Teacher' : 'Student'}
                      </span>
                    </td>
                    <td className={td}>{r.department}</td>
                    <td className={td}>{r.year || '—'}</td>
                    <td className={td}>{r.phone || '—'}</td>
                    <td className={td}>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setEditing(r)}>
                          Edit
                        </Button>
                        {r.isActive ? (
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs text-red-600"
                            onClick={async () => {
                              if (!confirm(`Deactivate ${r.name}? Their records remain, but the college ID can no longer be used.`)) return
                              try {
                                await membersApi.deactivate(r._id)
                                toast.success('Member deactivated')
                                await load()
                              } catch (e) {
                                toast.error(e.message || 'Deactivate failed')
                              }
                            }}
                          >
                            Deactivate
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableShell>
      </Card>

      <EditMemberModal
        key={editing?._id ?? 'closed'}
        member={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={load}
      />
    </div>
  )
}