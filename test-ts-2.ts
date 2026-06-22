import { Database } from './src/types/database'
import { JobMatch } from './src/app/actions/jobs'

type JobAppInsert = Database['public']['Tables']['job_applications']['Insert']

function test(job: JobMatch, user: any, resumeId?: string) {
  const insertPayload: JobAppInsert = {
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
    contacts: {}
  }
}
