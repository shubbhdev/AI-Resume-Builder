'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AwardItem } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function AwardsForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const awards = activeResume.content.awards || []

  const handleAdd = () => {
    const newItem: AwardItem = {
      id: uuidv4(),
      name: '',
      issuer: '',
      date: '',
      description: '',
    }
    updateContent({ awards: [...awards, newItem] })
  }

  const handleUpdate = (id: string, field: keyof AwardItem, value: any) => {
    const updated = awards.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    updateContent({ awards: updated })
  }

  const handleDelete = (id: string) => {
    updateContent({ awards: awards.filter(item => item.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Awards <span className="text-sm font-normal text-slate-400">(Optional)</span></h3>
        <Button onClick={handleAdd} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No awards added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {awards.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group">
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Award Name</Label>
                  <Input 
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                    placeholder="e.g. Employee of the Month"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Issuer</Label>
                  <Input 
                    value={item.issuer}
                    onChange={(e) => handleUpdate(item.id, 'issuer', e.target.value)}
                    placeholder="e.g. Google"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Date</Label>
                  <Input 
                    value={item.date}
                    onChange={(e) => handleUpdate(item.id, 'date', e.target.value)}
                    placeholder="e.g. Jan 2023"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 pr-6">
                <Label className="text-slate-400 text-xs">Description</Label>
                <Textarea 
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                  placeholder="Describe the award..."
                  rows={2}
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
