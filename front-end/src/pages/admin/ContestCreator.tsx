import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockContest } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ContestCreator() {
  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contest creator</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule contests, freeze scoreboard, penalty rules.</p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">New contest</CardTitle>
          <CardDescription>Active: {mockContest.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input className="mt-1.5" defaultValue={mockContest.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start</label>
              <Input type="datetime-local" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">End</label>
              <Input type="datetime-local" className="mt-1.5" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300" />
            Freeze scoreboard in last hour
          </label>
          <Button onClick={() => toast.success('Contest saved')}>Save contest</Button>
        </CardContent>
      </Card>
    </div>
  )
}
