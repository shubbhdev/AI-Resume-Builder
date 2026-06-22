'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CertificationItem } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function CertificationsForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const certifications = activeResume.content.certifications || []

  const handleAdd = () => {
    const newItem: CertificationItem = {
      id: uuidv4(),
      name: '',
      issuer: '',
      date: '',
      url: '',
    }
    updateContent({ certifications: [...certifications, newItem] })
  }

  const handleUpdate = (id: string, field: keyof CertificationItem, value: any) => {
    const updated = certifications.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    updateContent({ certifications: updated })
  }

  const handleDelete = (id: string) => {
    updateContent({ certifications: certifications.filter(item => item.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Certifications</h3>
        <Button onClick={handleAdd} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Certificate
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No certifications added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {certifications.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group">
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Certificate Name</Label>
                  <Input 
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Issuer</Label>
                  <Input 
                    value={item.issuer}
                    onChange={(e) => handleUpdate(item.id, 'issuer', e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Date</Label>
                  <Input 
                    value={item.date}
                    onChange={(e) => handleUpdate(item.id, 'date', e.target.value)}
                    placeholder="e.g. Jan 2023"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">URL</Label>
                  <Input 
                    value={item.url}
                    onChange={(e) => handleUpdate(item.id, 'url', e.target.value)}
                    placeholder="e.g. https://aws.amazon.com/certification/..."
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
