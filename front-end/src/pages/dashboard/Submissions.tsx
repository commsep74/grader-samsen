import { Link } from 'react-router-dom'
import { VerdictBadge } from '@/components/VerdictBadge'
import { mockProblems, mockSubmissions } from '@/lib/mock-data'

export default function Submissions() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">Your submission history and testcase results.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium">When</th>
              <th className="px-6 py-3 font-medium">Problem</th>
              <th className="px-6 py-3 font-medium">Lang</th>
              <th className="px-6 py-3 font-medium">Verdict</th>
              <th className="px-6 py-3 font-medium">Time</th>
              <th className="px-6 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {mockSubmissions.map((s) => {
              const problem = mockProblems.find((p) => p.id === s.problemId)
              return (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="px-6 py-4 text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Link to={`/app/problems/${s.problemId}`} className="font-medium hover:underline">
                      {problem?.title ?? s.problemId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs uppercase">{s.language}</td>
                  <td className="px-6 py-4"><VerdictBadge verdict={s.verdict} /></td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{s.runtime}ms</td>
                  <td className="px-6 py-4">{s.score ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
