'use client'

import { useState } from 'react'
import { MapPin, Building2, Calendar, DollarSign, ExternalLink, BookmarkPlus, CheckCircle2, BookmarkCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobMatch, saveJobApplication } from '@/app/actions/jobs'
import { toast } from 'sonner'

interface JobCardProps {
  job: JobMatch
  resumeId?: string
}

export function JobCard({ job, resumeId }: JobCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (saved) return
    setSaving(true)
    try {
      await saveJobApplication(job, resumeId)
      setSaved(true)
      toast.success('Job saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (score >= 80) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }

  return (
    <div className="card-surface p-5 border border-white/5 hover:border-indigo-500/30 transition-colors flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 leading-tight group-hover:text-indigo-300 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-400 mt-1.5 text-sm">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-black flex items-center gap-1 ${getMatchColor(job.matchScore)}`}>
          {job.matchScore}% Match
        </div>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
        <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {job.location}
        </span>
        <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> {job.salary}
        </span>
        <span className={`px-2 py-1 rounded border flex items-center gap-1.5 ${
          job.workType === 'Remote' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
          job.workType === 'Hybrid' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
          'bg-slate-500/10 text-slate-300 border-slate-500/20'
        }`}>
          {job.workType}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-3">
        {job.descriptionSummary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Posted {job.postedDate}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSave}
            disabled={saving || saved}
            className={`h-9 border-white/10 ${saved ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/10' : 'text-slate-300 hover:text-white bg-white/5'}`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             saved ? <BookmarkCheck className="w-4 h-4" /> : 
             <BookmarkPlus className="w-4 h-4" />}
          </Button>
          <Button 
            size="sm"
            onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
            className="h-9 btn-brand gap-1.5 px-4 font-semibold"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
