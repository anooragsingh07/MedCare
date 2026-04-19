export default function Card({ children, className = '', title, subtitle, actions }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] ${className}`}
    >
      {(title || subtitle || actions) && (
        <header className="flex flex-col gap-3 border-b border-slate-100/90 bg-gradient-to-b from-white to-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-[1.05rem]">{title}</h2>
            )}
            {subtitle && <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
        </header>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}
