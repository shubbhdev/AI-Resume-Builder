'use client'

import { useEffect, useState } from 'react'
import { Plus, FileText, Loader2, MoreVertical, Trash2, Edit3, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { DEFAULT_RESUME_CONTENT } from '@/types/resume'
import type { Resume } from '@/types/resume'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ResumeDashboard() {
  const router = useRouter()
  const { user } = useUser()
  const { limits, isPremium, plan } = useSubscription()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchResumes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        toast.error('Failed to load resumes')
      } else {
        setResumes(data as Resume[])
      }
      setLoading(false)
    }

    fetchResumes()
  }, [user])

  const handleCreateNew = async () => {
    if (resumes.length >= limits.resumes && !isPremium) {
      toast.error(`Free plan limited to ${limits.resumes} resume(s). Please upgrade to Premium.`)
      router.push('/billing')
      return
    }

    setCreating(true)
    const supabase = createClient()
    const newResume = {
      user_id: user!.id,
      title: 'Untitled Resume',
      template: 'modern',
      content: DEFAULT_RESUME_CONTENT,
      is_primary: resumes.length === 0,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('resumes')
      .insert(newResume)
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setCreating(false)
      return
    }

    toast.success('Resume created')
    router.push(`/resume/builder/${data.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    const supabase = createClient()
    const { error } = await supabase.from('resumes').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete resume')
      return
    }

    setResumes(resumes.filter(r => r.id !== id))
    toast.success('Resume deleted')
  }

  const handleSetPrimary = async (id: string) => {
    const supabase = createClient()
    
    // Unset all primary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('resumes').update({ is_primary: false }).eq('user_id', user!.id)
    // Set new primary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('resumes').update({ is_primary: true }).eq('id', id)

    if (error) {
      toast.error('Failed to set primary resume')
      return
    }

    setResumes(resumes.map(r => ({ ...r, is_primary: r.id === id })))
    toast.success('Primary resume updated')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">My Resumes</h2>
          <p className="text-slate-400 text-sm mt-1">
            {resumes.length} / {limits.resumes === Infinity ? 'Unlimited' : limits.resumes} resumes used
          </p>
        </div>
        <Button 
          onClick={handleCreateNew} 
          disabled={creating || loading}
          className="btn-brand font-semibold rounded-xl h-10"
        >
          {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Create New Resume
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="card-surface p-12 text-center border-dashed border-2 border-white/10 hover:border-indigo-500/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">No resumes yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Create your first ATS-optimized resume to start applying for jobs.
          </p>
          <Button onClick={handleCreateNew} className="btn-brand font-semibold rounded-xl">
            Build My First Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <div key={resume.id} className="card-surface p-5 hover:border-indigo-500/30 transition-colors group relative">
              {resume.is_primary && (
                <div className="absolute -top-3 -right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20 backdrop-blur-sm z-10 shadow-lg">
                  <Star className="w-3 h-3 fill-emerald-400" /> Primary
                </div>
              )}
              
              <div className="aspect-[1/1.4] bg-white/5 rounded-lg mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-indigo-500/20 transition-colors cursor-pointer" onClick={() => router.push(`/resume/builder/${resume.id}`)}>
                <FileText className="w-12 h-12 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Edit Resume
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-200 truncate pr-2">{resume.title}</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-colors cursor-pointer border-none outline-none focus:ring-0">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#1A1A26] border-white/10 text-slate-200 rounded-xl p-1 shadow-xl">
                    <DropdownMenuItem 
                      onClick={() => router.push(`/resume/builder/${resume.id}`)}
                      className="cursor-pointer hover:bg-white/10 rounded-lg px-3 py-2 text-sm focus:bg-white/10 focus:text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2 text-slate-400" /> Edit
                    </DropdownMenuItem>
                    {!resume.is_primary && (
                      <DropdownMenuItem 
                        onClick={() => handleSetPrimary(resume.id)}
                        className="cursor-pointer hover:bg-white/10 rounded-lg px-3 py-2 text-sm focus:bg-white/10 focus:text-white"
                      >
                        <Star className="w-4 h-4 mr-2 text-amber-400" /> Set as Primary
                      </DropdownMenuItem>
                    )}
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(resume.id)}
                      className="cursor-pointer text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-2 text-sm focus:bg-red-500/10 focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
