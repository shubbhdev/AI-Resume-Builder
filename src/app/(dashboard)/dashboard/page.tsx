// src/app/(dashboard)/dashboard/page.tsx
// Main dashboard — stats, quick actions, recent activity
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export type ActivityItem = {
  id: string
  type: 'resume' | 'cover_letter' | 'ats_scan'
  title: string
  date: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let resumeCount = 0
  let coverLetterCount = 0
  let bestAtsScore = '—'
  let recentActivity: ActivityItem[] = []
  let hasScannedATS = false
  let isPremium = false

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [
      { count: rCount, data: recentResumes },
      { count: clCount, data: recentCLs },
      { data: recentAts },
      { data: subscription }
    ] = await Promise.all([
      (supabase as any).from('resumes').select('id, title, created_at', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      (supabase as any).from('cover_letters').select('id, company_name, job_title, created_at', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      (supabase as any).from('ats_scans').select('id, overall_score, job_description, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      (supabase as any).from('subscriptions').select('plan, status').eq('user_id', user.id).single()
    ])
    
    resumeCount = rCount || 0
    coverLetterCount = clCount || 0
    
    if (recentAts && recentAts.length > 0) {
      hasScannedATS = true
      const maxScore = Math.max(...recentAts.map((a: any) => a.overall_score || 0))
      bestAtsScore = maxScore + '%'
    }

    // Merge and sort activities
    const activities: ActivityItem[] = []
    
    if (recentResumes) {
      recentResumes.forEach((r: any) => activities.push({ id: r.id, type: 'resume', title: `Created resume: ${r.title || 'Untitled'}`, date: r.created_at }))
    }
    if (recentCLs) {
      recentCLs.forEach((c: any) => activities.push({ id: c.id, type: 'cover_letter', title: `Generated cover letter for ${c.company_name || 'a company'}`, date: c.created_at }))
    }
    if (recentAts) {
      recentAts.forEach((a: any) => activities.push({ id: a.id, type: 'ats_scan', title: `Scanned ATS Score: ${a.overall_score}%`, date: a.created_at }))
    }

    recentActivity = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    
    if (subscription?.plan === 'premium' && subscription?.status === 'active') {
      isPremium = true
    }
  }

  return (
    <DashboardClient 
      resumeCount={resumeCount}
      coverLetterCount={coverLetterCount}
      bestAtsScore={bestAtsScore}
      recentActivity={recentActivity}
      hasScannedATS={hasScannedATS}
      isPremium={isPremium}
    />
  )
}
