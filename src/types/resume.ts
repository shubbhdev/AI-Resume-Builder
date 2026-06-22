// src/types/resume.ts
// Resume domain types

export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  title: string // e.g. "Senior Software Engineer"
}

export interface ExperienceItem {
  id: string
  company: string
  title: string
  location: string
  startDate: string // "Jan 2022"
  endDate: string   // "Present" or "Dec 2023"
  current: boolean
  description: string
  bullets: string[]
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
  honors: string
}

export interface SkillGroup {
  id: string
  category: string  // e.g. "Frontend", "Backend", "Tools"
  items: string[]
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  technologies: string[]
  url: string
  github: string
  bullets: string[]
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

export interface AwardItem {
  id: string
  name: string
  issuer: string
  date: string
  description: string
}

export interface LanguageItem {
  id: string
  language: string
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic'
}

export interface ResumeContent {
  personalInfo: PersonalInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  awards: AwardItem[]
  languages: LanguageItem[]
}

export interface Resume {
  id: string
  user_id: string
  title: string
  template: ResumeTemplate
  content: ResumeContent
  is_primary: boolean
  created_at: string
  updated_at: string
}

export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative'

// Default empty resume content
export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    title: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
  languages: [],
}
