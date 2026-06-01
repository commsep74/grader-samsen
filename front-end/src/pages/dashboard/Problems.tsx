import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

const difficultyStyle = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const

export default function Problems() {
  const fetchProblems = useAppStore((s) => s.fetchProblems)
  const dbProblems = useAppStore((s) => s.problems)

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  // Show database-created problems directly
  const displayProblems = dbProblems

  return (
    <div className="space-y-8">
      <PageHeader
        title="Problems"
        description="Browse and solve problems from your classes."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Solved</th>
                <th className="px-6 py-3">Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayProblems.map((p, i) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 font-mono tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/app/problems/${p.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {p.tags?.map((t) => (
                        <span key={t} className="text-xs text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={difficultyStyle[p.difficulty]} className="capitalize">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 tabular-nums text-muted-foreground">{p.solvedCount}</td>
                  <td className="px-6 py-4 font-mono text-xs tabular-nums text-muted-foreground">
                    {p.timeLimit}ms / {p.memoryLimit}MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
