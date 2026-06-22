'use client'

import { useState, useEffect } from 'react'
import { getSavedJobs, updateJobStatus } from '@/app/actions/jobs'
import type { ApplicationStatus } from '@/types/database'
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const data = await getSavedJobs()
      setJobs(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateJobStatus(jobId, newStatus as ApplicationStatus)
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
      toast.success('Status updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const getMatchColor = (score: number) => {
    if (!score) return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (score >= 80) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }

  const STATUSES = ['bookmarked', 'applied', 'interview', 'offer', 'rejected', 'withdrawn']

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Job Tracker</h2>
          <p className="text-slate-400 text-sm">Manage your saved jobs and track applications</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400">Loading your jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border border-white/10 border-dashed rounded-xl bg-white/5">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-slate-200 font-bold mb-2">No jobs tracked yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Use the ATS Analyzer to get AI-powered job matches and save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="card-surface p-5 border border-white/5 hover:border-blue-500/30 transition-colors flex flex-col group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 leading-tight group-hover:text-blue-300 transition-colors">
                    {job.job_title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 mt-1.5 text-sm">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{job.company_name}</span>
                  </div>
                </div>
                {job.match_score && (
                  <div className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-black flex items-center gap-1 ${getMatchColor(job.match_score)}`}>
                    {job.match_score}% Match
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                {job.location && (
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                )}
                {job.salary_range && (
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> {job.salary_range}
                  </span>
                )}
              </div>

              {job.job_description_summary && (
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-2">
                  {job.job_description_summary}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto gap-3">
                <select 
                  value={job.status} 
                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                  className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} className="bg-[#1a1a2e]">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                
                {job.job_url && (
                  <Button 
                    size="sm"
                    onClick={() => window.open(job.job_url, '_blank', 'noopener,noreferrer')}
                    className="h-9 btn-brand gap-1.5 px-4 font-semibold"
                  >
                    View Job <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
