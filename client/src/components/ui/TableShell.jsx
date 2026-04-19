/**
 * Wraps tables with rounded border, soft shadow, and horizontal scroll (clinical records style).
 */
export default function TableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-900/[0.035]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
