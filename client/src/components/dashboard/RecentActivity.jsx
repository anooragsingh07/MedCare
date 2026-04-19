import { CalendarDays, Receipt, UserRound } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Spinner from '../ui/Spinner.jsx'
import { formatRelativeTime } from '../../lib/dashboardTransforms.js'

const icons = {
  patient: UserRound,
  appointment: CalendarDays,
  billing: Receipt,
}

export default function RecentActivity({ items, loading }) {
  return (
    <Card title="Recent activity" subtitle="Latest patients, appointments, and bills">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" caption="Loading activity…" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm leading-relaxed text-slate-500">
          No activity yet. Add patients, appointments, or bills to populate this feed.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((row) => {
            const Icon = icons[row.kind] || UserRound
            return (
              <li
                key={row.id}
                className="flex gap-3 py-3.5 transition-colors first:pt-0 hover:bg-slate-50/80 sm:gap-4 sm:py-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hospital-50 text-hospital-700 ring-1 ring-hospital-100/80 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{row.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{row.detail}</p>
                </div>
                <time className="shrink-0 text-xs font-semibold text-slate-400" dateTime={row.at.toISOString()}>
                  {formatRelativeTime(row.at)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
