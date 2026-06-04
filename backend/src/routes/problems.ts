import { Router } from 'express'
import { createSupabaseClient, supabaseAdmin } from '../supabase.js'
import { runCodeInSandbox, scanForPlagiarism } from '../utils/sandbox.js'

export const problemsRouter = Router()

// 1. GET / - List all problems
problemsRouter.get('/', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  try {
    const { data: problems, error } = await supabaseAdmin
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Attach solved counts (mocked or aggregated from DB)
    const problemsWithSolvedCount = await Promise.all(
      (problems || []).map(async (p) => {
        const { count } = await supabaseAdmin
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('problem_id', p.id)
          .eq('verdict', 'Accepted')

        return {
          id: p.id,
          title: p.title,
          statement: p.statement,
          difficulty: p.difficulty,
          timeLimit: p.time_limit,
          memoryLimit: p.memory_limit,
          tags: p.tags || [],
          pdfUrl: p.pdf_url,
          solvedCount: count || 0,
        }
      })
    )

    return res.json({ problems: problemsWithSolvedCount })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 2. GET /:id - Retrieve single problem detail
problemsRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { data: problem, error } = await supabaseAdmin
      .from('problems')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !problem) {
      return res.status(404).json({ error: 'Problem not found.' })
    }

    return res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        timeLimit: problem.time_limit,
        memoryLimit: problem.memory_limit,
        tags: problem.tags || [],
        pdfUrl: problem.pdf_url,
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 3. POST / - Create a problem (Teachers only)
problemsRouter.post('/', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  // Verify Role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Teachers only.' })
  }

  const { title, statement, difficulty, timeLimit, memoryLimit, tags, pdfUrl, testcases } = req.body as {
    title: string
    statement: string
    difficulty: 'easy' | 'medium' | 'hard'
    timeLimit: number
    memoryLimit: number
    tags?: string[]
    pdfUrl?: string
    testcases?: Array<{ input: string; output: string; isPublic?: boolean }>
  }

  if (!title || !statement || !difficulty) {
    return res.status(400).json({ error: 'Title, statement, and difficulty are required.' })
  }

  try {
    const { data: problem, error } = await supabaseAdmin
      .from('problems')
      .insert({
        title,
        statement,
        difficulty,
        time_limit: timeLimit || 1000,
        memory_limit: memoryLimit || 256,
        tags: tags || [],
        pdf_url: pdfUrl || null,
        created_by: userData.user.id,
      })
      .select('*')
      .single()

    if (error || !problem) {
      return res.status(500).json({ error: error?.message ?? 'Failed to create problem.' })
    }

    // Insert testcases if provided
    if (testcases && Array.isArray(testcases) && testcases.length > 0) {
      const tcInserts = testcases.map(tc => ({
        problem_id: problem.id,
        input: (tc.input || '').replace(/\\n/g, '\n'),
        output: (tc.output || '').replace(/\\n/g, '\n'),
        is_public: tc.isPublic !== false
      }))
      await supabaseAdmin.from('testcases').insert(tcInserts)
    }

    return res.status(201).json({
      problem: {
        id: problem.id,
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        timeLimit: problem.time_limit,
        memoryLimit: problem.memory_limit,
        tags: problem.tags || [],
        pdfUrl: problem.pdf_url,
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 4. POST /:id/submit - Submit code solutions
problemsRouter.post('/:id/submit', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const { id } = req.params

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  const { language, code } = req.body as { language: string; code: string }

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required.' })
  }

  const allowedLanguages = ['c', 'cpp', 'js', 'javascript', 'python']
  if (!allowedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({ error: `Language '${language}' is not allowed. Supported languages are: C, C++, JavaScript, and Python.` })
  }

  try {
    // Check if problem exists
    const { data: problem } = await supabaseAdmin
      .from('problems')
      .select('*')
      .eq('id', id)
      .single()

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' })
    }

    // Load active testcases for this problem from database
    const { data: testcases } = await supabaseAdmin
      .from('testcases')
      .select('*')
      .eq('problem_id', id)

    // Execute code securely inside sandboxed compiler runner
    const runResult = await runCodeInSandbox(
      code,
      language,
      problem.time_limit || 1000,
      problem.memory_limit || 256,
      testcases || []
    )

    // Run structural similarity anti-cheat plagiarism check
    const plagCheck = await scanForPlagiarism(id, userData.user.id, code)

    const totalTestcases = testcases?.length || 0
    const acceptedCount = runResult.testcaseResults.filter(tc => tc.status === 'Accepted').length
    const score = totalTestcases > 0 ? Math.round((acceptedCount / totalTestcases) * 100) : 0

    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: userData.user.id,
        problem_id: id,
        language,
        code,
        verdict: runResult.verdict,
        score,
        runtime: runResult.runtime,
        memory: runResult.memory,
        plagiarism_score: plagCheck.similarity,
        plagiarism_source_id: plagCheck.sourceId,
        is_plagiarized: plagCheck.isPlagiarized
      })
      .select('*')
      .single()

    if (error || !submission) {
      return res.status(500).json({ error: error?.message ?? 'Failed to submit.' })
    }

    return res.status(201).json({
      submission: {
        id: submission.id,
        userId: submission.user_id,
        problemId: submission.problem_id,
        language: submission.language,
        code: submission.code,
        verdict: submission.verdict,
        score: submission.score,
        runtime: submission.runtime,
        memory: submission.memory,
        submittedAt: submission.submitted_at,
        plagiarismScore: submission.plagiarism_score,
        isPlagiarized: submission.is_plagiarized,
        testcaseResults: runResult.testcaseResults
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 5. GET /submissions - List submissions
problemsRouter.get('/submissions/all', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  try {
    // Load submissions
    let query = supabaseAdmin.from('submissions').select('*')

    // If student, only load their own
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profile && profile.role === 'student') {
      query = query.eq('user_id', userData.user.id)
    }

    const { data: subs, error } = await query.order('submitted_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const mappedSubs = await Promise.all(
      (subs || []).map(async (s) => {
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('name, username')
          .eq('id', s.user_id)
          .maybeSingle()

        return {
          id: s.id,
          userId: s.user_id,
          userName: userProfile?.name || userProfile?.username || 'Unknown',
          problemId: s.problem_id,
          language: s.language,
          code: s.code,
          verdict: s.verdict,
          score: s.score,
          runtime: s.runtime,
          memory: s.memory,
          submittedAt: s.submitted_at,
        }
      })
    )

    return res.json({ submissions: mappedSubs })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 6. GET /:id/testcases - Get testcases for a problem
problemsRouter.get('/:id/testcases', async (req, res) => {
  const { id } = req.params
  try {
    const { data: testcases, error } = await supabaseAdmin
      .from('testcases')
      .select('*')
      .eq('problem_id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const mapped = (testcases || []).map(tc => ({
      input: tc.input,
      output: tc.output,
      isPublic: tc.is_public,
    }))

    return res.json({ testcases: mapped })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 7. DELETE /:id - Delete problem (Teachers only)
problemsRouter.delete('/:id', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const { id } = req.params

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Teachers only.' })
  }

  try {
    const { error } = await supabaseAdmin
      .from('problems')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})

// 8. PUT /:id - Update problem & testcases (Teachers only)
problemsRouter.put('/:id', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const { id } = req.params

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Teachers only.' })
  }

  const { title, statement, difficulty, timeLimit, memoryLimit, tags, pdfUrl, testcases } = req.body as {
    title: string
    statement: string
    difficulty: 'easy' | 'medium' | 'hard'
    timeLimit: number
    memoryLimit: number
    tags?: string[]
    pdfUrl?: string
    testcases?: Array<{ input: string; output: string; isPublic?: boolean }>
  }

  try {
    const { data: problem, error } = await supabaseAdmin
      .from('problems')
      .update({
        title,
        statement,
        difficulty,
        time_limit: timeLimit,
        memory_limit: memoryLimit,
        tags: tags || [],
        pdf_url: pdfUrl || null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !problem) {
      return res.status(500).json({ error: error?.message ?? 'Failed to update problem.' })
    }

    if (testcases && Array.isArray(testcases)) {
      await supabaseAdmin.from('testcases').delete().eq('problem_id', id)
      if (testcases.length > 0) {
        const tcInserts = testcases.map(tc => ({
          problem_id: id,
          input: (tc.input || '').replace(/\\n/g, '\n'),
          output: (tc.output || '').replace(/\\n/g, '\n'),
          is_public: tc.isPublic !== false
        }))
        await supabaseAdmin.from('testcases').insert(tcInserts)
      }
    }

    return res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        timeLimit: problem.time_limit,
        memoryLimit: problem.memory_limit,
        tags: problem.tags || [],
        pdfUrl: problem.pdf_url,
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Server error' })
  }
})
