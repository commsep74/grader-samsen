import { useAppStore } from '@/store/useAppStore'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'

export default function Settings() {
  const { isDark, toggleDark, user, logout, deleteAccount, resetStudentData } = useAppStore()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const isStudent = user?.role === 'student'

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
    )
    if (!confirm) return

    setIsDeleting(true)
    try {
      await deleteAccount()
      toast.success('Account successfully deleted.')
      navigate('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetProgress = () => {
    const confirm = window.confirm(
      'Are you sure you want to reset all your classroom enrollments and submission history? This action is permanent and cannot be undone.',
    )
    if (confirm && user?.id) {
      resetStudentData(user.id)
      toast.success('Your classrooms and submissions have been successfully reset.')
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <PageHeader title="Settings" description="Appearance, account, and preferences." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Dark mode and editor preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleDark}>
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your credentials and login session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</span>
            <span className="text-sm font-semibold">@{user?.username}</span>
            <span className="mt-1 text-xs text-muted-foreground">Role: {user?.role}</span>
          </div>

          {isStudent && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Reset student progress</h4>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90">
                Reset classroom enrollments, assignments, solved problems, and submissions.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetProgress}
                className="mt-1 border-amber-300 text-amber-900 hover:bg-amber-100/80 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/50"
              >
                Reset progress
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="outline" onClick={handleLogout} className="sm:flex-1">
              Log out
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="sm:flex-1"
            >
              {isDeleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
