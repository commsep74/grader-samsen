import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockSubmissions, mockClassrooms, mockProblems } from '@/lib/mock-data'
import { chartTick, chartTooltipStyle } from '@/lib/utils'

const chartData = [
  { day: 'Mon', subs: 42 },
  { day: 'Tue', subs: 58 },
  { day: 'Wed', subs: 35 },
  { day: 'Thu', subs: 71 },
  { day: 'Fri', subs: 64 },
  { day: 'Sat', subs: 120 },
  { day: 'Sun', subs: 89 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage classrooms, problems, and view analytics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Students', value: mockClassrooms.reduce((a, c) => a + c.studentCount, 0) },
          { label: 'Problems', value: mockProblems.length },
          { label: 'Submissions today', value: mockSubmissions.length },
        ].map((s) => (
          <Card key={s.label} className="shadow-none">
            <CardContent className="p-6">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Submissions this week</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={chartTick} stroke="#94a3b8" />
              <YAxis tick={chartTick} stroke="#94a3b8" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="subs" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
