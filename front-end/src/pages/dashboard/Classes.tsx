import { useState } from 'react'
import { Copy, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockClassrooms } from '@/lib/mock-data'

export default function Classes() {
  const [joinCode, setJoinCode] = useState('')

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code)
    toast.success('Class code copied')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
          <p className="mt-1 text-sm text-gray-500">Join with a code or view enrolled classes.</p>
        </div>
      </div>

      <Card className="max-w-md shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Join class</CardTitle>
          <CardDescription>Enter the code from your teacher.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="e.g. ALGO7X2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
          <Button
            onClick={() => {
              if (joinCode) toast.success(`Joined class ${joinCode}`)
            }}
          >
            <Plus className="h-4 w-4" />
            Join
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockClassrooms.map((c) => (
          <Card key={c.id} className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">{c.name}</CardTitle>
              <CardDescription>{c.description ?? `${c.studentCount} students`}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <code className="rounded-md border border-gray-200 px-2 py-1 font-mono text-sm dark:border-gray-800">
                {c.code}
              </code>
              <Button variant="ghost" size="icon" onClick={() => copyCode(c.code)}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
