import { Link } from 'react-router-dom'
import { BookOpen, Code2, Trophy, Activity } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { mockAnnouncements, mockAssignments, mockContest, mockLeaderboard, mockClassrooms } from '@/lib/mock-data'

export default function DashboardHome() {
  const { user, studentJoinedClassrooms, studentSubmissions } = useAppStore()
  const userId = user?.id ?? ''
  const isStudent = user?.role === 'student'

  const joinedIds = studentJoinedClassrooms[userId] ?? []
  const userSubmissions = studentSubmissions[userId] ?? []

  const acceptedSubmissions = userSubmissions.filter((s) => s.verdict === 'Accepted')
  const solvedCount = new Set(acceptedSubmissions.map((s) => s.problemId)).size

  const activeClassCount = isStudent ? joinedIds.length : mockClassrooms.length
  const problemsSolvedText = isStudent ? solvedCount.toString() : '24'
  const classRankText = isStudent ? (joinedIds.length > 0 ? '#3' : 'N/A') : '#3'

  const stats = [
    { label: 'Problems solved', value: problemsSolvedText, icon: Code2 },
    { label: 'Class rank', value: classRankText, icon: Trophy },
    { label: 'Active classes', value: activeClassCount.toString(), icon: BookOpen },
    { label: 'Streak', value: `${user?.streak ?? 0} days`, icon: Activity },
  ]

  const enrolledClassNames = mockClassrooms
    .filter((c) => joinedIds.includes(c.id))
    .map((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))

  const studentAssignments = isStudent
    ? mockAssignments.filter((a) => {
        const assignmentClassClean = a.className.toLowerCase().replace(/[^a-z0-9]/g, '')
        return enrolledClassNames.some(
          (name) => assignmentClassClean.includes(name) || name.includes(assignmentClassClean),
        )
      })
    : mockAssignments

  const studentAnnouncements = isStudent
    ? mockAnnouncements.filter((a) => joinedIds.includes(a.classId))
    : mockAnnouncements

  const showContest = !isStudent || joinedIds.length > 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Your assignments, contest, and recent activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-sm font-medium">Recent assignments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {studentAssignments.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No active assignments due.</p>
            ) : (
              <ul className="divide-y divide-border">
                {studentAssignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.className}</p>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {new Date(a.dueAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="text-sm font-medium">Active contest</CardTitle>
            {showContest && (
              <Link to="/app/contest" className="text-xs font-medium text-primary hover:underline">
                Open →
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!showContest ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Join a classroom to see active contests.
              </p>
            ) : (
              <>
                <p className="font-semibold text-foreground">{mockContest.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mockContest.problemIds.length} problems · Ends{' '}
                  {new Date(mockContest.endAt).toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="text-sm font-medium">Leaderboard preview</CardTitle>
            <Link to="/app/leaderboard" className="text-xs font-medium text-primary hover:underline">
              Full board →
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLeaderboard.slice(0, 3).map((e) => (
                  <tr key={e.userId} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-3 font-mono tabular-nums text-muted-foreground">{e.rank}</td>
                    <td className="px-6 py-3 font-medium">{e.name}</td>
                    <td className="px-6 py-3 font-mono tabular-nums">{e.score}</td>
                    <td className="px-6 py-3 tabular-nums">{e.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {studentAnnouncements.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No recent announcements.</p>
            ) : (
              studentAnnouncements.map((a) => (
                <div key={a.id} className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
