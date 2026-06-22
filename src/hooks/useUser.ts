// src/hooks/useUser.ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

/**
 * Hook to initialize and keep Supabase auth state in sync with Zustand store.
 * Use once in the root dashboard layout.
 */
export function useAuthInit() {
  const { setUser, setSubscription, setLoading, reset } = useUserStore()

  useEffect(() => {
    // Initial session load
    const loadUser = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Fetch subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()
          setSubscription(sub)
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null)

            if (session?.user) {
              const { data: sub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .single()
              setSubscription(sub)
            } else {
              reset()
            }
          }
        )

        // Return cleanup function to the useEffect scope (we'll store it locally or just ignore it for now if we can't return from async, wait, we must return from useEffect)
        return subscription
      } catch (err) {
        console.error('Failed to init auth:', err)
        return null
      } finally {
        setLoading(false)
      }
    }

    let sub: any = null;
    loadUser().then(s => sub = s);

    return () => {
      if (sub) sub.unsubscribe()
    }


  }, [setUser, setSubscription, setLoading, reset])
}

/**
 * Simple hook to access the current user from the store.
 */
export function useUser() {
  const { user, isLoading } = useUserStore()
  return { user, isLoading }
}
