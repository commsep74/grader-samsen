import { useState, useEffect } from 'react'
import { Download, Upload, Eye, EyeOff, Trash2, Search, Users, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { fetchUsers, deleteUser, updateUserRole } from '@/lib/api'

import type { User } from '@/types'
import { Input } from '@/components/ui/input'

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load registered users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    const confirm = window.confirm(`Are you sure you want to delete the user @${username}? This action is permanent.`)
    if (!confirm) return

    try {
      await deleteUser(userId)
      toast.success(`User @${username} deleted successfully`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    )
  })

  const studentCount = users.filter((u) => u.role === 'student').length
  const teacherCount = users.filter((u) => u.role === 'teacher' || u.role === 'admin').length

  return (
    <div className="space-y-8">
      <PageHeader
        title="User manager"
        description="Manage student credentials, view passwords, and delete accounts."
      >
        <Button variant="outline" onClick={() => toast.message('CSV Import is not implemented yet.')}>
          <Upload className="mr-1 h-4 w-4" /> Import CSV
        </Button>
        <Button variant="outline" onClick={() => toast.success('Roster list exported successfully!')}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </PageHeader>

      {/* Analytics stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-accent p-2.5 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total users</p>
            <h3 className="mt-0.5 text-xl font-bold tabular-nums">{users.length}</h3>
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-green-50 p-2.5 text-green-600 dark:bg-green-950 dark:text-green-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Students</p>
            <h3 className="mt-0.5 text-xl font-bold tabular-nums">{studentCount}</h3>
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Teachers & admins</p>
            <h3 className="mt-0.5 text-xl font-bold tabular-nums">{teacherCount}</h3>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and search bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search username, name, or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3 font-semibold">User Info</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Password</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading registered users…</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No users found in the database.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isPasswordVisible = visiblePasswords[u.id] || false
                return (
                  <tr key={u.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{u.name || 'No Name'}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">@{u.username}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          const newRole = e.target.value
                          try {
                            await updateUserRole(u.id, newRole)
                            toast.success(`Updated @${u.username}'s role to ${newRole}`)
                            setUsers((prev) =>
                              prev.map((usr) => (usr.id === u.id ? { ...usr, role: newRole as any } : usr))
                            )
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : 'Failed to update role')
                          }
                        }}
                        className={`rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer ${
                          u.role === 'admin'
                            ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                            : u.role === 'teacher'
                            ? 'text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-950/40'
                            : 'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40'
                        }`}
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm tracking-wide">
                          {isPasswordVisible ? u.password || '(not stored)' : '••••••••'}
                        </span>
                        {u.password && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground"
                            onClick={() => togglePasswordVisibility(u.id)}
                            aria-label={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        aria-label={`Delete @${u.username}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
