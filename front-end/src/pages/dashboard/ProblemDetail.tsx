import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Play, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import CodeEditor from '@/components/CodeEditor'
import { VerdictBadge } from '@/components/VerdictBadge'
import { LANGUAGES, mockProblems } from '@/lib/mock-data'
import { submitToJudge } from '@/services/judge'
import { useAppStore } from '@/store/useAppStore'
import type { Submission, Verdict } from '@/types'

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>()
  const problem = mockProblems.find((p) => p.id === id) ?? mockProblems[0]!
  const draftCode = useAppStore((s) => s.draftCode)
  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState(
    () => draftCode[problem.id] ?? LANGUAGES.find((l) => l.id === 'cpp')!.template,
  )
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Partial<Submission> | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setResult({ verdict: 'Running' as Verdict })
    try {
      const res = await submitToJudge(problem.id, language, code)
      setResult(res)
      toast.success(`Verdict: ${res.verdict}`)
    } finally {
      setSubmitting(false)
    }
  }

  const statementHtml = problem.statement
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .concat('</p>')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/app/problems" className="hover:text-gray-900">Problems</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">{problem.title}</span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-[42%] space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{problem.title}</h1>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="capitalize">{problem.difficulty}</Badge>
              <span className="text-xs text-gray-500 font-mono">
                {problem.timeLimit}ms · {problem.memoryLimit}MB
              </span>
            </div>
          </div>
          <Card className="shadow-none">
            <CardContent className="prose-statement p-6 text-sm" dangerouslySetInnerHTML={{ __html: statementHtml }} />
          </Card>
          <div className="rounded-lg border border-gray-200 shadow-none dark:border-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="text-sm font-medium">Examples</h3>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <div>
                <p className="text-xs text-gray-500">Input</p>
                <pre className="mt-1 rounded-md bg-gray-50 p-2 font-mono dark:bg-gray-900">3 5</pre>
              </div>
              <div>
                <p className="text-xs text-gray-500">Output</p>
                <pre className="mt-1 rounded-md bg-gray-50 p-2 font-mono dark:bg-gray-900">8</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value
                setLanguage(lang)
                const tpl = LANGUAGES.find((l) => l.id === lang)?.template
                if (tpl && !draftCode[problem.id]) setCode(tpl)
              }}
              className="h-9 rounded-md border border-gray-200 bg-white px-3 font-sans text-sm dark:border-gray-800 dark:bg-gray-950"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <Button onClick={handleSubmit} disabled={submitting}>
              <Play className="h-4 w-4" />
              {submitting ? 'Judging...' : 'Submit'}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" /> Upload file
            </Button>
            <span className="text-xs text-gray-400 ml-auto">Autosaved locally</span>
          </div>

          <CodeEditor problemId={problem.id} language={language} value={code} onChange={setCode} />

          {result && (
            <Card className="shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Verdict</span>
                  {result.verdict && <VerdictBadge verdict={result.verdict} />}
                  {result.runtime != null && (
                    <span className="text-xs font-mono text-gray-500">{result.runtime}ms · {result.memory}KB</span>
                  )}
                </div>
                {result.testcaseResults && (
                  <div className="flex flex-wrap gap-2">
                    {result.testcaseResults.map((tc, i) => (
                      <div
                        key={tc.id}
                        className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs dark:border-gray-800"
                      >
                        <span className="text-gray-500">#{i + 1}</span>
                        <VerdictBadge verdict={tc.status} />
                        {!tc.isPublic && <span className="text-gray-400">hidden</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
