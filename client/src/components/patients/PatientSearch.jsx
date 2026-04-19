import { Search } from 'lucide-react'
import { Input, Label } from '../ui/Field.jsx'

export default function PatientSearch({ value, onChange, disabled }) {
  return (
    <div className="max-w-md">
      <Label htmlFor="patient-search">Search by name</Label>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input
          id="patient-search"
          type="search"
          placeholder="Type a patient name…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-9"
          autoComplete="off"
        />
      </div>
    </div>
  )
}
