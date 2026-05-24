import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Code2,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
  Users,
  BarChart3,
  FileCode,
  ClipboardList,
} from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

const studentNav = [
  { name: 'Home', path: '/app', icon: Home, end: true },
  { name: 'Classes', path: '/app/classes', icon: BookOpen },
  { name: 'Problems', path: '/app/problems', icon: Code2 },
  { name: 'Submissions', path: '/app/submissions', icon: History },
  { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
  { name: 'Contest', path: '/app/contest', icon: LayoutDashboard },
  { name: 'Profile', path: '/app/profile', icon: User },
]

const teacherNav = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Problems', path: '/admin/problems', icon: FileCode },
  { name: 'Testcases', path: '/admin/testcases', icon: ClipboardList },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Contests', path: '/admin/contests', icon: Trophy },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
]

export default function DashboardLayout({ admin = false }: { admin?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isDark, toggleDark, logout } = useAppStore()
  const navItems = admin ? teacherNav : studentNav
  const base = admin ? '/admin' : '/app'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b border-gray-200 px-5 dark:border-gray-800">
          <Link to="/">
            <BrandMark />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.end
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-gray-50',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <div className="mb-2 truncate px-3 text-xs text-gray-500">{user?.username ?? 'Guest'}</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`${base}/settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 sm:px-8">
          <Link to="/" className="lg:hidden">
            <BrandMark className="text-sm" />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user?.tier && (
              <span className="hidden text-xs text-gray-500 sm:inline">
                {user.tier} · {user.xp} XP
              </span>
            )}
            <span className="text-sm font-medium">{user?.name ?? 'Student'}</span>
          </div>
        </header>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 sm:p-8 lg:p-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
