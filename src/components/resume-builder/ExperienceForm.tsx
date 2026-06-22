'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, GripVertical, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ExperienceItem } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function ExperienceForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const experience = activeResume.content.experience || []

  const handleAdd = () => {
    const newItem: ExperienceItem = {
      id: uuidv4(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bullets: [],
    }
    updateContent({ experience: [...experience, newItem] })
  }

  const handleUpdate = (id: string, field: keyof ExperienceItem, value: any) => {
    const updated = experience.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    updateContent({ experience: updated })
  }

  const handleDelete = (id: string) => {
    updateContent({ experience: experience.filter(item => item.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Work Experience</h3>
        <Button onClick={handleAdd} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Role
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No work experience added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((item, index) => (
            <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group">
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Job Title</Label>
                  <Input 
                    value={item.title}
                    onChange={(e) => handleUpdate(item.id, 'title', e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Company</Label>
                  <Input 
                    value={item.company}
                    onChange={(e) => handleUpdate(item.id, 'company', e.target.value)}
                    placeholder="e.g. Google"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Start Date</Label>
                  <Input 
                    value={item.startDate}
                    onChange={(e) => handleUpdate(item.id, 'startDate', e.target.value)}
                    placeholder="e.g. Jan 2021"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">End Date</Label>
                  <Input 
                    value={item.endDate}
                    onChange={(e) => handleUpdate(item.id, 'endDate', e.target.value)}
                    placeholder="e.g. Present"
                    disabled={item.current}
                    className="bg-white/5 border-white/10 disabled:opacity-50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Location</Label>
                  <Input 
                    value={item.location}
                    onChange={(e) => handleUpdate(item.id, 'location', e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id={`current-${item.id}`}
                  checked={item.current}
                  onChange={(e) => handleUpdate(item.id, 'current', e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500/50 w-4 h-4"
                />
                <Label htmlFor={`current-${item.id}`} className="text-slate-300 text-xs cursor-pointer">I currently work here</Label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-400 text-xs">Description</Label>
                  <button 
                    onClick={async () => {
                      if (!item.description) {
                        toast.error('Please write a brief description first for AI to enhance')
                        return
                      }
                      const id = toast.loading('AI is optimizing your experience...')
                      try {
                        const { optimizeDescription } = await import('@/app/actions/ai')
                        const improved = await optimizeDescription(item.description, item.title)
                        handleUpdate(item.id, 'description', improved)
                        toast.success('Experience optimized!', { id })
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to enhance', { id })
                      }
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    <Star className="w-3 h-3" /> AI Enhance
                  </button>
                </div>
                <Textarea 
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={4}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
