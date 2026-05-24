import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Submission } from '@/types'
import * as authApi from '@/lib/api'

interface AppState {
  user: User | null
  isDark: boolean
  draftCode: Record<string, string>
  authReady: boolean
  studentJoinedClassrooms: Record<string, string[]>
  studentSubmissions: Record<string, Submission[]>
  setUser: (user: User | null) => void
  toggleDark: () => void
  setDraftCode: (problemId: string, code: string) => void
  loginWithCredentials: (username: string, password: string) => Promise<User>
  registerWithCredentials: (username: string, password: string) => Promise<User>
  restoreSession: () => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  joinClassroom: (userId: string, classId: string) => void
  addSubmission: (userId: string, submission: Submission) => void
  resetStudentData: (userId: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isDark: false,
      draftCode: {},
      authReady: false,
      studentJoinedClassrooms: {},
      studentSubmissions: {},
      setUser: (user) => set({ user }),
      toggleDark: () =>
        set((s) => {
          const next = !s.isDark
          document.documentElement.classList.toggle('dark', next)
          return { isDark: next }
        }),
      setDraftCode: (problemId, code) =>
        set((s) => ({
          draftCode: { ...s.draftCode, [problemId]: code },
        })),
      loginWithCredentials: async (username, password) => {
        const { user } = await authApi.login(username, password)
        set({ user })
        return user
      },
      registerWithCredentials: async (username, password) => {
        const { user } = await authApi.register(username, password)
        set({ user })
        return user
      },
      restoreSession: async () => {
        const user = await authApi.fetchCurrentUser()
        set({ user, authReady: true })
      },
      logout: async () => {
        await authApi.logout()
        set({ user: null })
      },
      deleteAccount: async () => {
        await authApi.deleteAccount()
        set({ user: null })
      },
      joinClassroom: (userId, classId) =>
        set((s) => {
          const current = s.studentJoinedClassrooms[userId] ?? []
          if (current.includes(classId)) return {}
          return {
            studentJoinedClassrooms: {
              ...s.studentJoinedClassrooms,
              [userId]: [...current, classId],
            },
          }
        }),
      addSubmission: (userId, submission) =>
        set((s) => {
          const current = s.studentSubmissions[userId] ?? []
          return {
            studentSubmissions: {
              ...s.studentSubmissions,
              [userId]: [submission, ...current],
            },
          }
        }),
      resetStudentData: (userId) =>
        set((s) => ({
          studentJoinedClassrooms: {
            ...s.studentJoinedClassrooms,
            [userId]: [],
          },
          studentSubmissions: {
            ...s.studentSubmissions,
            [userId]: [],
          },
        })),
    }),
    {
      name: 'grader-samsen',
      partialize: (s) => ({
        user: s.user,
        isDark: s.isDark,
        draftCode: s.draftCode,
        studentJoinedClassrooms: s.studentJoinedClassrooms,
        studentSubmissions: s.studentSubmissions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    },
  ),
)
