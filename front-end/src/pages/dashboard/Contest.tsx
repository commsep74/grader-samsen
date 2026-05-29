import { Link } from 'react-router-dom'
import { Clock, Lock } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
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
      <PageHeader
        title={mockContest.title}
        description="Live contest mode with penalty scoring."
      >
        <Card className="sm:min-w-[200px]">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-xs text-muted-foreground">Time remaining</p>
              <p className="font-mono text-xl font-semibold tabular-nums">{remaining}</p>
            </div>
          </CardContent>
        </Card>
      </PageHeader>

      {mockContest.frozen && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Scoreboard frozen — final standings hidden until contest ends.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p, i) => (
          <Link key={p!.id} to={`/app/problems/${p!.id}`} className="group block">
            <Card className="transition-[box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                  <Badge variant="outline" className="capitalize">
                    {p!.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-base group-hover:text-primary">{p!.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">
                  {p!.timeLimit}ms · {p!.memoryLimit}MB
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
