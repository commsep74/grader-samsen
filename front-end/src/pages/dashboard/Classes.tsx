import { useState } from 'react'
import { Copy, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockClassrooms } from '@/lib/mock-data'
import { useAppStore } from '@/store/useAppStore'

export default function Classes() {
  const { user, studentJoinedClassrooms, joinClassroom } = useAppStore()
  const [joinCode, setJoinCode] = useState('')

  const userId = user?.id ?? ''
  const isStudent = user?.role === 'student'
  const joinedIds = studentJoinedClassrooms[userId] ?? []

  // If student, filter by joined ids. If teacher/admin, show all classrooms by default
  const enrolledClasses = isStudent
    ? mockClassrooms.filter((c) => joinedIds.includes(c.id))
    : mockClassrooms

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code)
    toast.success('Class code copied')
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Classes" description="Join with a code or view enrolled classes." />

      {isStudent && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Join class</CardTitle>
            <CardDescription>Enter the code from your teacher.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="e.g. ALGO7X2"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
            <Button
              onClick={() => {
                if (!joinCode) return
                const matched = mockClassrooms.find((c) => c.code === joinCode)
                if (matched) {
                  if (joinedIds.includes(matched.id)) {
                    toast.error('You are already enrolled in this class')
                  } else {
                    joinClassroom(userId, matched.id)
                    toast.success(`Successfully joined class: ${matched.name}`)
                    setJoinCode('')
                  }
                } else {
                  toast.error('Invalid class code. Please try again.')
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Join
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {enrolledClasses.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-dashed border-border bg-muted/50 py-10 text-center text-sm text-muted-foreground">
            No classes joined yet. Enter a class code above to enroll.
          </div>
        ) : (
          enrolledClasses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.name}</CardTitle>
                <CardDescription>{c.description ?? `${c.studentCount} students`}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <code className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-sm">
                  {c.code}
                </code>
                <Button variant="ghost" size="icon" onClick={() => copyCode(c.code)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
