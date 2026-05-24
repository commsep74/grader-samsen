import { Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const students = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@school.edu', submissions: 24 },
  { id: 'u3', name: 'Maya Patel', email: 'maya@school.edu', submissions: 31 },
  { id: 'u4', name: 'Jordan Lee', email: 'jordan@school.edu', submissions: 18 },
]

export default function UserManager() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User manager</h1>
          <p className="mt-1 text-sm text-gray-500">Import students, export scores, and manage rosters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.message('CSV import')}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => toast.success('Scores exported')}>
            <Download className="h-4 w-4" /> Export scores
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Submissions</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-900">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-gray-500">{s.email}</td>
                <td className="px-6 py-4">{s.submissions}</td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">View logs</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
