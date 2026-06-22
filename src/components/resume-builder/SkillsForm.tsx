'use client'

import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SkillGroup } from '@/types/resume'
import { v4 as uuidv4 } from 'uuid'

export function SkillsForm() {
  const { activeResume, updateContent } = useResumeStore()
  
  if (!activeResume) return null
  const skills = activeResume.content.skills || []

  const handleAddGroup = () => {
    const newGroup: SkillGroup = {
      id: uuidv4(),
      category: '',
      items: [],
    }
    updateContent({ skills: [...skills, newGroup] })
  }

  const handleUpdateCategory = (id: string, value: string) => {
    const updated = skills.map(group => 
      group.id === id ? { ...group, category: value } : group
    )
    updateContent({ skills: updated })
  }

  const handleAddSkill = (groupId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault()
      const newSkill = e.currentTarget.value.trim()
      const updated = skills.map(group => 
        group.id === groupId ? { ...group, items: [...group.items, newSkill] } : group
      )
      updateContent({ skills: updated })
      e.currentTarget.value = ''
    }
  }

  const handleRemoveSkill = (groupId: string, indexToRemove: number) => {
    const updated = skills.map(group => 
      group.id === groupId ? { ...group, items: group.items.filter((_, i) => i !== indexToRemove) } : group
    )
    updateContent({ skills: updated })
  }

  const handleDeleteGroup = (id: string) => {
    updateContent({ skills: skills.filter(group => group.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Skills</h3>
        <Button onClick={handleAddGroup} size="sm" className="btn-brand h-8">
          <Plus className="w-4 h-4 mr-1.5" /> Add Skill Category
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/3">
          <p className="text-slate-500 text-sm">No skills added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {skills.map((group) => (
            <div key={group.id} className="p-5 rounded-xl border border-white/10 bg-white/5 relative group/container">
              <button 
                onClick={() => handleDeleteGroup(group.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover/container:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="space-y-4 pr-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Category Name</Label>
                  <Input 
                    value={group.category}
                    onChange={(e) => handleUpdateCategory(group.id, e.target.value)}
                    placeholder="e.g. Programming Languages, Tools, Soft Skills"
                    className="bg-white/5 border-white/10" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Skills (Press Enter to add)</Label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:border-indigo-500 transition-colors">
                    {group.items.map((skill, idx) => (
                      <div key={idx} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-md flex items-center gap-1.5 text-sm">
                        <span>{skill}</span>
                        <button 
                          onClick={() => handleRemoveSkill(group.id, idx)}
                          className="hover:text-indigo-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <input 
                      type="text"
                      onKeyDown={(e) => handleAddSkill(group.id, e)}
                      placeholder={group.items.length === 0 ? "Type a skill and press Enter" : ""}
                      className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm min-w-[150px] placeholder:text-slate-500 px-1"
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
