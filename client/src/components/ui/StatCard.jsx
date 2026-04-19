export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-hospital-50 text-hospital-700 ring-1 ring-hospital-100">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}
