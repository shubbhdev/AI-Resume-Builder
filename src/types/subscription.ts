// src/types/subscription.ts
import type { SubscriptionPlan, SubscriptionStatus, BillingInterval } from './database'

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  billing_interval: BillingInterval | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_sub_id: string | null
  amount_paise: number | null
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  resumes: number
  templates: number
  atsScansPerMonth: number
  coverLettersPerMonth: number
  interviewQuestionsPerMonth: number
  jobApplications: number
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    resumes: 1,
    templates: 2,
    atsScansPerMonth: 3,
    coverLettersPerMonth: 3,
    interviewQuestionsPerMonth: 10,
    jobApplications: 10,
  },
  trial: {
    resumes: Infinity,
    templates: Infinity,
    atsScansPerMonth: Infinity,
    coverLettersPerMonth: Infinity,
    interviewQuestionsPerMonth: Infinity,
    jobApplications: Infinity,
  },
  premium: {
    resumes: Infinity,
    templates: Infinity,
    atsScansPerMonth: Infinity,
    coverLettersPerMonth: Infinity,
    interviewQuestionsPerMonth: Infinity,
    jobApplications: Infinity,
  },
}

export const PLAN_PRICES = {
  monthly: {
    paise: 49900,
    display: '₹499',
    interval: 'month' as const,
  },
  annual: {
    paise: 399900,
    display: '₹3,999',
    interval: 'year' as const,
    monthlyEquivalent: '₹333',
    savingsPercent: 33,
  },
}

/** Returns effective plan considering trial expiry */
export function getEffectivePlan(sub: Subscription | null): SubscriptionPlan {
  if (!sub) return 'free'
  if (sub.plan === 'trial') {
    const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null
    if (trialEnd && trialEnd < new Date()) return 'free'
  }
  if (sub.status !== 'active') return 'free'
  return sub.plan
}

export function isPremium(sub: Subscription | null): boolean {
  const plan = getEffectivePlan(sub)
  return plan === 'premium' || plan === 'trial'
}

export function getTrialDaysRemaining(sub: Subscription | null): number {
  if (!sub || sub.plan !== 'trial' || !sub.trial_ends_at) return 0
  const diff = new Date(sub.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
