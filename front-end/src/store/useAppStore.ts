import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Submission, Problem } from '@/types'
import * as authApi from '@/lib/api'

interface AppState {
  user: User | null
  isDark: boolean
  draftCode: Record<string, string>
  authReady: boolean
  problems: Problem[]
  submissions: Submission[]
  studentJoinedClassrooms: Record<string, string[]>
  studentSubmissions: Record<string, Submission[]>
  setUser: (user: User | null) => void
  toggleDark: () => void
  setDraftCode: (problemId: string, code: string) => void
  loginWithCredentials: (username: string, password: string) => Promise<User>
  registerWithCredentials: (username: string, password: string, role?: string, teacherCode?: string) => Promise<User>
  restoreSession: () => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  joinClassroom: (userId: string, classId: string) => void
  addSubmission: (userId: string, submission: Submission) => void
  resetStudentData: (userId: string) => void
  fetchProblems: () => Promise<void>
  fetchSubmissions: () => Promise<void>
  submitSolution: (problemId: string, language: string, code: string) => Promise<Submission>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isDark: false,
      draftCode: {},
      authReady: false,
      problems: [],
      submissions: [],
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
      registerWithCredentials: async (username, password, role, teacherCode) => {
        const { user } = await authApi.register(username, password, role, teacherCode)
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
      fetchProblems: async () => {
        try {
          const problems = await authApi.fetchProblems()
          set({ problems })
        } catch (err) {
          console.error('Failed to fetch problems', err)
        }
      },
      fetchSubmissions: async () => {
        try {
          const submissions = await authApi.fetchSubmissions()
          set({ submissions })
        } catch (err) {
          console.error('Failed to fetch submissions', err)
        }
      },
      submitSolution: async (problemId, language, code) => {
        const submission = await authApi.submitCodeSolution(problemId, language, code)
        
        // Also add locally
        const user = get().user
        if (user) {
          get().addSubmission(user.id, submission)
        }
        
        return submission
      },
    }),
    {
      name: 'grader-samsen',
      partialize: (s) => ({
        user: s.user,
        isDark: s.isDark,
        draftCode: s.draftCode,
        problems: s.problems,
        submissions: s.submissions,
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
