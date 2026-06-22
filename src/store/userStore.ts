// src/store/userStore.ts
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Subscription } from '@/types/subscription'

interface UserStore {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean

  setUser: (user: User | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  subscription: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, subscription: null, isLoading: false }),
}))
