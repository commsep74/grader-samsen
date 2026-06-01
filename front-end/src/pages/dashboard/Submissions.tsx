import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { VerdictBadge } from '@/components/VerdictBadge'
import { mockProblems, mockSubmissions } from '@/lib/mock-data'
import { useAppStore } from '@/store/useAppStore'

export default function Submissions() {
  const { user, studentSubmissions, submissions, problems, fetchSubmissions, fetchProblems } = useAppStore()
  const userId = user?.id ?? ''
  const isStudent = user?.role === 'student'

  useEffect(() => {
    fetchSubmissions()
    fetchProblems()
  }, [fetchSubmissions, fetchProblems])

  // Get submissions list
  let submissionsList = submissions.length > 0 ? submissions : []
  if (submissionsList.length === 0) {
    submissionsList = isStudent ? (studentSubmissions[userId] ?? []) : mockSubmissions
  }

  // Combine database problems and mock problems for title resolution
  const allProblems = [...problems, ...mockProblems]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Submissions"
        description="Your submission history and testcase results."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Problem</th>
                <th className="px-6 py-3">Lang</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissionsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No submissions yet. Solve some coding problems to see your history.
                  </td>
                </tr>
              ) : (
                submissionsList.map((s) => {
                  const problem = allProblems.find((p) => p.id === s.problemId)
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(s.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <Link
                          to={`/app/problems/${s.problemId}`}
                          className="text-primary hover:underline"
                        >
                          {problem?.title ?? s.problemId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs uppercase text-muted-foreground">
                        {s.language}
                      </td>
                      <td className="px-6 py-4">
                        <VerdictBadge verdict={s.verdict} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs tabular-nums text-muted-foreground">
                        {s.runtime != null ? `${s.runtime}ms` : '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold tabular-nums">{s.score ?? '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
