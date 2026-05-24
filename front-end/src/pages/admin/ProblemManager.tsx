import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockProblems } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ProblemManager() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Problem manager</h1>
          <p className="mt-1 text-sm text-gray-500">Create and edit problems, statements, limits.</p>
        </div>
        <Button onClick={() => toast.message('Problem editor — connect to Supabase/Firebase')}>
          <Plus className="h-4 w-4" /> New problem
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Difficulty</th>
              <th className="px-6 py-3 font-medium">Limits</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProblems.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-900">
                <td className="px-6 py-4 font-medium">{p.title}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="capitalize">{p.difficulty}</Badge>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                  {p.timeLimit}ms / {p.memoryLimit}MB
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
