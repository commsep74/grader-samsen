import { Link } from 'react-router-dom'
import { Clock, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockContest, mockProblems } from '@/lib/mock-data'
import { useContestTimer } from '@/hooks/useContestTimer'

export default function Contest() {
  const remaining = useContestTimer(mockContest.endAt)
  const problems = mockContest.problemIds
    .map((id) => mockProblems.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{mockContest.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Live contest mode with penalty scoring.</p>
        </div>
        <Card className="shadow-none sm:min-w-[200px]">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Time remaining</p>
              <p className="font-mono text-xl font-semibold">{remaining}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {mockContest.frozen && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <Lock className="h-4 w-4" />
          Scoreboard frozen — final standings hidden until contest ends.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p, i) => (
          <Link key={p!.id} to={`/app/problems/${p!.id}`}>
            <Card className="shadow-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">{String.fromCharCode(65 + i)}</span>
                  <Badge variant="outline" className="capitalize">{p!.difficulty}</Badge>
                </div>
                <CardTitle className="text-base">{p!.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">{p!.timeLimit}ms · {p!.memoryLimit}MB</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
