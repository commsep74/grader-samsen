import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import * as authApi from '@/lib/api'

interface AppState {
  user: User | null
  isDark: boolean
  draftCode: Record<string, string>
  authReady: boolean
  setUser: (user: User | null) => void
  toggleDark: () => void
  setDraftCode: (problemId: string, code: string) => void
  loginWithCredentials: (username: string, password: string) => Promise<User>
  registerWithCredentials: (username: string, password: string) => Promise<User>
  restoreSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isDark: false,
      draftCode: {},
      authReady: false,
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
    }),
    {
      name: 'grader-samsen',
      partialize: (s) => ({
        user: s.user,
        isDark: s.isDark,
        draftCode: s.draftCode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    },
  ),
)
