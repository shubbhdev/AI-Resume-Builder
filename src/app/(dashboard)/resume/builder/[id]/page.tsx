'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Download, CheckCircle2, Layout, FileText, Target, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useResumeStore } from '@/store/resumeStore'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ExperienceForm } from '@/components/resume-builder/ExperienceForm'
import { EducationForm } from '@/components/resume-builder/EducationForm'
import { SkillsForm } from '@/components/resume-builder/SkillsForm'
import { AwardsForm } from '@/components/resume-builder/AwardsForm'
import { CertificationsForm } from '@/components/resume-builder/CertificationsForm'
import { ProjectsForm } from '@/components/resume-builder/ProjectsForm'

export default function ResumeBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const { activeResume, setActiveResume, updatePersonalInfo, isDirty, markSaved } = useResumeStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Left panel active tab
  const [activeTab, setActiveTab] = useState<'personal'|'experience'|'education'|'skills'|'projects'|'awards'|'certifications'>('personal')

  // Debounced auto-save
  const debouncedResume = useDebounce(activeResume, 2000)

  useEffect(() => {
    const fetchResume = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single()
      
      if (error || !data) {
        toast.error('Resume not found')
        router.push('/resume')
        return
      }
      
      const { DEFAULT_RESUME_CONTENT } = await import('@/types/resume')
      const mergedContent = {
        ...DEFAULT_RESUME_CONTENT,
        ...(data as any).content,
        personalInfo: {
          ...DEFAULT_RESUME_CONTENT.personalInfo,
          ...((data as any).content?.personalInfo || {})
        }
      }

      setActiveResume({ ...(data as any), content: mergedContent } as any)
      setLoading(false)
    }
    fetchResume()
  }, [id, router, setActiveResume])

  // Auto-save effect
  useEffect(() => {
    if (debouncedResume && isDirty && !loading) {
      handleSave(debouncedResume)
    }
  }, [debouncedResume]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (resumeToSave = activeResume) => {
    if (!resumeToSave) return
    setSaving(true)
    
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('resumes')
        .update({
          title: resumeToSave.title,
          content: resumeToSave.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeToSave.id)

      if (error) {
        throw error
      } else {
        markSaved()
      }
    } catch (error: any) {
      console.error('[Resume Builder] Autosave failed:', error)
      toast.error('Failed to auto-save changes. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!activeResume) return

    const htmlContent = generateResumeHTML(activeResume)
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to download PDF')
      return
    }
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for fonts to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const generateResumeHTML = (resume: any) => {
    const c = resume.content?.personalInfo || {}
    const contactParts = [c.email, c.phone, c.location, c.linkedin, c.website].filter(Boolean)
    
    // Helper to strip markdown bold markers
    const clean = (s: string) => (s || '').replace(/\*\*/g, '')

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${clean(c.name || 'Resume')}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a2e; line-height: 1.5; padding: 0; }
    .page { width: 100%; max-width: 8.5in; margin: 0 auto; padding: 0.4in 0.55in; }
    
    /* Header */
    .header { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #1e293b; margin-bottom: 12px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase; }
    .contact { font-size: 10.5px; color: #475569; margin-top: 5px; }
    .contact span { margin: 0 4px; }
    .contact-sep { color: #cbd5e1; }
    
    /* Sections */
    .section { margin-top: 14px; }
    .section-title { font-size: 11.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #334155; padding-bottom: 3px; margin-bottom: 8px; }
    
    /* Summary */
    .summary { font-size: 11.5px; color: #334155; line-height: 1.55; white-space: pre-wrap; }
    
    /* Experience */
    .exp-entry { margin-bottom: 12px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-title { font-size: 12px; font-weight: 600; color: #0f172a; }
    .exp-company { font-size: 11px; color: #475569; font-weight: 500; }
    .exp-duration { font-size: 10.5px; color: #64748b; white-space: nowrap; }
    .exp-desc { font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.45; white-space: pre-wrap; }
    
    /* Skills */
    .skill-row { margin-bottom: 3px; font-size: 11px; line-height: 1.5; }
    .skill-cat { font-weight: 600; color: #0f172a; }
    .skill-items { color: #334155; }
    
    /* Projects */
    .proj-entry { margin-bottom: 12px; }
    .proj-title { font-size: 12px; font-weight: 600; color: #0f172a; }
    .proj-tech { font-size: 10.5px; color: #4f46e5; font-weight: 500; margin-left: 6px; }
    .proj-link { font-size: 10px; color: #64748b; text-decoration: none; }
    .proj-desc { font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.45; white-space: pre-wrap; }
    
    /* Education */
    .edu-entry { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
    .edu-left { }
    .edu-degree { font-size: 12px; font-weight: 600; color: #0f172a; }
    .edu-school { font-size: 11px; color: #475569; }
    .edu-year { font-size: 10.5px; color: #64748b; white-space: nowrap; }
    
    /* Awards & Certs */
    .award-entry { margin-bottom: 5px; }
    .award-title { font-size: 12px; font-weight: 600; color: #0f172a; }
    .award-issuer { font-size: 11px; color: #475569; }
    
    @media print { 
      body { padding: 0; -webkit-print-color-adjust: exact; }
      .page { padding: 0.4in 0.5in; }
      @page { margin: 0; size: letter; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <h1>${clean(c.name || '')}</h1>
    <div style="font-size: 14px; color: #475569; font-weight: 500; margin-top: 4px;">${clean(c.title || '')}</div>
    ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p: string) => clean(p)).join(' <span class="contact-sep">|</span> ')}</div>` : ''}
  </div>

  <!-- Summary -->
  ${resume.content.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary">${clean(resume.content.summary)}</p>
  </div>
  ` : ''}

  <!-- Experience -->
  ${resume.content.experience?.length > 0 ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${resume.content.experience.map((exp: any) => `
    <div class="exp-entry">
      <div class="exp-header">
        <div>
          <span class="exp-title">${clean(exp.title)}</span>
          ${exp.company ? ` <span class="exp-company">— ${clean(exp.company)}</span>` : ''}
        </div>
        <span class="exp-duration">${clean(exp.startDate)} - ${exp.current ? 'Present' : clean(exp.endDate)}</span>
      </div>
      ${exp.description ? `<div class="exp-desc">${clean(exp.description)}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Education -->
  ${resume.content.education?.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${resume.content.education.map((e: any) => `
    <div class="edu-entry">
      <div class="edu-left">
        <span class="edu-degree">${clean(e.degree)} in ${clean(e.field)}</span>
        ${e.school ? ` <span class="edu-school">— ${clean(e.school)}</span>` : ''}
      </div>
      <span class="edu-year">${clean(e.startDate)} - ${clean(e.endDate)}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Skills -->
  ${resume.content.skills?.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    ${resume.content.skills.map((sg: any) => `
    <div class="skill-row">
      <span class="skill-cat">${clean(sg.category)}: </span>
      <span class="skill-items">${sg.items?.map((s: string) => clean(s)).join(', ') || ''}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Projects -->
  ${resume.content.projects?.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${resume.content.projects.map((p: any) => `
    <div class="proj-entry">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div>
          <span class="proj-title">${clean(p.name)}</span>
          ${p.technologies?.length > 0 ? `<span class="proj-tech">${clean(p.technologies.join(', '))}</span>` : ''}
        </div>
        <div style="text-align: right;">
          ${p.url ? `<a href="${clean(p.url)}" class="proj-link">Link</a>` : ''}
          ${p.url && p.github ? ' | ' : ''}
          ${p.github ? `<a href="${clean(p.github)}" class="proj-link">GitHub</a>` : ''}
        </div>
      </div>
      ${p.description ? `<div class="proj-desc">${clean(p.description)}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Awards -->
  ${resume.content.awards?.length > 0 ? `
  <div class="section">
    <div class="section-title">Awards</div>
    ${resume.content.awards.map((a: any) => `
    <div class="award-entry">
      <div style="display: flex; justify-content: space-between;">
        <span class="award-title">${clean(a.name)}</span>
        <span style="font-size: 10.5px; color: #64748b;">${clean(a.date)}</span>
      </div>
      <div class="award-issuer">${clean(a.issuer)}</div>
      ${a.description ? `<div style="font-size: 11px; color: #334155; margin-top: 2px;">${clean(a.description)}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Certifications -->
  ${resume.content.certifications?.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${resume.content.certifications.map((c: any) => `
    <div class="award-entry">
      <div style="display: flex; justify-content: space-between;">
        <span class="award-title">${clean(c.name)}</span>
        <span style="font-size: 10.5px; color: #64748b;">${clean(c.date)}</span>
      </div>
      <div class="award-issuer">${clean(c.issuer)} ${c.url ? `— <span style="color: #4f46e5;">${clean(c.url)}</span>` : ''}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}
</div>
</body>
</html>`
  }

  if (loading || !activeResume) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const { personalInfo } = activeResume.content

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] -m-4 md:-m-6 overflow-hidden bg-[#0A0A0F]">
      {/* Left Panel: Editor Form */}
      <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0D0D14] z-10 shrink-0 h-[50vh] lg:h-full">
        {/* Editor Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-[#0D0D14]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/resume')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Input 
              value={activeResume.title}
              onChange={(e) => setActiveResume({ ...activeResume, title: e.target.value })}
              className="h-8 bg-transparent border-transparent hover:border-white/10 focus-visible:border-indigo-500 px-2 font-medium text-slate-200 w-32 md:w-48 text-sm md:text-base"
            />
          </div>
          <div className="flex items-center gap-3 text-sm">
            {saving ? (
              <span className="flex items-center text-slate-400 text-xs">
                <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Saving...
              </span>
            ) : isDirty ? (
              <span className="flex items-center text-amber-400 text-xs">
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center text-emerald-400 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Saved
              </span>
            )}
            <Button 
              onClick={() => handleSave()} 
              disabled={!isDirty || saving}
              size="sm"
              className="h-8 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2 md:px-3 text-xs md:text-sm"
            >
              <Save className="w-3.5 h-3.5 md:mr-1.5 hidden md:block" />
              <span className="md:hidden">Save</span>
              <span className="hidden md:inline">Save Now</span>
            </Button>
          </div>
        </div>

        {/* Editor Tabs */}
        <div className="flex px-4 pt-4 gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-white/5">
          {[
            { id: 'personal', label: 'Personal' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
            { id: 'skills', label: 'Skills' },
            { id: 'projects', label: 'Projects' },
            { id: 'awards', label: 'Awards (Optional)' },
            { id: 'certifications', label: 'Certificates' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Personal Details</h3>
              
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Full Name</Label>
                <Input 
                  value={personalInfo?.name || ''}
                  onChange={(e) => updatePersonalInfo({ name: e.target.value })}
                  className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Professional Title</Label>
                <Input 
                  value={personalInfo?.title || ''}
                  onChange={(e) => updatePersonalInfo({ title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Email</Label>
                  <Input 
                    value={personalInfo?.email || ''}
                    onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                    className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Phone</Label>
                  <Input 
                    value={personalInfo?.phone || ''}
                    onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                    className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Location</Label>
                <Input 
                  value={personalInfo?.location || ''}
                  onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                  placeholder="City, Country"
                  className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">LinkedIn</Label>
                  <Input 
                    value={personalInfo?.linkedin || ''}
                    onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                    placeholder="linkedin.com/in/..."
                    className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Website / GitHub</Label>
                  <Input 
                    value={personalInfo?.website || ''}
                    onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                    placeholder="github.com/..."
                    className="bg-white/5 border-white/10 focus-visible:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-400 text-xs">Professional Summary</Label>
                  <button 
                    onClick={async () => {
                      if (!activeResume.content.summary) {
                        toast.error('Please write a brief summary first for AI to enhance')
                        return
                      }
                      const id = toast.loading('AI is optimizing your summary...')
                      try {
                        const { optimizeSummary } = await import('@/app/actions/ai')
                        const improved = await optimizeSummary(activeResume.content.summary)
                        setActiveResume({
                          ...activeResume, 
                          content: { ...activeResume.content, summary: improved }
                        })
                        toast.success('Summary optimized!', { id })
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
                  value={activeResume.content.summary || ''}
                  onChange={(e) => setActiveResume({
                    ...activeResume, 
                    content: { ...activeResume.content, summary: e.target.value }
                  })}
                  rows={5}
                  className="bg-white/5 border-white/10 focus-visible:border-indigo-500 resize-none text-sm"
                  placeholder="A brief summary of your professional background and goals..."
                />
              </div>
            </div>
          )}

          {activeTab === 'experience' && <ExperienceForm />}
          {activeTab === 'education' && <EducationForm />}
          {activeTab === 'skills' && <SkillsForm />}
          {activeTab === 'projects' && <ProjectsForm />}
          {activeTab === 'awards' && <AwardsForm />}
          {activeTab === 'certifications' && <CertificationsForm />}

        </div>
      </div>

      {/* Right Panel: Live PDF Preview */}
      <div className="flex-1 bg-[#0A0A0F] relative flex flex-col min-w-0">
        {/* Preview Toolbar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-200 text-sm font-medium transition flex items-center gap-2">
              <Layout className="w-4 h-4" /> Template: Modern
            </button>
            <Separator orientation="vertical" className="h-4 bg-white/10" />
            <button 
              onClick={() => router.push('/ats')}
              className="text-slate-400 hover:text-slate-200 text-sm font-medium transition flex items-center gap-2"
            >
              <Target className="w-4 h-4" /> ATS Check
            </button>
          </div>
          
          <Button onClick={handleDownloadPDF} className="btn-brand h-8 rounded-lg text-xs font-semibold">
            <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
          </Button>
        </div>

        {/* Live Preview Area (Scaled A4 Paper) */}
        <div className="flex-1 overflow-auto bg-[#0A0A0F] p-4 md:p-8 flex lg:justify-center items-start custom-scrollbar relative">
          <div className="transform origin-top-left lg:origin-top transition-transform duration-200 scale-[0.6] sm:scale-[0.8] lg:scale-[1.0] lg:hover:scale-[1.02] mx-auto">
            <div className="resume-paper rounded-sm overflow-hidden flex flex-col p-12 text-slate-900 ring-1 ring-black/5" style={{ width: '210mm', minHeight: '297mm' }}>
              {/* Dummy Resume Preview Layout */}
              
              {/* Header */}
              <div className="text-center border-b pb-6 mb-6 border-slate-300">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 uppercase">
                  {personalInfo?.name || 'YOUR NAME'}
                </h1>
                <p className="text-lg text-slate-600 font-medium mb-3">
                  {personalInfo?.title || 'Professional Title'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                  {personalInfo?.email && <span>{personalInfo.email}</span>}
                  {personalInfo?.phone && (
                    <>
                      <span>•</span>
                      <span>{personalInfo.phone}</span>
                    </>
                  )}
                  {personalInfo?.location && (
                    <>
                      <span>•</span>
                      <span>{personalInfo.location}</span>
                    </>
                  )}
                  {personalInfo?.linkedin && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600">{personalInfo.linkedin}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              {activeResume.content.summary && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeResume.content.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {(activeResume.content.experience || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Experience
                  </h2>
                  <div className="space-y-4">
                    {activeResume.content.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex items-start justify-between font-bold text-slate-900">
                          <p>{exp.title}</p>
                          <p className="text-sm font-medium whitespace-nowrap">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                        </div>
                        <div className="flex items-start justify-between text-sm text-slate-700 italic mb-2">
                          <p>{exp.company}</p>
                          <p>{exp.location}</p>
                        </div>
                        {exp.description && (
                          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {(activeResume.content.education || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {activeResume.content.education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex items-start justify-between font-bold text-slate-900">
                          <p>{edu.degree} in {edu.field}</p>
                          <p className="text-sm font-medium whitespace-nowrap">
                            {edu.startDate} - {edu.endDate}
                          </p>
                        </div>
                        <div className="flex items-start justify-between text-sm text-slate-700 italic mb-1">
                          <p>{edu.school}</p>
                        </div>
                        {(edu.gpa || edu.honors) && (
                          <p className="text-sm text-slate-600">
                            {edu.gpa && <span>GPA: {edu.gpa}</span>}
                            {edu.gpa && edu.honors && <span> | </span>}
                            {edu.honors && <span>{edu.honors}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {(activeResume.content.skills || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Skills
                  </h2>
                  <div className="space-y-2">
                    {activeResume.content.skills.map((skillGroup) => (
                      <div key={skillGroup.id} className="text-sm text-slate-700">
                        <span className="font-bold text-slate-900 mr-2">{skillGroup.category}:</span>
                        <span>{skillGroup.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {(activeResume.content.projects || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {activeResume.content.projects.map((project) => (
                      <div key={project.id}>
                        <div className="flex items-start justify-between font-bold text-slate-900">
                          <div>
                            <span>{project.name}</span>
                            {project.technologies && project.technologies.length > 0 && (
                              <span className="text-xs text-indigo-600 ml-2 font-medium">
                                {project.technologies.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-slate-500 whitespace-nowrap flex gap-2">
                            {project.url && <span className="text-indigo-500">{project.url}</span>}
                            {project.github && <span>{project.github}</span>}
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {(activeResume.content.awards || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Awards
                  </h2>
                  <div className="space-y-4">
                    {activeResume.content.awards.map((award) => (
                      <div key={award.id}>
                        <div className="flex items-start justify-between font-bold text-slate-900">
                          <p>{award.name}</p>
                          <p className="text-sm font-medium whitespace-nowrap">
                            {award.date}
                          </p>
                        </div>
                        <div className="flex items-start justify-between text-sm text-slate-700 italic mb-1">
                          <p>{award.issuer}</p>
                        </div>
                        {award.description && (
                          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                            {award.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {(activeResume.content.certifications || []).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
                    Certificates
                  </h2>
                  <div className="space-y-4">
                    {activeResume.content.certifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="flex items-start justify-between font-bold text-slate-900">
                          <p>{cert.name}</p>
                          <p className="text-sm font-medium whitespace-nowrap">
                            {cert.date}
                          </p>
                        </div>
                        <div className="flex items-start justify-between text-sm text-slate-700 italic mb-1">
                          <p>{cert.issuer}</p>
                        </div>
                        {cert.url && (
                          <p className="text-sm text-indigo-600">
                            {cert.url}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
