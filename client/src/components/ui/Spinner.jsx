const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

/**
 * Accessible loading indicator for panels, tables, and charts.
 */
export default function Spinner({ size = 'md', className = '', caption }) {
  const label = caption || 'Loading'
  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span
        className={`${sizes[size]} shrink-0 animate-spin rounded-full border-slate-200 border-t-hospital-600`}
        aria-hidden
      />
      {caption ? (
        <span className="text-xs font-medium tracking-wide text-slate-500" aria-hidden>
          {caption}
        </span>
      ) : null}
    </div>
  )
}
