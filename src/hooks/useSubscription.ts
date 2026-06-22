// src/hooks/useSubscription.ts
'use client'

import { useUserStore } from '@/store/userStore'
import { getEffectivePlan, isPremium, getTrialDaysRemaining, PLAN_LIMITS } from '@/types/subscription'

/**
 * Hook to access subscription state and plan helpers.
 */
export function useSubscription() {
  const { subscription } = useUserStore()

  const plan = getEffectivePlan(subscription)
  const premium = isPremium(subscription)
  const trialDays = getTrialDaysRemaining(subscription)
  const limits = PLAN_LIMITS[plan]
  const isTrialActive = subscription?.plan === 'trial' && trialDays > 0

  return {
    subscription,
    plan,
    isPremium: premium,
    isTrialActive,
    trialDaysRemaining: trialDays,
    limits,
  }
}
