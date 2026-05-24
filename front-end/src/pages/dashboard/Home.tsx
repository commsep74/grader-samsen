import { Link } from 'react-router-dom'
import { BookOpen, Code2, Trophy, Activity } from 'lucide-react'
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

  // Active classrooms count
  const activeClassCount = isStudent ? joinedIds.length : mockClassrooms.length

  // Problems solved count
  const problemsSolvedText = isStudent ? solvedCount.toString() : '24'

  // Class rank
  const classRankText = isStudent ? (joinedIds.length > 0 ? '#3' : 'N/A') : '#3'

  const stats = [
    { label: 'Problems solved', value: problemsSolvedText, icon: Code2 },
    { label: 'Class rank', value: classRankText, icon: Trophy },
    { label: 'Active classes', value: activeClassCount.toString(), icon: BookOpen },
    { label: 'Streak', value: `${user?.streak ?? 0} days`, icon: Activity },
  ]

  // Filter assignments based on enrolled classrooms
  const enrolledClassNames = mockClassrooms
    .filter((c) => joinedIds.includes(c.id))
    .map((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))

  const studentAssignments = isStudent
    ? mockAssignments.filter((a) => {
        const assignmentClassClean = a.className.toLowerCase().replace(/[^a-z0-9]/g, '')
        return enrolledClassNames.some(
          (name) => assignmentClassClean.includes(name) || name.includes(assignmentClassClean)
        )
      })
    : mockAssignments

  // Filter announcements
  const studentAnnouncements = isStudent
    ? mockAnnouncements.filter((a) => joinedIds.includes(a.classId))
    : mockAnnouncements

  // Contest visibility
  const showContest = !isStudent || joinedIds.length > 0

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="mt-1 text-sm text-gray-500">Your assignments, contest, and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="shadow-none border-gray-200 dark:border-gray-800">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold mt-0.5">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent assignments */}
        <Card className="shadow-none border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-sm font-medium">Recent assignments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {studentAssignments.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No active assignments due.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {studentAssignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.className}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(a.dueAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Active contest */}
        <Card className="shadow-none border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active contest</CardTitle>
              {showContest && (
                <Link to="/app/contest" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Open →</Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!showContest ? (
              <p className="text-sm text-gray-500 text-center py-4">Join a classroom to see active contests.</p>
            ) : (
              <>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{mockContest.title}</p>
                <p className="mt-1 text-sm text-gray-500">{mockContest.problemIds.length} problems · Ends {new Date(mockContest.endAt).toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard preview */}
        <Card className="shadow-none lg:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Leaderboard preview</CardTitle>
              <Link to="/app/leaderboard" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Full board →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {mockLeaderboard.slice(0, 3).map((e) => (
                  <tr key={e.userId} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="px-6 py-3 font-mono text-gray-500">{e.rank}</td>
                    <td className="px-6 py-3 font-medium">{e.name}</td>
                    <td className="px-6 py-3 font-mono">{e.score}</td>
                    <td className="px-6 py-3">{e.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="shadow-none lg:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {studentAnnouncements.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No recent announcements.</p>
            ) : (
              studentAnnouncements.map((a) => (
                <div key={a.id} className="border-l-2 border-indigo-500 pl-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{a.body}</p>
                  <p className="mt-2 text-xs text-gray-400 font-mono">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
