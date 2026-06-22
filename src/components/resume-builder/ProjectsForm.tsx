'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectItem } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function ProjectsForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const projects = activeResume.content.projects || []

  const handleAdd = () => {
    const newItem: ProjectItem = {
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      github: '',
      bullets: [],
    }
    updateContent({ projects: [...projects, newItem] })
  }

  const handleUpdate = (id: string, field: keyof ProjectItem, value: any) => {
    const updated = projects.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    updateContent({ projects: updated })
  }

  const handleDelete = (id: string) => {
    updateContent({ projects: projects.filter(item => item.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Projects</h3>
        <Button onClick={handleAdd} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No projects added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group">
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Project Name</Label>
                  <Input 
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                    placeholder="e.g. E-Commerce Platform"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Technologies (comma separated)</Label>
                  <Input 
                    value={item.technologies?.join(', ') || ''}
                    onChange={(e) => handleUpdate(item.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Live URL</Label>
                  <Input 
                    value={item.url}
                    onChange={(e) => handleUpdate(item.id, 'url', e.target.value)}
                    placeholder="e.g. https://myproject.com"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">GitHub Repository</Label>
                  <Input 
                    value={item.github}
                    onChange={(e) => handleUpdate(item.id, 'github', e.target.value)}
                    placeholder="e.g. github.com/username/project"
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 pr-6">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-400 text-xs">Description</Label>
                  <button 
                    onClick={async () => {
                      if (!item.description) {
                        toast.error('Please write a brief description first for AI to enhance')
                        return
                      }
                      const id = toast.loading('AI is optimizing your project description...')
                      try {
                        const { optimizeDescription } = await import('@/app/actions/ai')
                        const improved = await optimizeDescription(item.description, item.name)
                        handleUpdate(item.id, 'description', improved)
                        toast.success('Project description optimized!', { id })
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
                  placeholder="Describe your project, your role, and what it does..."
                  rows={3}
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
