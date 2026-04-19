import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  Bell,
  Brain,
  Bone,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Heart,
  Search,
} from 'lucide-react'

const ACCENT = '#7C73E6'
const ACCENT_SOFT = '#E8E6FC'
const BAR_MUTED = '#E2E8F0'
const BAR_MUTED_DARK = '#CBD5E1'

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/80 ${className}`}
    >
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-slate-600">
          {p.name}: <span className="font-medium text-slate-900">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function Avatar({ name, className = '' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-indigo-300 text-xs font-semibold text-indigo-900 ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  )
}

const xrayData = [
  { label: '08', v: 42 },
  { label: '10', v: 58 },
  { label: '12', v: 48 },
  { label: '14', v: 72 },
  { label: '16', v: 55 },
  { label: '18', v: 68 },
  { label: '20', v: 62 },
]

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const revenueData = weekDays.map((d, i) => ({
  day: d,
  value: [32, 40, 28, 72, 36, 44, 30][i],
  highlight: i === 3,
}))

const dailyData = weekDays.map((d, i) => ({
  day: d,
  value: [180, 220, 200, 1260, 240, 260, 210][i],
  highlight: i === 3,
}))

const diagnoseSlices = [
  { name: 'Neuralgy', value: 120, color: ACCENT },
  { name: 'Oncology', value: 30, color: '#94A3B8' },
  { name: 'Urology', value: 24, color: '#CBD5E1' },
]

const patientsMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
].map((name, i) => ({
  name,
  consultation: name === 'May' ? 320000 : 80000 + i * 12000,
  checkup: name === 'May' ? 200000 : 40000 + i * 8000,
  highlight: name === 'May',
}))

function WeekBarBlock({ title, subtitle, data, bubble, badge }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
        >
          Today
        </button>
      </div>
      <div className="relative h-52 flex-1 min-h-[13rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 28, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <pattern
                id={`stripes-${title.replace(/\s/g, '')}`}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <rect width="3" height="10" fill={ACCENT} />
                <rect x="3" width="3" height="10" fill="#0f172a" />
              </pattern>
            </defs>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,115,230,0.06)' }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={36}>
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={entry.highlight ? `url(#stripes-${title.replace(/\s/g, '')})` : BAR_MUTED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {bubble != null && (
          <div className="pointer-events-none absolute left-[46%] top-6 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            {bubble}
          </div>
        )}
        {badge && (
          <div className="pointer-events-none absolute right-6 top-10 rounded-lg bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow">
            {badge}
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>Total revenue</span>
        <span className="font-semibold text-slate-800">$2.4M</span>
      </div>
    </Card>
  )
}

function KpiStat({ title, value, delta, progress, ring }) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-[11px] text-slate-500">Since last week</p>
          <p className="text-xs font-semibold text-emerald-600">{delta}</p>
        </div>
        {ring && (
          <div className="h-14 w-14 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ring}
                  dataKey="value"
                  innerRadius={16}
                  outerRadius={26}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {ring.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [openDept, setOpenDept] = useState('Cardiology')
  const [selectedDay, setSelectedDay] = useState(1)

  const appointmentRing = useMemo(
    () => [
      { name: 'done', value: 72, color: ACCENT },
      { name: 'rest', value: 28, color: BAR_MUTED },
    ],
    [],
  )

  const decemberDays = [1, 2, 3, 4, 5, 6]

  return (
    <div className="min-h-screen pb-10" style={{ background: '#DCE4E8' }}>
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-lg shadow-violet-300/40">
              M
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MedCare</p>
              <p className="text-sm font-semibold text-slate-900">Clinical dashboard</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 sm:max-w-md">
            <div className="relative hidden w-full min-w-[200px] sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search patients, charts…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[1fr_320px] lg:items-start lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Top row */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">X-ray overview</h2>
                  <p className="text-xs text-slate-500">Chest score vs. oxygen saturation</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
                  Live
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={xrayData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                    />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,115,230,0.06)' }} />
                    <Bar dataKey="v" radius={[10, 10, 0, 0]} fill={ACCENT} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid gap-4 xl:col-span-5">
              <KpiStat title="New this week" value="4,152" delta="+4.11%" progress={68} />
              <KpiStat title="Critical alert" value="5,946" delta="+2.04%" progress={54} />
              <KpiStat
                title="Appointments"
                value="2,605"
                delta="+1.20%"
                progress={76}
                ring={appointmentRing}
              />
            </div>
          </div>

          {/* Middle charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <WeekBarBlock
              title="Revenue"
              subtitle="Weekly performance"
              data={revenueData}
              badge="+60%"
            />
            <WeekBarBlock
              title="Daily overview"
              subtitle="Visits by weekday"
              data={dailyData}
              bubble="1260"
            />
            <Card>
              <h3 className="text-sm font-semibold text-slate-900">Avg diagnose</h3>
              <p className="text-xs text-slate-500">Department mix</p>
              <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative mx-auto h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diagnoseSlices}
                        dataKey="value"
                        innerRadius="58%"
                        outerRadius="88%"
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {diagnoseSlices.map((s) => (
                          <Cell key={s.name} fill={s.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-medium text-slate-500">Total patients</p>
                    <p className="text-lg font-bold leading-tight text-slate-900">83,842</p>
                  </div>
                </div>
                <ul className="w-full space-y-3 text-sm">
                  {diagnoseSlices.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </span>
                      <span className="font-semibold text-slate-900">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <h3 className="text-sm font-semibold text-slate-900">Pharmacy overview</h3>
              <p className="mt-3 text-4xl font-bold text-slate-900">
                68<span className="text-lg font-semibold text-slate-500">%</span>
              </p>
              <p className="text-xs text-slate-500">Inventory accuracy</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-200">
                  Medicines in stock
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                  Out of stock
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                  Low supply
                </span>
              </div>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[68%] rounded-full bg-accent" />
              </div>
            </Card>

            <Card className="lg:col-span-8">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Patients status</h3>
                  <p className="text-xs text-slate-500">Consultation vs. medical check-up</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-sm bg-accent" />
                    Consultation
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-sm bg-slate-800" style={{ backgroundImage: 'repeating-linear-gradient(135deg,#0f172a,#0f172a 2px,#cbd5e1 2px,#cbd5e1 4px)' }} />
                    Medical check-up
                  </span>
                </div>
              </div>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientsMonths} margin={{ top: 24, right: 12, left: -24, bottom: 0 }}>
                    <defs>
                      <pattern id="patientStripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <rect width="3" height="10" fill="#0f172a" />
                        <rect x="3" width="3" height="10" fill="#94a3b8" />
                      </pattern>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
                    <Bar dataKey="consultation" stackId="a" fill={ACCENT} radius={[0, 0, 0, 0]} maxBarSize={22}>
                      {patientsMonths.map((e) => (
                        <Cell key={e.name} fill={e.highlight ? ACCENT : BAR_MUTED_DARK} />
                      ))}
                    </Bar>
                    <Bar dataKey="checkup" stackId="a" radius={[8, 8, 0, 0]} maxBarSize={22}>
                      {patientsMonths.map((e) => (
                        <Cell key={e.name} fill={e.highlight ? 'url(#patientStripes)' : BAR_MUTED} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute left-[38%] top-5 hidden -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow lg:block">
                  521,748
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name="Jerome Bell" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">Dr. Jerome Bell</p>
                <p className="text-xs text-slate-500">Cardiologist</p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                10:00 AM
              </span>
            </div>
            <div className="mt-5 flex items-center gap-2 text-slate-700">
              <CalendarDays className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">December 2025</span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {decemberDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                    selectedDay === d
                      ? 'bg-accent text-white shadow-lg shadow-violet-300/50'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">On duty doctors</h3>
            <p className="text-xs text-slate-500">Departments</p>
            <ul className="mt-4 space-y-2">
              {[
                {
                  id: 'Cardiology',
                  icon: Heart,
                  count: 4,
                  doctors: [
                    { name: 'Dr. Leslie Alexander', time: '10:00 AM' },
                    { name: 'Dr. Albert Brown', time: '11:30 AM' },
                  ],
                },
                { id: 'Neurology', icon: Brain, count: 3, doctors: [] },
                { id: 'Orthopedic', icon: Bone, count: 2, doctors: [] },
              ].map((dept) => {
                const Icon = dept.icon
                const open = openDept === dept.id
                return (
                  <li key={dept.id} className="rounded-2xl border border-slate-100 bg-slate-50/80">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                      onClick={() => setOpenDept(open ? '' : dept.id)}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <Icon className="h-4 w-4 text-accent" />
                        {dept.id}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        {dept.count}
                        {open ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </span>
                    </button>
                    {open && dept.doctors.length > 0 && (
                      <ul className="space-y-2 border-t border-slate-100 px-3 py-3">
                        {dept.doctors.map((doc) => (
                          <li key={doc.name} className="flex items-center gap-3 rounded-xl bg-white px-2 py-2 ring-1 ring-slate-100">
                            <Avatar name={doc.name} className="h-9 w-9 text-[10px]" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-slate-900">{doc.name}</p>
                              <p className="text-[11px] text-slate-500">{doc.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {open && dept.doctors.length === 0 && (
                      <p className="border-t border-slate-100 px-3 py-3 text-xs text-slate-500">
                        Roster updates throughout the day.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  )
}
