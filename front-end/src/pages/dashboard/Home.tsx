import { Link } from 'react-router-dom'
import { BookOpen, Code2, Trophy, Activity, Shield, Medal, Crown } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { mockAnnouncements, mockAssignments, mockLeaderboard, mockClassrooms } from '@/lib/mock-data'
import { getRankFromXp } from '@/lib/ranks'
import { cn } from '@/lib/utils'

export default function DashboardHome() {
  const { user, studentJoinedClassrooms, studentSubmissions } = useAppStore()
  const userId = user?.id ?? ''
  const isStudent = user?.role === 'student'

  const joinedIds = studentJoinedClassrooms[userId] ?? []
  const userSubmissions = studentSubmissions[userId] ?? []

  const acceptedSubmissions = userSubmissions.filter((s) => s.verdict === 'Accepted')
  const solvedCount = new Set(acceptedSubmissions.map((s) => s.problemId)).size

  const activeClassCount = isStudent ? joinedIds.length : mockClassrooms.length
  const problemsSolvedText = isStudent ? solvedCount.toString() : '0'

  const userXp = user?.xp ?? 0
  const { currentRank, nextRank, xpToNext } = getRankFromXp(userXp)

  const rankIcons = {
    Shield,
    Medal,
    Trophy,
    Crown,
  }
  const RankIcon = rankIcons[currentRank.iconName]

  const stats = [
    { label: 'Problems solved', value: problemsSolvedText, icon: Code2, colorClass: 'text-primary', bgColorClass: 'bg-accent' },
    ...(isStudent
      ? [
          {
            label: 'Rank',
            value: currentRank.label,
            icon: RankIcon,
            colorClass: currentRank.colorClass,
            bgColorClass: currentRank.bgColorClass,
            borderColorClass: currentRank.borderColorClass,
            subtext: nextRank ? `${xpToNext} XP to ${nextRank.label}` : 'Max tier achieved',
          },
        ]
      : []),
    { label: 'Active classes', value: activeClassCount.toString(), icon: BookOpen, colorClass: 'text-primary', bgColorClass: 'bg-accent' },
    { label: 'Streak', value: `${user?.streak ?? 0} days`, icon: Activity, colorClass: 'text-primary', bgColorClass: 'bg-accent' },
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

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Your assignments and recent activity."
      />

      <div className={cn("grid gap-4 sm:grid-cols-2", isStudent ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className={cn("transition-all duration-200 hover:shadow-md", s.borderColorClass && `border ${s.borderColorClass}`)}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", s.bgColorClass)}>
                  <Icon className={cn("h-5 w-5", s.colorClass)} aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{s.value}</p>
                  {s.subtext && <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{s.subtext}</p>}
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

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="text-sm font-medium">Leaderboard preview</CardTitle>
            <Link to="/app/leaderboard" className="text-xs font-medium text-primary hover:underline">
              Full board →
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {mockLeaderboard.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No rankings yet.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
