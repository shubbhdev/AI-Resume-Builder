import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan, PLAN_LIMITS } from '@/types/subscription'

export class LimitReachedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LimitReachedError'
  }
}

export type ActionType = 'ats_scan' | 'cover_letter'

export async function checkUserLimit(userId: string, action: ActionType) {
  const supabase = await createClient()

  // 1. Get user subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  const plan = getEffectivePlan(subscription)
  const limits = PLAN_LIMITS[plan]

  // Start of current calendar month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // 2. Check limits
  if (action === 'ats_scan') {
    if (limits.atsScansPerMonth === Infinity) return true
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('ats_scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth)
      
    if (error) {
      console.error('Failed to count ats_scans', error)
      return true // Fail open to not block users if DB errors
    }
    if ((count || 0) >= limits.atsScansPerMonth) {
      throw new LimitReachedError('You have reached your monthly ATS scan limit.')
    }
  } else if (action === 'cover_letter') {
    if (limits.coverLettersPerMonth === Infinity) return true
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('cover_letters')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth)
      
    if (error) {
      console.error('Failed to count cover_letters', error)
      return true
    }
    if ((count || 0) >= limits.coverLettersPerMonth) {
      throw new LimitReachedError('You have reached your monthly Cover Letter limit.')
    }
  }

  return true
}
