import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Medal, Trophy, Crown, Activity, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import * as api from '@/lib/api'
import { getRankFromXp } from '@/lib/ranks'
import type { XPLeaderboardEntry } from '@/lib/api'

export default function Leaderboard() {
  const currentUser = useAppStore((s) => s.user)
  const [leaderboard, setLeaderboard] = useState<XPLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await api.fetchLeaderboard()
        setLeaderboard(data)
      } catch {
        // Fallback silently or keep empty
      } finally {
        setLoading(false)
      }
    }
    void loadLeaderboard()
  }, [])

  const rankIcons = {
    Shield,
    Medal,
    Trophy,
    Crown,
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Leaderboard"
        description="Global student rankings based on earned XP and coding activity."
      />

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No rankings yet. Start solving problems to rank up!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="w-20 px-6 py-3.5 text-center">Rank</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Tier</th>
                  <th className="px-6 py-3.5">Streak</th>
                  <th className="px-6 py-3.5 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((e, i) => {
                  const isSelf = e.userId === currentUser?.id
                  const { currentRank } = getRankFromXp(e.xp)
                  const RankIcon = rankIcons[currentRank.iconName]

                  return (
                    <motion.tr
                      key={e.userId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.25, ease: 'easeOut' }}
                      className={cn(
                        'transition-colors hover:bg-muted/40',
                        isSelf && 'bg-accent/40 hover:bg-accent/50 font-medium',
                      )}
                    >
                      <td className="px-6 py-4 text-center font-mono font-bold tabular-nums">
                        {e.rank === 1 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 text-xs">1</span>
                        ) : e.rank === 2 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">2</span>
                        ) : e.rank === 3 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">3</span>
                        ) : (
                          <span className="text-muted-foreground">{e.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{e.name}</span>
                          {isSelf && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">You</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">@{e.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                          currentRank.bgColorClass,
                          currentRank.borderColorClass
                        )}>
                          <RankIcon className={cn("h-3.5 w-3.5", currentRank.colorClass)} />
                          <span className={cn("font-medium", currentRank.colorClass)}>
                            {currentRank.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono tabular-nums text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-primary/80" />
                          {e.streak} day{e.streak === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold tabular-nums text-foreground">
                        {e.xp.toLocaleString()} XP
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
