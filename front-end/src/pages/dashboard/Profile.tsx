import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

const badges = ['First AC', 'Week Streak', 'Contest Top 10', 'Graph Master']

export default function Profile() {
  const user = useAppStore((s) => s.user)

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Profile" description="XP, badges, and account overview." />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {(user?.name ?? 'G').charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle>{user?.name ?? 'Guest'}</CardTitle>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div>
            <p className="text-xs text-muted-foreground">XP</p>
            <p className="text-xl font-semibold tabular-nums">{user?.xp ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-xl font-semibold tabular-nums">{user?.streak ?? 0} days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tier</p>
            <p className="text-xl font-semibold">{user?.tier ?? 'Bronze'}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge key={b} variant="outline">
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
