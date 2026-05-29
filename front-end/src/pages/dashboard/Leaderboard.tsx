import { motion } from 'framer-motion'
import { PageHeader } from '@/components/PageHeader'
import { mockLeaderboard } from '@/lib/mock-data'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function Leaderboard() {
  const user = useAppStore((s) => s.user)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        description="Real-time rankings for the active contest."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-16 px-6 py-3">Rank</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Penalty</th>
                <th className="px-6 py-3">Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockLeaderboard.map((e, i) => (
                <motion.tr
                  key={e.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    e.name === user?.name && 'bg-accent/50',
                  )}
                >
                  <td className="px-6 py-4 font-mono font-medium tabular-nums">{e.rank}</td>
                  <td className="px-6 py-4 font-medium">
                    {e.name}
                    {e.name === user?.name && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono tabular-nums">{e.score}</td>
                  <td className="px-6 py-4 font-mono tabular-nums text-muted-foreground">{e.penalty}</td>
                  <td className="px-6 py-4 tabular-nums">{e.solved}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
