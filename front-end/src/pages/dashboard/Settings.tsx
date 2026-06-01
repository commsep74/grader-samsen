import { useAppStore } from '@/store/useAppStore'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'
import * as authApi from '@/lib/api'

export default function Settings() {
  const { isDark, toggleDark, user, setUser, logout, deleteAccount, resetStudentData } = useAppStore()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  // Profile Edit State
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password Edit State
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !username.trim()) {
      toast.error('Name and Username are required.')
      return
    }

    setIsSavingProfile(true)
    try {
      const updatedUser = await authApi.updateProfile(name, username)
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast.error('Please enter a new password.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await authApi.updatePassword(password)
      toast.success('Password updated successfully!')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setIsUpdatingPassword(false)
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
    <div className="max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader title="Settings" description="Appearance, account details, handle, and security preferences." />

      {/* Profile Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
          <CardDescription>Update your display name and unique handle.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Handle / Username</label>
              <Input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter unique handle"
              />
            </div>
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving Changes…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>Reset or configure a secure new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Updating Password…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
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

      {/* Account controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Actions</CardTitle>
          <CardDescription>Manage your credentials and login session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Username</span>
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
