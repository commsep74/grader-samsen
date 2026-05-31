import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartTick, chartTooltipStyle } from '@/lib/utils'

const acRate = [
  { week: 'W1', rate: 0 },
  { week: 'W2', rate: 0 },
  { week: 'W3', rate: 0 },
  { week: 'W4', rate: 0 },
]

export default function Analytics() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Acceptance rates, plagiarism flags, class performance."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acceptance rate over time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={acRate}>
              <XAxis dataKey="week" tick={chartTick} stroke="var(--color-muted-foreground)" />
              <YAxis tick={chartTick} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Plagiarism flags</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rejudge queue</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
