export function Label({ htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-sm font-medium text-slate-700 ${className}`}>
      {children}
    </label>
  )
}

const controlBase =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-hospital-500 focus:outline-none focus:ring-2 focus:ring-hospital-500/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

export function Input({ className = '', ...props }) {
  return <input className={`${controlBase} ${className}`} {...props} />
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${controlBase} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`min-h-[96px] ${controlBase} ${className}`} {...props} />
}
