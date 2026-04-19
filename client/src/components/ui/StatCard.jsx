export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-hospital-100 hover:shadow-[0_12px_40px_-14px_rgba(37,99,235,0.18)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
          {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-hospital-50 text-hospital-700 ring-1 ring-hospital-100/80 transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}
