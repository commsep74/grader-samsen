import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockContest } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ContestCreator() {
  return (
    <div className="max-w-xl space-y-8">
      <PageHeader
        title="Contest creator"
        description="Schedule contests, freeze scoreboard, penalty rules."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New contest</CardTitle>
          <CardDescription>Active: {mockContest.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="contest-title" className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input id="contest-title" defaultValue={mockContest.title} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contest-start" className="text-sm font-medium text-foreground">
                Start
              </label>
              <Input id="contest-start" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contest-end" className="text-sm font-medium text-foreground">
                End
              </label>
              <Input id="contest-end" type="datetime-local" />
            </div>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            Freeze scoreboard in last hour
          </label>
          <Button onClick={() => toast.success('Contest saved')}>Save contest</Button>
        </CardContent>
      </Card>
    </div>
  )
}
