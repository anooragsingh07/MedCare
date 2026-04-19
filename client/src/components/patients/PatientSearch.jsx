import { Search } from 'lucide-react'
import { Input, Label } from '../ui/Field.jsx'

export default function PatientSearch({ value, onChange, disabled }) {
  return (
    <div className="w-full min-w-0 max-w-full sm:max-w-md">
      <Label htmlFor="patient-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Search directory
      </Label>
      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          id="patient-search"
          type="search"
          placeholder="Search by name, roll no., or department…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10"
          autoComplete="off"
        />
      </div>
    </div>
  )
}
