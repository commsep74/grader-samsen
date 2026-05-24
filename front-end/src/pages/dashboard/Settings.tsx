import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Settings() {
  const { isDark, toggleDark, user } = useAppStore()

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Card className="shadow-none">
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
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>@{user?.username}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
