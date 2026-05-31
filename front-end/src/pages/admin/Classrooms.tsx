import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Copy, Trash2, Search, Users, BookOpen, Check, GraduationCap, ChevronLeft, Shield, Medal, Trophy, Crown, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import * as api from '@/lib/api'
import type { Classroom } from '@/types'
import { getRankFromXp } from '@/lib/ranks'
import { cn } from '@/lib/utils'
import { mockAssignments, mockProblems } from '@/lib/mock-data'
import { Link } from 'react-router-dom'


export default function AdminClassrooms() {
  const { user } = useAppStore()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Creation state (Teachers/Admins)
  const [className, setClassName] = useState('')
  const [classDesc, setClassDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const isAdmin = user?.role === 'admin'

  // Detail & Assignment States
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ranking' | 'classwork' | 'members'>('ranking')
  const [assignments, setAssignments] = useState<any[]>(mockAssignments)

  // Assign Classwork Form State
  const [newAssignTitle, setNewAssignTitle] = useState('')
  const [newAssignProblemId, setNewAssignProblemId] = useState('p1')
  const [newAssignDueDate, setNewAssignDueDate] = useState('')
  const [showAssignForm, setShowAssignForm] = useState(false)

  useEffect(() => {
    if (selectedClassroom) {
      const loadMembers = async () => {
        try {
          setMembersLoading(true)
          const data = await api.fetchClassroomMembers(selectedClassroom.id)
          setMembers(data)
        } catch (err: any) {
          toast.error(err.message ?? 'Failed to load class members')
        } finally {
          setMembersLoading(false)
        }
      }
      void loadMembers()
      setActiveTab('ranking')
    } else {
      setMembers([])
    }
  }, [selectedClassroom])

  const handleAssignClasswork = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssignTitle.trim() || !newAssignDueDate) {
      toast.error('Please fill out all fields')
      return
    }

    const newAssignment = {
      id: `as-custom-${Date.now()}`,
      title: newAssignTitle,
      className: selectedClassroom?.name || '',
      dueAt: newAssignDueDate,
      problemIds: [newAssignProblemId],
    }

    setAssignments((prev) => [newAssignment, ...prev])
    toast.success(`Assigned "${newAssignTitle}" successfully!`)
    
    setNewAssignTitle('')
    setNewAssignDueDate('')
    setShowAssignForm(false)
  }

  const classClean = selectedClassroom?.name.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
  const classAssignments = assignments.filter((a) => {
    const assignmentClassClean = a.className.toLowerCase().replace(/[^a-z0-9]/g, '')
    return assignmentClassClean.includes(classClean) || classClean.includes(assignmentClassClean)
  })

  const rankIcons = {
    Shield,
    Medal,
    Trophy,
    Crown,
  }


  const loadClassrooms = async () => {
    try {
      setLoading(true)
      const data = await api.fetchClassrooms()
      setClassrooms(data)
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to fetch classrooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      void loadClassrooms()
    }
  }, [user])

  const handleCopyCode = (code: string) => {
    void navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied classroom code: ${code}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreateClass = async () => {
    if (!className.trim()) {
      toast.error('Classroom name is required')
      return
    }
    try {
      setCreating(true)
      const newClass = await api.createClassroom(className, classDesc)
      setClassrooms((prev) => [newClass, ...prev])
      toast.success(`Classroom "${newClass.name}" created successfully!`)
      setClassName('')
      setClassDesc('')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteClass = async (classId: string, name: string) => {
    const message = isAdmin 
      ? `ADMIN ACTION: Are you sure you want to delete classroom "${name}"? This will delete all student enrollments and cannot be undone.`
      : `Are you sure you want to delete classroom "${name}"? This action is permanent.`
      
    if (!window.confirm(message)) return

    try {
      await api.deleteClassroom(classId)
      setClassrooms((prev) => prev.filter((c) => c.id !== classId))
      if (selectedClassroom?.id === classId) {
        setSelectedClassroom(null)
      }
      toast.success(`Successfully deleted classroom: ${name}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete classroom')
    }
  }

  const filteredClassrooms = classrooms.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(term))
    )
  })

  // Statistics
  const totalClassrooms = classrooms.length
  const totalEnrolled = classrooms.reduce((acc, c) => acc + c.studentCount, 0)
  const averageEnrolled = totalClassrooms > 0 ? (totalEnrolled / totalClassrooms).toFixed(1) : '0'

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title={isAdmin ? 'Classroom Directory' : 'Classroom Manager'}
        description={
          isAdmin
            ? 'Audit, look through, and manage every classroom created across the grader.'
            : 'Create classrooms, track student enrollments, and manage your classrooms.'
        }
      />

      {/* Analytics stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-border/80 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-accent p-2.5 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isAdmin ? 'Total classrooms' : 'My classrooms'}
              </p>
              <h3 className="mt-0.5 text-xl font-bold tabular-nums">{totalClassrooms}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600 dark:bg-green-950 dark:text-green-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isAdmin ? 'Enrolled students' : 'Active students'}
              </p>
              <h3 className="mt-0.5 text-xl font-bold tabular-nums">{totalEnrolled}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average class size</p>
              <h3 className="mt-0.5 text-xl font-bold tabular-nums">{averageEnrolled} students</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Classroom / Classroom Details sidebar */}
        {!isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            {selectedClassroom ? (
              <Card className="border border-border bg-card shadow-sm animate-in slide-in-from-left duration-200">
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
                    <button
                      onClick={() => setActiveTab('ranking')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                        activeTab === 'ranking'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={() => setActiveTab('classwork')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                        activeTab === 'classwork'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Class Work
                    </button>
                    <button
                      onClick={() => setActiveTab('members')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                        activeTab === 'members'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Members
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-4 max-h-[380px] overflow-y-auto min-h-[220px]">
                    {membersLoading ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Loading class data...</span>
                      </div>
                    ) : activeTab === 'ranking' ? (
                      members.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-10">No students enrolled yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {members.map((m, index) => {
                            const { currentRank } = getRankFromXp(m.xp ?? 0)
                            const RankIcon = rankIcons[currentRank.iconName as keyof typeof rankIcons] || Shield
                            const isTopThree = index < 3
                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200",
                                  isTopThree 
                                    ? index === 0
                                      ? "bg-yellow-500/10 border-yellow-200 dark:border-yellow-900/30"
                                      : index === 1
                                      ? "bg-slate-500/10 border-slate-200 dark:border-slate-800/30"
                                      : "bg-amber-500/10 border-amber-200 dark:border-amber-900/30"
                                    : "bg-card border-border/80"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "w-5 text-center font-bold text-xs font-mono",
                                    index === 0 ? "text-yellow-600 dark:text-yellow-400" :
                                    index === 1 ? "text-slate-600 dark:text-slate-400" :
                                    index === 2 ? "text-amber-600 dark:text-amber-400" :
                                    "text-muted-foreground"
                                  )}>
                                    #{index + 1}
                                  </span>
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
                        {/* Teacher assign controls */}
                        <div className="border border-dashed border-border p-3 rounded-lg bg-muted/30">
                          {showAssignForm ? (
                            <form onSubmit={handleAssignClasswork} className="space-y-3">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Assignment</div>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Assignment Title (e.g. DP Practice)"
                                  value={newAssignTitle}
                                  onChange={(e) => setNewAssignTitle(e.target.value)}
                                  className="text-xs h-8"
                                  required
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={newAssignProblemId}
                                    onChange={(e) => setNewAssignProblemId(e.target.value)}
                                    className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer h-8 text-foreground"
                                  >
                                    {mockProblems.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.title}
                                      </option>
                                    ))}
                                  </select>
                                  <Input
                                    type="date"
                                    value={newAssignDueDate}
                                    onChange={(e) => setNewAssignDueDate(e.target.value)}
                                    className="text-[11px] h-8"
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

                        {classAssignments.length === 0 ? (
                          <p className="text-xs text-center text-muted-foreground py-10">No class work assigned yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {classAssignments.map((a) => (
                              <Link
                                key={a.id}
                                to={a.problemIds && a.problemIds.length > 0 ? `/app/problems/${a.problemIds[0]}` : "/app/problems"}
                                className="block p-3 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary hover:shadow-sm hover:scale-[1.01]"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{a.title}</div>
                                  <span className="text-[9px] uppercase font-bold text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                                    Start Task
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  Due: {new Date(a.dueAt).toLocaleDateString()}
                                </div>
                                {a.problemIds && a.problemIds.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {a.problemIds.map((pid) => {
                                      const pInfo = mockProblems.find((p) => p.id === pid)
                                      return (
                                        <span key={pid} className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-primary border border-primary/5">
                                          {pInfo?.title || `Problem #${pid}`}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Teacher section */}
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
                  <div className="space-y-2">
                    <label htmlFor="className" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class Name</label>
                    <Input
                      id="className"
                      placeholder="e.g. Algorithms Section 1"
                      value={className}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="classDesc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                    <textarea
                      id="classDesc"
                      placeholder="Provide a syllabus, rules, or schedule..."
                      value={classDesc}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setClassDesc(e.target.value)}
                      disabled={creating}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button
                    onClick={handleCreateClass}
                    className="w-full h-10 font-medium"
                    disabled={creating || !className.trim()}
                  >
                    {creating ? 'Creating...' : 'Create Classroom'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}


        {/* Directory list of Classrooms */}
        <div className={isAdmin ? 'lg:col-span-3 space-y-6' : 'lg:col-span-2 space-y-6'}>
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {isAdmin ? 'All Active Classrooms' : 'My Classroom Directory'}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? 'Looking through every classroom that has been created on the platform.'
                      : 'A directory of all classes you are currently instructing.'}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    placeholder="Search name, code, teacher..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3">Classroom Info</th>
                      <th className="px-6 py-3">Class Code</th>
                      {isAdmin && <th className="px-6 py-3">Instructor</th>}
                      <th className="px-6 py-3">Students</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span>Loading classrooms...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredClassrooms.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">
                          No classrooms found.
                        </td>
                      </tr>
                    ) : (
                      filteredClassrooms.map((c) => {
                        const isSelected = selectedClassroom?.id === c.id
                        return (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedClassroom(c)}
                            className={cn(
                              "transition-colors hover:bg-muted/30 cursor-pointer",
                              isSelected && "bg-primary/5 hover:bg-primary/5 border-l-2 border-l-primary"
                            )}
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground">{c.name}</div>
                              {c.description && (
                                <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                  {c.description}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleCopyCode(c.code)}
                                className="group flex items-center gap-1.5 rounded-full bg-accent hover:bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary transition-colors cursor-pointer"
                                title="Copy code"
                              >
                                {c.code}
                                {copiedCode === c.code ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                    {c.teacherName?.charAt(0).toUpperCase() || 'T'}
                                  </div>
                                  <span className="font-medium text-foreground">{c.teacherName}</span>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                {c.studentCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClass(c.id, c.name)}
                                className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30 h-8 w-8"
                                title="Delete classroom"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
