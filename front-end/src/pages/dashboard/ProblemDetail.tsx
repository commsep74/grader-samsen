import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Play, Upload, Code } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import CodeEditor from '@/components/CodeEditor'
import { VerdictBadge } from '@/components/VerdictBadge'
import { LANGUAGES, mockProblems } from '@/lib/mock-data'

import { useAppStore } from '@/store/useAppStore'
import type { Submission, Verdict } from '@/types'
import * as authApi from '@/lib/api'

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>()
  const { draftCode, submitSolution, problems } = useAppStore()
  
  const problem = (problems.length > 0 ? problems.find((p) => p.id === id) : null) || 
                  mockProblems.find((p) => p.id === id) || 
                  mockProblems[0]!

  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState(
    () => draftCode[problem.id] ?? LANGUAGES.find((l) => l.id === 'cpp')!.template,
  )
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Partial<Submission> | null>(null)
  const [visibleTestcases, setVisibleTestcases] = useState<Array<{ input: string; output: string; isPublic: boolean }>>([])

  useEffect(() => {
    const loadTestcases = async () => {
      try {
        const tc = await authApi.fetchProblemTestcases(problem.id)
        setVisibleTestcases(tc.filter((t) => t.isPublic))
      } catch (err) {
        console.error('Failed to load testcases', err)
      }
    }
    if (problem.id) {
      loadTestcases()
    }
  }, [problem.id])

  const handleSubmit = async () => {
    setSubmitting(true)
    setResult({ verdict: 'Running' as Verdict })
    try {
      const res = await submitSolution(problem.id, language, code)
      setResult(res)
      toast.success(`Verdict: ${res.verdict}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Submission failed')
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/problems" className="transition-colors hover:text-primary">Problems</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{problem.title}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-[50%] space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{problem.title}</h1>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="capitalize">{problem.difficulty}</Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {problem.timeLimit}ms · {problem.memoryLimit}MB
              </span>
            </div>
          </div>
          {problem.pdfUrl ? (
            <Card className="overflow-hidden border border-border bg-card shadow-sm h-[750px]">
              <iframe
                src={problem.pdfUrl}
                title="Problem Statement PDF"
                className="w-full h-full border-none"
              />
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="prose-statement p-6 text-sm" dangerouslySetInnerHTML={{ __html: statementHtml }} />
              </Card>
              <Card>
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-sm font-medium">Examples</h3>
                </div>
                <div className="space-y-4 p-6 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Input</p>
                    <pre className="mt-1 rounded-md bg-muted p-2 font-mono text-sm">3 5</pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Output</p>
                    <pre className="mt-1 rounded-md bg-muted p-2 font-mono text-sm">8</pre>
                  </div>
                </div>
              </Card>
            </>
          )}
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
              className="h-10 min-h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <span className="ml-auto text-xs text-muted-foreground">Autosaved locally</span>
          </div>

          <CodeEditor problemId={problem.id} language={language} value={code} onChange={setCode} />

          {/* Visible Testcases Panel */}
          {visibleTestcases.length > 0 && (
            <Card className="mt-4 border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" /> Visible Testcases
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
                {visibleTestcases.map((tc, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/40 border border-border/80 space-y-3">
                    <span className="text-xs font-bold text-muted-foreground">Sample Testcase #{index + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Input</p>
                        <pre className="p-2.5 rounded bg-muted/65 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/40">{(tc.input || '').replace(/\\n/g, '\n') || '(empty)'}</pre>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expected Output</p>
                        <pre className="p-2.5 rounded bg-muted/65 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/40">{(tc.output || '').replace(/\\n/g, '\n') || '(empty)'}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Verdict</span>
                  {result.verdict && <VerdictBadge verdict={result.verdict} />}
                  {result.runtime != null && (
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {result.runtime}ms · {result.memory}KB
                    </span>
                  )}
                </div>
                {result.testcaseResults && (
                  <div className="flex flex-wrap gap-2">
                    {result.testcaseResults.map((tc, i) => (
                      <div
                        key={tc.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs"
                      >
                        <span className="text-muted-foreground">#{i + 1}</span>
                        <VerdictBadge verdict={tc.status} />
                        {!tc.isPublic && <span className="text-muted-foreground/70">hidden</span>}
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
