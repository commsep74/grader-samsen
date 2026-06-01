import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Copy, Trash2, Search, Users, BookOpen, Check, GraduationCap, ChevronLeft, Shield, Medal, Trophy, Crown, Plus, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import * as api from '@/lib/api'
import type { Classroom, Submission } from '@/types'
import { getRankFromXp } from '@/lib/ranks'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function AdminClassrooms() {
  const { problems: dbProblems, fetchProblems } = useAppStore()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Creation state (Teachers/Admins)
  const [className, setClassName] = useState('')
  const [classDesc, setClassDesc] = useState('')
  const [creating, setCreating] = useState(false)



  // Detail & Assignment States
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ranking' | 'classwork' | 'gradebook' | 'members'>('ranking')
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])

  // Assign Classwork Form State
  const [newAssignTitle, setNewAssignTitle] = useState('')
  const [newAssignProblemId, setNewAssignProblemId] = useState('')
  const [newAssignDueDate, setNewAssignDueDate] = useState('')
  const [showAssignForm, setShowAssignForm] = useState(false)

  // Load classrooms on mount
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setLoading(true)
        const data = await api.fetchClassrooms()
        setClassrooms(data)
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to load classrooms')
      } finally {
        setLoading(false)
      }
    }
    void loadClassrooms()
    void fetchProblems()
  }, [fetchProblems])

  // Set default problem select value when problems change
  useEffect(() => {
    if (dbProblems.length > 0 && !newAssignProblemId) {
      setNewAssignProblemId(dbProblems[0].id)
    }
  }, [dbProblems, newAssignProblemId])

  // Load classroom specific data
  useEffect(() => {
    if (selectedClassroom) {
      const loadClassroomData = async () => {
        try {
          setMembersLoading(true)
          const membersData = await api.fetchClassroomMembers(selectedClassroom.id)
          setMembers(membersData)

          const assignmentsData = await api.fetchClassroomAssignments(selectedClassroom.id)
          setAssignments(assignmentsData)

          const subsData = await api.fetchClassroomSubmissions(selectedClassroom.id)
          setSubmissions(subsData)
        } catch (err: any) {
          toast.error(err.message ?? 'Failed to load classroom data')
        } finally {
          setMembersLoading(false)
        }
      }
      void loadClassroomData()
      setActiveTab('ranking')
    } else {
      setMembers([])
      setAssignments([])
      setSubmissions([])
    }
  }, [selectedClassroom])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!className.trim()) {
      toast.error('Classroom name is required')
      return
    }

    try {
      setCreating(true)
      const newClass = await api.createClassroom(className, classDesc)
      setClassrooms((prev) => [newClass, ...prev])
      toast.success(`Created classroom "${className}"!`)
      setClassName('')
      setClassDesc('')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteClass = async (id: string, name: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${name}"? All students will be unenrolled.`)
    if (!confirm) return

    try {
      await api.deleteClassroom(id)
      setClassrooms((prev) => prev.filter((c) => c.id !== id))
      toast.success('Classroom deleted successfully.')
      if (selectedClassroom?.id === id) {
        setSelectedClassroom(null)
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete classroom')
    }
  }

  const handleAssignClasswork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassroom) return
    if (!newAssignTitle.trim() || !newAssignDueDate || !newAssignProblemId) {
      toast.error('Please fill out all fields')
      return
    }

    try {
      const newAssign = await api.createAssignment(
        selectedClassroom.id,
        newAssignTitle,
        '', // description
        new Date(newAssignDueDate).toISOString(),
        [newAssignProblemId]
      )
      setAssignments((prev) => [newAssign, ...prev])
      toast.success(`Assigned "${newAssignTitle}" successfully!`)

      setNewAssignTitle('')
      setNewAssignDueDate('')
      setShowAssignForm(false)
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to assign classwork')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      toast.success('Classroom code copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  // Filter classrooms by search input
  const filteredClassrooms = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  // Gradebook Exporter CSV logic
  const assignedProblemIds = [...new Set(assignments.flatMap(a => a.problemIds || []))]
  const assignedProblems = dbProblems.filter(p => assignedProblemIds.includes(p.id))
  const gridProblems = assignedProblems.length > 0 ? assignedProblems : dbProblems

  const handleExportGradebook = () => {
    if (members.length === 0) {
      toast.warning('No student members in this class to export.')
      return
    }

    const csvHeaders = ['Student Name', 'Username', 'XP', 'Streak', ...gridProblems.map(p => p.title)]
    const csvRows = members.map(m => {
      const row = [
        m.name || 'Anonymous',
        m.username,
        String(m.xp ?? 0),
        `${m.streak ?? 0} days`
      ]

      gridProblems.forEach(p => {
        const studentSubs = submissions.filter(s => s.userId === m.id && s.problemId === p.id)
        const bestSub = studentSubs.find(s => s.verdict === 'Accepted') || studentSubs[0]
        row.push(bestSub ? `${bestSub.verdict} (${bestSub.score}pts)` : 'Unattempted')
      })
      return row
    })

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `gradebook_${selectedClassroom?.name.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Gradebook CSV downloaded successfully!')
  }

  const rankIcons = {
    Shield,
    Medal,
    Trophy,
    Crown,
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Classroom Manager"
        description="Monitor student grades, invite members, review ranks, and assign coding tasks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Classroom List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold">Active Classrooms</CardTitle>
                  <CardDescription>Browse and manage the classes you supervise.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs font-semibold">Retrieving classrooms...</span>
                </div>
              ) : filteredClassrooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <GraduationCap className="h-10 w-10 text-muted-foreground/60 mb-2" />
                  <div className="text-sm font-bold text-foreground">No classrooms found</div>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Try refining your search or create your first classroom using the sidebar tool.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredClassrooms.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors duration-200 cursor-pointer hover:bg-muted/40",
                        selectedClassroom?.id === c.id && "bg-muted/30"
                      )}
                      onClick={() => setSelectedClassroom(c)}
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description || 'No description provided.'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-[11px] font-bold text-muted-foreground shadow-sm transition hover:text-foreground"
                        >
                          {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          Code: {c.code}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg font-semibold shadow-inner">
                          <Users className="h-3.5 w-3.5" />
                          {c.studentCount} students
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteClass(c.id, c.name)}
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detail Inspector & Assignment Manager */}
        <div className="space-y-6">
          {selectedClassroom ? (
            <Card className="border border-border shadow-sm animate-in slide-in-from-right duration-300">
              <CardHeader className="space-y-1.5 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedClassroom(null)}
                    title="Back to Classroom Management"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-base font-bold truncate">{selectedClassroom.name}</CardTitle>
                </div>
                <CardDescription className="text-xs line-clamp-2">
                  {selectedClassroom.description || 'No description provided.'}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Code:</span>
                  <code className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">{selectedClassroom.code}</code>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  {['ranking', 'classwork', 'gradebook', 'members'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                        activeTab === tab
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'ranking' ? 'Leaderboard' : tab === 'classwork' ? 'Tasks' : tab === 'gradebook' ? 'Grades' : 'Members'}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="p-4 max-h-[450px] overflow-y-auto min-h-[220px]">
                  {membersLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold">Syncing details...</span>
                    </div>
                  ) : activeTab === 'ranking' ? (
                    members.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground py-10">No students enrolled yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {members
                          .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
                          .map((m, idx) => {
                            const currentRank = getRankFromXp(m.xp ?? 0).currentRank
                            const RankIcon = rankIcons[currentRank.iconName as keyof typeof rankIcons]
                            return (
                              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card transition hover:border-border/10">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-bold text-muted-foreground tabular-nums w-4">#{idx + 1}</span>
                                  <div>
                                    <div className="text-xs font-bold text-foreground">{m.name || 'Anonymous'}</div>
                                    <div className="text-[10px] text-muted-foreground">@{m.username}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold border shadow-sm",
                                    currentRank.bgColorClass,
                                    currentRank.colorClass,
                                    currentRank.borderColorClass
                                  )}>
                                    <RankIcon className="h-2.5 w-2.5" />
                                    {currentRank.label}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-foreground">{m.xp ?? 0} XP</span>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )
                  ) : activeTab === 'classwork' ? (
                    <div className="space-y-4">
                      {/* Teacher Assign Panel */}
                      <div className="border border-dashed border-border p-3 rounded-lg bg-muted/30">
                        {showAssignForm ? (
                          <form onSubmit={handleAssignClasswork} className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Assignment</div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Assignment Title (e.g. Loops Practice)"
                                value={newAssignTitle}
                                onChange={(e) => setNewAssignTitle(e.target.value)}
                                className="text-xs h-8"
                                required
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={newAssignProblemId}
                                  onChange={(e) => setNewAssignProblemId(e.target.value)}
                                  className="rounded-md border border-input bg-background px-2 py-1 text-[10px] font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer h-8 text-foreground"
                                >
                                  {dbProblems.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.title}
                                    </option>
                                  ))}
                                </select>
                                <Input
                                  type="date"
                                  value={newAssignDueDate}
                                  onChange={(e) => setNewAssignDueDate(e.target.value)}
                                  className="text-[10px] h-8"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="h-7 text-xs font-semibold px-3 flex-1">
                                Assign Task
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-3"
                                onClick={() => setShowAssignForm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button
                            onClick={() => setShowAssignForm(true)}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-semibold h-8 bg-background border border-border"
                          >
                            <Plus className="h-3 w-3 mr-1.5" />
                            Assign Class Work
                          </Button>
                        )}
                      </div>

                      {assignments.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-10">No class work assigned yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {assignments.map((a) => (
                            <div
                              key={a.id}
                              className="p-3 rounded-lg border border-border bg-card transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-xs font-bold text-foreground">{a.title}</div>
                                <span className="text-[9px] uppercase font-bold text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                                  Task Active
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                Due: {new Date(a.dueAt).toLocaleDateString()}
                              </div>
                              {a.problemIds && a.problemIds.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {a.problemIds.map((pid: string) => {
                                    const pInfo = dbProblems.find((p) => p.id === pid)
                                    return (
                                      <Link
                                        key={pid}
                                        to={`/app/problems/${pid}`}
                                        className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-primary border border-primary/5 hover:underline"
                                      >
                                        {pInfo?.title || `Problem #${pid}`}
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'gradebook' ? (
                    <div className="space-y-4">
                      {/* Gradebook controls */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Marks Matrix</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" onClick={handleExportGradebook}>
                          <Download className="h-3 w-3 mr-1.5 text-primary" /> Export CSV
                        </Button>
                      </div>

                      {members.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-10">No students enrolled yet to show scores.</p>
                      ) : (
                        <div className="overflow-x-auto border border-border rounded-lg bg-card max-h-[300px]">
                          <table className="w-full text-[11px] min-w-[320px]">
                            <thead>
                              <tr className="border-b border-border bg-muted/40 text-left font-bold text-muted-foreground">
                                <th className="px-3 py-2">Student</th>
                                {gridProblems.map(p => (
                                  <th key={p.id} className="px-3 py-2 text-center truncate max-w-[80px]" title={p.title}>
                                    {p.title}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {members.map(m => (
                                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-3 py-2 font-medium truncate max-w-[100px]">
                                    {m.name || 'Anonymous'}
                                  </td>
                                  {gridProblems.map(p => {
                                    const studentSubs = submissions.filter(s => s.userId === m.id && s.problemId === p.id)
                                    const bestSub = studentSubs.find(s => s.verdict === 'Accepted') || studentSubs[0]

                                    return (
                                      <td key={p.id} className="px-3 py-2 text-center font-semibold">
                                        {bestSub ? (
                                          <span className={cn(
                                            "inline-block text-[10px] rounded px-1.5 py-0.5",
                                            bestSub.verdict === 'Accepted'
                                              ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                              : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                          )}>
                                            {bestSub.verdict === 'Accepted' ? 'AC' : 'WA'}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground/40">-</span>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Instructor section */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Instructor</div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                          <div>
                            <div className="text-xs font-bold text-primary">{selectedClassroom.teacherName}</div>
                            <div className="text-[10px] text-muted-foreground">Primary Instructor</div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
                            Teacher
                          </span>
                        </div>
                      </div>

                      {/* Students section */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Students ({members.length})</div>
                        {members.length === 0 ? (
                          <p className="text-[11px] text-center text-muted-foreground py-6 border border-dashed border-border/60 rounded-lg">
                            No students enrolled yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {members.map((m) => (
                              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                                <div>
                                  <div className="text-xs font-semibold text-foreground">{m.name || 'Anonymous'}</div>
                                  <div className="text-[10px] text-muted-foreground">@{m.username}</div>
                                </div>
                                <div className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded font-medium">
                                  {m.streak ?? 0}d streak
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Create Class</CardTitle>
                <CardDescription>Launch a new classroom space for students.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="className" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class Name</label>
                    <Input
                      id="className"
                      required
                      placeholder="e.g. Algorithms Section 1"
                      value={className}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="classDesc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium">Description</label>
                    <textarea
                      id="classDesc"
                      rows={3}
                      placeholder="e.g. Study graph traversals, greedy methods, dynamic programming"
                      value={classDesc}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setClassDesc(e.target.value)}
                      disabled={creating}
                      className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button type="submit" className="w-full flex items-center justify-center gap-1.5" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Launching Class…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Create Class
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
