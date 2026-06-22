'use server'

import { createClient } from '@/lib/supabase/server'
import { callAI, parseAIJson } from '@/lib/ai/gemini'
import { logActivity } from '@/lib/logger'

export interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  workType: 'Remote' | 'Hybrid' | 'On-site'
  salary: string
  postedDate: string
  matchScore: number
  descriptionSummary: string
  url: string
}

export async function fetchAIJobMatches(resumeText: string, preferences: {
  remote?: boolean
  hybrid?: boolean
  onsite?: boolean
  location?: string
  salaryRange?: string
  experienceLevel?: string
}): Promise<JobMatch[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!resumeText) {
    throw new Error('Resume text is required for matching jobs.')
  }

  // Construct a prompt to generate mock job listings
  const prompt = `
You are an advanced AI job matching system. Based on the following resume text and user preferences, generate a list of 10 highly relevant, realistic job postings that match their profile.

User Preferences:
- Remote: ${preferences.remote}
- Hybrid: ${preferences.hybrid}
- On-site: ${preferences.onsite}
- Preferred Location: ${preferences.location || 'Any'}
- Expected Salary: ${preferences.salaryRange || 'Any'}
- Experience Level: ${preferences.experienceLevel || 'Match based on resume'}

Resume:
${resumeText.substring(0, 3000)}

Generate an array of JSON objects representing job postings. Ensure the companies sound realistic (e.g., Tech Innovations Inc, Global Finance Corp, etc.) or use real well-known company names.
The JSON must perfectly match this structure:
[
  {
    "id": "unique-string-uuid",
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, Country or 'Remote'",
    "workType": "Remote" | "Hybrid" | "On-site",
    "salary": "$X,000 - $Y,000",
    "postedDate": "X days ago" or "Today",
    "matchScore": integer from 70 to 99,
    "descriptionSummary": "A 2-3 sentence summary of the job focusing on why it matches the user's skills.",
    "url": "https://company.com/careers/job-id"
  }
]
Only return the valid JSON array.
`

  const responseText = await callAI(prompt, { jsonMode: true, temperature: 0.8 })
  
  let jobs: JobMatch[] = []
  try {
    jobs = parseAIJson<JobMatch[]>(responseText)
  } catch (error) {
    console.error('Failed to parse AI jobs:', error)
    throw new Error('Failed to generate job matches.')
  }

  await logActivity(user.id, 'ai_job_matches_generated')
  return jobs
}

export async function saveJobApplication(job: JobMatch, resumeId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if already saved
  const { data: existing } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_title', job.title)
    .eq('company_name', job.company)
    .single()

  if (existing) {
    throw new Error('Job is already saved.')
  }

  const { data, error } = await supabase.from('job_applications').insert({
    user_id: user.id,
    resume_id: resumeId || null,
    company_name: job.company,
    job_title: job.title,
    job_url: job.url,
    location: job.location,
    salary_range: job.salary,
    status: 'bookmarked',
    match_score: job.matchScore,
    job_description_summary: job.descriptionSummary,
    contacts: {} // empty json
  }).select().single()

  if (error) {
    console.error('Failed to save job:', error)
    throw new Error('Failed to save job.')
  }

  await logActivity(user.id, 'job_saved', { jobId: data.id })
  return data
}

export async function getSavedJobs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch saved jobs:', error)
    throw new Error('Failed to fetch saved jobs.')
  }

  return data
}

import type { ApplicationStatus } from '@/types/database'

export async function updateJobStatus(jobId: string, status: ApplicationStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('job_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update job status:', error)
    throw new Error('Failed to update job status.')
  }

  return data
}
