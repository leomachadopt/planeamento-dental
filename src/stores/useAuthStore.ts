import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  clinicId?: string
  isActive?: boolean
  lastLogin?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, clinicId?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.login(email, password)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          toast.success(`Bem-vindo, ${response.user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erro ao fazer login')
          throw error
        }
      },

      register: async (email: string, password: string, name: string, clinicId?: string) => {
        set({ isLoading: true })
        try {
          const response = await api.register(email, password, name, clinicId)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          toast.success(`Conta criada com sucesso, ${response.user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erro ao criar conta')
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        toast.success('Logout realizado com sucesso')
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const response = await api.getMe()
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)


