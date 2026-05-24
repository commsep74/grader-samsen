import { Router } from 'express'
import { createSupabaseClient, supabaseAdmin } from '../supabase.js'
import { isValidUsername, usernameToEmail, usernameValidationMessage } from '../utils/username.js'

export const authRouter = Router()

type ProfileRow = {
  id: string
  username: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  xp: number | null
  streak: number | null
  tier: string | null
  created_at: string
  password?: string
}

function mapProfile(profile: ProfileRow) {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    email: usernameToEmail(profile.username),
    role: profile.role,
    xp: profile.xp ?? 0,
    streak: profile.streak ?? 0,
    tier: profile.tier ?? 'Bronze',
    createdAt: profile.created_at,
    password: profile.password || '',
  }
}

authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: usernameValidationMessage() })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const email = usernameToEmail(username)

  const { data: existingProfile, error: existingError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (existingError) {
    const setupHint = existingError.message.includes('profiles')
      ? 'Database not set up. Run backend/supabase/migrations/001_profiles.sql in Supabase SQL Editor.'
      : existingError.message
    return res.status(500).json({ error: setupHint })
  }

  if (existingProfile) {
    return res.status(409).json({ error: 'Username is already taken.' })
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username.toLowerCase() },
  })

  if (authError || !authData.user) {
    return res.status(400).json({ error: authError?.message ?? 'Failed to create account.' })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      username: username.toLowerCase(),
      name: username,
      role: 'student',
      password: password,
    })
    .select('*')
    .single()

  if (profileError || !profile) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return res.status(500).json({ error: profileError?.message ?? 'Failed to create profile.' })
  }

  const client = createSupabaseClient()
  const { data: sessionData, error: sessionError } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (sessionError || !sessionData.session) {
    return res.status(201).json({
      user: mapProfile(profile as ProfileRow),
      session: null,
    })
  }

  return res.status(201).json({
    user: mapProfile(profile as ProfileRow),
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
  })
})

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: usernameValidationMessage() })
  }

  const email = usernameToEmail(username)
  const client = createSupabaseClient()
  const { data: sessionData, error: sessionError } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (sessionError || !sessionData.user || !sessionData.session) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', sessionData.user.id)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: 'User profile not found.' })
  }

  return res.json({
    user: mapProfile(profile as ProfileRow),
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
  })
})

authRouter.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const client = createSupabaseClient(token)
    await client.auth.signOut()
  }

  return res.json({ success: true })
})

authRouter.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: 'User profile not found.' })
  }

  return res.json({ user: mapProfile(profile as ProfileRow) })
})

authRouter.get('/users', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }

  const { data: currentProfile, error: currentProfileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (currentProfileError || !currentProfile) {
    return res.status(404).json({ error: 'Caller profile not found.' })
  }

  if (currentProfile.role !== 'teacher' && currentProfile.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers or admins can view all users.' })
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    return res.status(500).json({ error: profilesError.message })
  }

  return res.json({ users: (profiles as ProfileRow[]).map(mapProfile) })
})

authRouter.delete('/delete-account', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }

  const userId = userData.user.id

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message ?? 'Failed to delete user account.' })
  }

  return res.json({ success: true })
})

authRouter.delete('/users/:id', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const client = createSupabaseClient(token)
  const { data: userData, error: userError } = await client.auth.getUser(token)

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }

  const { data: currentProfile, error: currentProfileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (currentProfileError || !currentProfile) {
    return res.status(404).json({ error: 'Caller profile not found.' })
  }

  if (currentProfile.role !== 'teacher' && currentProfile.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers or admins can delete users.' })
  }

  const targetUserId = req.params.id

  if (targetUserId === userData.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself using this endpoint.' })
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message ?? 'Failed to delete user.' })
  }

  return res.json({ success: true })
})
