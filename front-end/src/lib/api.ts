import type { User, Classroom } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at?: number
}

interface AuthResponse {
  user: User
  session: AuthSession | null
}

interface ApiError {
  error: string
}

const SESSION_KEY = 'grader-samsen-session'

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setStoredSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = (await response.json()) as T & ApiError

  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed')
  }

  return data
}

export async function register(username: string, password: string, role?: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  })

  if (data.session) {
    setStoredSession(data.session)
  }

  return data
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  if (data.session) {
    setStoredSession(data.session)
  }

  return data
}

export async function logout(): Promise<void> {
  try {
    await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' })
  } finally {
    setStoredSession(null)
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const session = getStoredSession()
  if (!session?.access_token) return null

  try {
    const data = await request<{ user: User }>('/api/auth/me')
    return data.user
  } catch {
    setStoredSession(null)
    return null
  }
}

export async function fetchUsers(): Promise<User[]> {
  const data = await request<{ users: User[] }>('/api/auth/users')
  return data.users
}

export async function deleteAccount(): Promise<void> {
  try {
    await request<{ success: boolean }>('/api/auth/delete-account', {
      method: 'DELETE',
    })
  } finally {
    setStoredSession(null)
  }
}

export async function deleteUser(id: string): Promise<void> {
  await request<{ success: boolean }>(`/api/auth/users/${id}`, {
    method: 'DELETE',
  })
}

export async function updateUserRole(id: string, role: string): Promise<User> {
  const data = await request<{ user: User }>(`/api/auth/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
  return data.user
}


export async function fetchClassrooms(): Promise<Classroom[]> {
  const data = await request<{ classrooms: Classroom[] }>('/api/classrooms')
  return data.classrooms
}

export async function createClassroom(name: string, description?: string): Promise<Classroom> {
  const data = await request<{ classroom: Classroom }>('/api/classrooms', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
  return data.classroom
}

export async function joinClassroomByCode(code: string): Promise<Classroom> {
  const data = await request<{ classroom: Classroom }>('/api/classrooms/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
  return data.classroom
}

export async function leaveClassroom(classId: string): Promise<void> {
  await request<{ success: boolean }>(`/api/classrooms/${classId}/leave`, {
    method: 'DELETE',
  })
}

export async function deleteClassroom(classId: string): Promise<void> {
  await request<{ success: boolean }>(`/api/classrooms/${classId}`, {
    method: 'DELETE',
  })
}

export async function fetchClassroomMembers(classId: string): Promise<User[]> {
  const data = await request<{ members: User[] }>(`/api/classrooms/${classId}/members`)
  return data.members
}

export interface XPLeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string
  xp: number
  streak: number
  tier: string
}

export async function fetchLeaderboard(): Promise<XPLeaderboardEntry[]> {
  const data = await request<{ leaderboard: XPLeaderboardEntry[] }>('/api/auth/leaderboard')
  return data.leaderboard
}
