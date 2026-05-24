import { Link } from 'react-router-dom'
import { VerdictBadge } from '@/components/VerdictBadge'
import { mockProblems, mockSubmissions } from '@/lib/mock-data'
import { useAppStore } from '@/store/useAppStore'

export default function Submissions() {
  const { user, studentSubmissions } = useAppStore()
  const userId = user?.id ?? ''
  const isStudent = user?.role === 'student'

  const submissionsList = isStudent
    ? studentSubmissions[userId] ?? []
    : mockSubmissions

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">Your submission history and testcase results.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-semibold">When</th>
              <th className="px-6 py-3 font-semibold">Problem</th>
              <th className="px-6 py-3 font-semibold">Lang</th>
              <th className="px-6 py-3 font-semibold">Verdict</th>
              <th className="px-6 py-3 font-semibold">Time</th>
              <th className="px-6 py-3 font-semibold">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {submissionsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No submissions yet. Solve some coding problems to see your history!
                </td>
              </tr>
            ) : (
              submissionsList.map((s) => {
                const problem = mockProblems.find((p) => p.id === s.problemId)
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium">
                      <Link to={`/app/problems/${s.problemId}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                        {problem?.title ?? s.problemId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase text-gray-600 dark:text-gray-400">{s.language}</td>
                    <td className="px-6 py-4"><VerdictBadge verdict={s.verdict} /></td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{s.runtime != null ? `${s.runtime}ms` : '—'}</td>
                    <td className="px-6 py-4 font-semibold">{s.score ?? '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
