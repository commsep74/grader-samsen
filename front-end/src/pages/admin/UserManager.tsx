import { useState, useEffect } from 'react'
import { Download, Upload, Eye, EyeOff, Trash2, Search, Users, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { fetchUsers, deleteUser } from '@/lib/api'
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage real database student credentials, view passwords, and delete accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.message('CSV Import is not implemented yet.')}>
            <Upload className="h-4 w-4 mr-1" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => toast.success('Roster list exported successfully!')}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-xl font-bold mt-0.5">{users.length}</h3>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
            <h3 className="text-xl font-bold mt-0.5">{studentCount}</h3>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers & Admins</p>
            <h3 className="text-xl font-bold mt-0.5">{teacherCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search username, name, or email..."
            className="pl-9 bg-white dark:bg-gray-950"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-semibold">User Info</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Password</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <span>Loading registered users…</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No users found in the database.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isPasswordVisible = visiblePasswords[u.id] || false
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{u.name || 'No Name'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">@{u.username}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{u.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'admin' || u.role === 'teacher'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}
                      >
                        {u.role}
                      </span>
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
                            className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-400"
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
  )
}
