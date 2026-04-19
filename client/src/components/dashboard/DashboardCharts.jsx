import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Spinner from '../ui/Spinner.jsx'

const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-slate-600">
          {p.name}: <span className="font-medium text-slate-900">{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardCharts({ revenueSeries, appointmentPie, patientVolume, loading }) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-56 items-center justify-center rounded-2xl border border-slate-200/90 bg-white shadow-md sm:h-64 md:h-72"
          >
            <Spinner size="md" caption="Loading chart…" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-5 md:p-6">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">Revenue trend</h3>
        <p className="text-sm text-slate-500">Billed totals by month (from bill timestamps)</p>
        <div className="mt-4 h-56 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd5e1' }} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#2563eb" fill="url(#revFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-5 md:p-6">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">Appointments by status</h3>
        <p className="text-sm text-slate-500">Scheduled vs completed volume</p>
        <div className="mt-4 flex h-56 items-center justify-center sm:h-64 md:h-72">
          {appointmentPie.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments yet — book visits to see this chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={appointmentPie} dataKey="value" nameKey="name" innerRadius={44} outerRadius={76} paddingAngle={2}>
                  {appointmentPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-5 md:p-6 lg:col-span-2">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">New patients by month</h3>
        <p className="text-sm text-slate-500">Registrations based on record timestamps</p>
        <div className="mt-4 h-56 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patientVolume} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="patients" name="Patients" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {patientVolume.map((_, i) => (
                  <Cell key={i} fill="#2563eb" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
