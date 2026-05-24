import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartTick, chartTooltipStyle } from '@/lib/utils'

const acRate = [
  { week: 'W1', rate: 62 },
  { week: 'W2', rate: 68 },
  { week: 'W3', rate: 71 },
  { week: 'W4', rate: 74 },
]

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Acceptance rates, plagiarism flags, class performance.</p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acceptance rate over time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={acRate}>
              <XAxis dataKey="week" tick={chartTick} stroke="#94a3b8" />
              <YAxis tick={chartTick} stroke="#94a3b8" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="rate" stroke="#111827" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="p-6">
            <p className="text-xs text-gray-500">Plagiarism flags</p>
            <p className="text-2xl font-semibold">2</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-6">
            <p className="text-xs text-gray-500">Rejudge queue</p>
            <p className="text-2xl font-semibold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
