import { motion } from 'framer-motion'
import { mockLeaderboard } from '@/lib/mock-data'
import { useAppStore } from '@/store/useAppStore'

export default function Leaderboard() {
  const user = useAppStore((s) => s.user)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">Real-time rankings for the active contest.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium w-16">Rank</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Penalty</th>
              <th className="px-6 py-3 font-medium">Solved</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((e, i) => (
              <motion.tr
                key={e.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-gray-100 dark:border-gray-900 ${
                  e.name === user?.name ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                }`}
              >
                <td className="px-6 py-4 font-mono font-medium">{e.rank}</td>
                <td className="px-6 py-4">
                  {e.name}
                  {e.name === user?.name && (
                    <span className="ml-2 text-xs text-gray-400">(you)</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono">{e.score}</td>
                <td className="px-6 py-4 font-mono text-gray-500">{e.penalty}</td>
                <td className="px-6 py-4">{e.solved}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
