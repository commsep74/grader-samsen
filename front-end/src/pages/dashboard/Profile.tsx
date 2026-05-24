import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

const badges = ['First AC', 'Week Streak', 'Contest Top 10', 'Graph Master']

export default function Profile() {
  const user = useAppStore((s) => s.user)

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">XP, badges, and account settings.</p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{user?.name ?? 'Guest'}</CardTitle>
          <p className="text-sm text-gray-500">@{user?.username}</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-500">XP</p>
            <p className="text-xl font-semibold">{user?.xp ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Streak</p>
            <p className="text-xl font-semibold">{user?.streak ?? 0} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tier</p>
            <p className="text-xl font-semibold">{user?.tier ?? 'Bronze'}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium mb-3">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge key={b} variant="outline">{b}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
