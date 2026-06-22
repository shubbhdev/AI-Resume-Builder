// src/store/resumeStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Resume, ResumeContent } from '@/types/resume'
import { DEFAULT_RESUME_CONTENT } from '@/types/resume'

interface ResumeStore {
  // Currently editing resume
  activeResume: Resume | null
  isDirty: boolean // unsaved changes

  // Actions
  setActiveResume: (resume: Resume | null) => void
  updateContent: (content: Partial<ResumeContent>) => void
  updatePersonalInfo: (info: Partial<ResumeContent['personalInfo']>) => void
  markSaved: () => void
  resetStore: () => void
}

export const useResumeStore = create<ResumeStore>()(
  devtools(
    (set, get) => ({
      activeResume: null,
      isDirty: false,

      setActiveResume: (resume) => set({ activeResume: resume, isDirty: false }),

      updateContent: (content) => {
        const current = get().activeResume
        if (!current) return
        set({
          activeResume: {
            ...current,
            content: { ...current.content, ...content },
          },
          isDirty: true,
        })
      },

      updatePersonalInfo: (info) => {
        const current = get().activeResume
        if (!current) return
        set({
          activeResume: {
            ...current,
            content: {
              ...current.content,
              personalInfo: { ...current.content.personalInfo, ...info },
            },
          },
          isDirty: true,
        })
      },

      markSaved: () => set({ isDirty: false }),
      resetStore: () => set({ activeResume: null, isDirty: false }),
    }),
    { name: 'resume-store' }
  )
)
