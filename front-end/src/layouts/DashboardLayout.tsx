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
  MoreHorizontal,
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

const mobileStudentNav = [
  { name: 'Home', path: '/app', icon: Home, end: true },
  { name: 'Problems', path: '/app/problems', icon: Code2 },
  { name: 'Submissions', path: '/app/submissions', icon: History },
  { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
  { name: 'More', path: '/app/profile', icon: MoreHorizontal },
]

const mobileTeacherNav = [
  { name: 'Home', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Problems', path: '/admin/problems', icon: FileCode },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'More', path: '/admin/contests', icon: MoreHorizontal },
]

function NavLink({
  item,
  active,
}: {
  item: (typeof studentNav)[number]
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {active && <span className="nav-active-indicator" aria-hidden />}
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
      {item.name}
    </Link>
  )
}

export default function DashboardLayout({ admin = false }: { admin?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isDark, toggleDark, logout } = useAppStore()
  const navItems = admin ? teacherNav : studentNav
  const mobileNav = admin ? mobileTeacherNav : mobileStudentNav
  const base = admin ? '/admin' : '/app'

  const isActive = (item: (typeof studentNav)[number]) =>
    item.end
      ? location.pathname === item.path
      : location.pathname === item.path || location.pathname.startsWith(item.path + '/')

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card shadow-sm lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link to="/" className="rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
            <BrandMark />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} active={isActive(item)} />
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{user?.name ?? 'Guest'}</span>
            {user?.username && <span className="block truncate opacity-80">@{user.username}</span>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`${base}/settings`} aria-label="Settings">
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

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 sm:px-8">
          <Link to="/" className="lg:hidden">
            <BrandMark />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user?.tier && (
              <span className="hidden rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:inline">
                {user.tier} · {user.xp} XP
              </span>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {(user?.name ?? 'S').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-7xl p-6 pb-24 sm:p-8 lg:pb-10 lg:p-10"
        >
          <Outlet />
        </motion.main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNav.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
