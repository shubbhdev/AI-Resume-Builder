'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EducationItem } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function EducationForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const education = activeResume.content.education || []

  const handleAdd = () => {
    const newItem: EducationItem = {
      id: uuidv4(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
    }
    updateContent({ education: [...education, newItem] })
  }

  const handleUpdate = (id: string, field: keyof EducationItem, value: any) => {
    const updated = education.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    updateContent({ education: updated })
  }

  const handleDelete = (id: string) => {
    updateContent({ education: education.filter(item => item.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Education</h3>
        <Button onClick={handleAdd} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No education history added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group">
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="space-y-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">School / University</Label>
                  <Input 
                    value={item.school}
                    onChange={(e) => handleUpdate(item.id, 'school', e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="bg-white/5 border-white/10" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">Degree</Label>
                    <Input 
                      value={item.degree}
                      onChange={(e) => handleUpdate(item.id, 'degree', e.target.value)}
                      placeholder="e.g. B.S."
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">Field of Study</Label>
                    <Input 
                      value={item.field}
                      onChange={(e) => handleUpdate(item.id, 'field', e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">Start Date</Label>
                    <Input 
                      value={item.startDate}
                      onChange={(e) => handleUpdate(item.id, 'startDate', e.target.value)}
                      placeholder="e.g. Sep 2018"
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">End Date (or Expected)</Label>
                    <Input 
                      value={item.endDate}
                      onChange={(e) => handleUpdate(item.id, 'endDate', e.target.value)}
                      placeholder="e.g. May 2022"
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">GPA (Optional)</Label>
                    <Input 
                      value={item.gpa}
                      onChange={(e) => handleUpdate(item.id, 'gpa', e.target.value)}
                      placeholder="e.g. 3.8/4.0"
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">Honors/Awards (Optional)</Label>
                    <Input 
                      value={item.honors}
                      onChange={(e) => handleUpdate(item.id, 'honors', e.target.value)}
                      placeholder="e.g. Cum Laude, Dean's List"
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
