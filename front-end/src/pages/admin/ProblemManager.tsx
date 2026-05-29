import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockProblems } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ProblemManager() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Problem manager"
        description="Create and edit problems, statements, limits."
      >
        <Button onClick={() => toast.message('Problem editor — connect to Supabase/Firebase')}>
          <Plus className="h-4 w-4" /> New problem
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Limits</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockProblems.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs tabular-nums text-muted-foreground">
                    {p.timeLimit}ms / {p.memoryLimit}MB
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
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
