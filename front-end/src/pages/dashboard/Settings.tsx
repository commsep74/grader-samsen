import { useAppStore } from '@/store/useAppStore'
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
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.'
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
      'Are you sure you want to reset all your classroom enrollments and submission history? This action is permanent and cannot be undone.'
    )
    if (confirm && user?.id) {
      resetStudentData(user.id)
      toast.success('Your classrooms and submissions have been successfully reset.')
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      
      <Card className="shadow-none border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance</CardTitle>
          <CardDescription className="text-gray-500">Dark mode and editor preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleDark}>
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-none border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account</CardTitle>
          <CardDescription className="text-gray-500">
            Manage your credentials and login session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-1 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Username</span>
            <span className="text-sm font-semibold">@{user?.username}</span>
            <span className="text-xs text-gray-400 mt-1">Role: {user?.role}</span>
          </div>

          {isStudent && (
            <div className="rounded-md border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950/30 dark:bg-amber-950/10 space-y-2">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Reset Student Progress</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Instantly reset your classroom enrollments, recent assignments, solved problems counter, and submissions list back to a clean slate.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetProgress}
                className="mt-1 border-amber-200 hover:bg-amber-100/50 text-amber-800 dark:border-amber-950 dark:hover:bg-amber-950/50 dark:text-amber-300"
              >
                Reset Progress
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" onClick={handleLogout} className="sm:flex-1">
              Log Out
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              disabled={isDeleting}
              className="sm:flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white dark:bg-red-700 dark:hover:bg-red-800 dark:text-white border-none"
            >
              {isDeleting ? 'Deleting…' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
