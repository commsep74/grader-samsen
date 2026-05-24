import { Link } from 'react-router-dom'
import { BookOpen, Code2, Trophy, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { mockAnnouncements, mockAssignments, mockContest, mockLeaderboard } from '@/lib/mock-data'

export default function DashboardHome() {
  const user = useAppStore((s) => s.user)

  const stats = [
    { label: 'Problems solved', value: '24', icon: Code2 },
    { label: 'Class rank', value: '#3', icon: Trophy },
    { label: 'Active classes', value: '2', icon: BookOpen },
    { label: 'Streak', value: `${user?.streak ?? 0} days`, icon: Activity },
  ]

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
            <Card key={s.label} className="shadow-none">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-800">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-semibold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-sm font-medium">Recent assignments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {mockAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.className}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(a.dueAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active contest</CardTitle>
              <Link to="/app/contest" className="text-xs text-gray-500 hover:text-gray-900">Open →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="font-medium">{mockContest.title}</p>
            <p className="mt-1 text-sm text-gray-500">{mockContest.problemIds.length} problems · Ends {new Date(mockContest.endAt).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Leaderboard preview</CardTitle>
              <Link to="/app/leaderboard" className="text-xs text-gray-500 hover:text-gray-900">Full board →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Solved</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.slice(0, 3).map((e) => (
                  <tr key={e.userId} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="px-6 py-3 font-mono text-gray-500">{e.rank}</td>
                    <td className="px-6 py-3">{e.name}</td>
                    <td className="px-6 py-3 font-mono">{e.score}</td>
                    <td className="px-6 py-3">{e.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {mockAnnouncements.map((a) => (
              <div key={a.id}>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-gray-500">{a.body}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
