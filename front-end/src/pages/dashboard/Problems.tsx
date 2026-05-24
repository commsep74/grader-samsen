import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { mockProblems } from '@/lib/mock-data'

const difficultyStyle = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const

export default function Problems() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="mt-1 text-sm text-gray-500">Browse and solve problems from your classes.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium">#</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Difficulty</th>
              <th className="px-6 py-3 font-medium">Solved</th>
              <th className="px-6 py-3 font-medium">Limit</th>
            </tr>
          </thead>
          <tbody>
            {mockProblems.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-gray-900/50"
              >
                <td className="px-6 py-4 font-mono text-gray-500">{i + 1}</td>
                <td className="px-6 py-4">
                  <Link to={`/app/problems/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex gap-1">
                    {p.tags?.map((t) => (
                      <span key={t} className="text-xs text-gray-400">
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
                <td className="px-6 py-4 text-gray-500">{p.solvedCount}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                  {p.timeLimit}ms / {p.memoryLimit}MB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
