import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { PageHeader } from '@/components/PageHeader'
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
    <div className="space-y-8">
      <PageHeader
        title="Admin dashboard"
        description="Manage classrooms, problems, and view analytics."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Students', value: mockClassrooms.reduce((a, c) => a + c.studentCount, 0) },
          { label: 'Problems', value: mockProblems.length },
          { label: 'Submissions today', value: mockSubmissions.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Submissions this week</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={chartTick} stroke="var(--color-muted-foreground)" />
              <YAxis tick={chartTick} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="subs" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
