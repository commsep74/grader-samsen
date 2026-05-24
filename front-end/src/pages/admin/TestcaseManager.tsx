import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockTestcases = [
  { id: 'tc1', problem: 'Sum of Two Numbers', input: '1 2', output: '3', hidden: false },
  { id: 'tc2', problem: 'Sum of Two Numbers', input: '100 200', output: '300', hidden: false },
  { id: 'tc3', problem: 'Sum of Two Numbers', input: '-5 10', output: '5', hidden: true },
]

export default function TestcaseManager() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Testcase manager</h1>
        <p className="mt-1 text-sm text-gray-500">Public and hidden testcases per problem.</p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Testcases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800">
                <th className="px-6 py-3">Problem</th>
                <th className="px-6 py-3">Input</th>
                <th className="px-6 py-3">Output</th>
                <th className="px-6 py-3">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {mockTestcases.map((tc) => (
                <tr key={tc.id} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="px-6 py-4">{tc.problem}</td>
                  <td className="px-6 py-4 font-mono text-xs">{tc.input}</td>
                  <td className="px-6 py-4 font-mono text-xs">{tc.output}</td>
                  <td className="px-6 py-4">
                    {tc.hidden ? (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" /> Public
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Button variant="outline">Add testcase</Button>
    </div>
  )
}
