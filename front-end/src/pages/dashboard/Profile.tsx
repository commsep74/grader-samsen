import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { Shield, Medal, Trophy, Crown } from 'lucide-react'
import { getRankFromXp } from '@/lib/ranks'
import { cn } from '@/lib/utils'

const badges = ['First AC', 'Week Streak', 'Top 10', 'Graph Master']

export default function Profile() {
  const user = useAppStore((s) => s.user)
  const isStudent = user?.role === 'student'

  const userXp = user?.xp ?? 0
  const { currentRank, nextRank, xpToNext, progressPercent } = getRankFromXp(userXp)

  const rankIcons = {
    Shield,
    Medal,
    Trophy,
    Crown,
  }
  const RankIcon = rankIcons[currentRank.iconName]

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Profile" description={isStudent ? "XP, badges, and account overview." : "Account overview and settings."} />

      <Card className="overflow-hidden border border-border/80 shadow-sm transition-all duration-300 hover:border-border">
        <CardHeader className="bg-gradient-to-b from-muted/30 to-card">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                {(user?.name ?? 'G').charAt(0).toUpperCase()}
              </div>
              {isStudent && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card shadow-md animate-in fade-in zoom-in-50 duration-300",
                  currentRank.bgColorClass
                )}>
                  <RankIcon className={cn("h-3.5 w-3.5", currentRank.colorClass)} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight">{user?.name ?? 'Guest'}</CardTitle>
                <Badge variant="outline" className="capitalize text-xs font-semibold">
                  {user?.role ?? 'Student'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>
        </CardHeader>
        
        {isStudent && (
          <CardContent className="border-t border-border p-6">
            <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{userXp}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{user?.streak ?? 0} days</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</p>
                <p className={cn("text-2xl font-extrabold tracking-tight", currentRank.colorClass)}>
                  {currentRank.label}
                </p>
              </div>
            </div>

            {nextRank ? (
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-muted-foreground">Progress to {nextRank.label}</span>
                  <span className="text-foreground font-mono tabular-nums">{userXp} / {nextRank.minXp} XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                  <div 
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", currentRank.gradientClass)} 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>
                    You need <strong className="text-foreground tabular-nums font-semibold">{xpToNext} more XP</strong> to reach the next tier. Keep solving problems!
                  </span>
                </p>
              </div>
            ) : (
              <div className="mt-6 border-t border-border pt-6">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", currentRank.gradientClass)} 
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>
                    Congratulations! You have reached <strong className="text-foreground font-semibold">Maximum Level ({currentRank.label})</strong>.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {isStudent && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b} variant="outline" className="px-3 py-1 text-xs font-medium hover:bg-accent transition-colors duration-200">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
