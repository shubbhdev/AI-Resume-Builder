'use client'

import { useState, useRef } from 'react'
import { Target, Loader2, CheckCircle2, XCircle, AlertTriangle, UploadCloud, Sparkles, Download, ArrowLeft, Briefcase, GraduationCap, Code2, FolderKanban, FileText, Briefcase as BriefcaseIcon } from 'lucide-react'
import { analyzeUploadedResume, improveUploadedResume } from '@/app/actions/ai'
import { fetchAIJobMatches, JobMatch } from '@/app/actions/jobs'
import { JobCard } from '@/components/jobs/JobCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { useSubscription } from '@/hooks/useSubscription'

export default function ATSAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [improving, setImproving] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [improvedResume, setImprovedResume] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'analysis' | 'improved' | 'jobs'>('analysis')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [jobFilters, setJobFilters] = useState({ remote: true, hybrid: true, onsite: true })
  
  const { isPremium } = useSubscription()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
        toast.error('Please upload a valid PDF or DOCX file')
        return
      }
      setFile(selectedFile)
      setResult(null)
      setImprovedResume(null)
      setActiveTab('analysis')
    }
  }

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload your resume (PDF/DOCX)')
    if (!jobDescription.trim()) return toast.error('Please enter a job description')
    if (jobDescription.trim().length < 10) return toast.error('Job description is too short. Please provide more details.')

    if (!isPremium) {
      // Free users check logic could go here
    }

    setLoading(true)
    setImprovedResume(null)
    setActiveTab('analysis')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobDescription', jobDescription)

      const res = await analyzeUploadedResume(formData)
      setResult(res)
      toast.success('Analysis complete!')
    } catch (error: any) {
      if (error.message && (error.message.includes('monthly ATS scan limit') || error.message.includes('free tier limit') || error.name === 'LimitReachedError')) {
        toast.error('You have reached your free tier limit.')
        setShowUpgrade(true)
      } else if (error.message && error.message.includes('Gemini API error: 429')) {
        toast.error('Google Gemini API Key has run out of quota (20 requests limit hit).')
      } else {
        toast.error(error.message || 'Failed to analyze resume')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImproveResume = async () => {
    if (!result?.extractedText) {
      toast.error('No resume text available. Please analyze a resume first.')
      return
    }

    setImproving(true)
    try {
      const improved = await improveUploadedResume(
        result.extractedText,
        jobDescription,
        result.keywords_missing || []
      )
      setImprovedResume(improved)
      setActiveTab('improved')
      toast.success('Resume improved successfully!')
    } catch (error: any) {
      if (error.message && (error.message.includes('monthly Cover Letter limit') || error.message.includes('free tier limit') || error.name === 'LimitReachedError')) {
        toast.error('You have reached your free tier limit.')
        setShowUpgrade(true)
      } else if (error.message && error.message.includes('Gemini API error: 429')) {
        toast.error('Google Gemini API Key has run out of quota (20 requests limit hit).')
      } else {
        toast.error(error.message || 'Failed to improve resume')
      }
    } finally {
      setImproving(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!improvedResume) return

    const htmlContent = generateResumeHTML(improvedResume)
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

  const handleFindJobs = async () => {
    if (!result?.extractedText) return toast.error('No resume analyzed yet')
    setLoadingJobs(true)
    try {
      const fetchedJobs = await fetchAIJobMatches(result.extractedText, jobFilters)
      setJobs(fetchedJobs)
      toast.success('Found relevant jobs!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch jobs')
    } finally {
      setLoadingJobs(false)
    }
  }

  const generateResumeHTML = (resume: any) => {
    const c = resume.contact_info || {}
    const contactParts = [c.email, c.phone, c.location, c.linkedin, c.github].filter(Boolean)
    
    // Helper to strip markdown bold markers from AI output
    const clean = (s: string) => (s || '').replace(/\*\*/g, '')

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${clean(c.name || 'Optimized Resume')}</title>
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
    .summary { font-size: 11.5px; color: #334155; line-height: 1.55; }
    
    /* Experience */
    .exp-entry { margin-bottom: 12px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-title { font-size: 12px; font-weight: 600; color: #0f172a; }
    .exp-company { font-size: 11px; color: #475569; font-weight: 500; }
    .exp-duration { font-size: 10.5px; color: #64748b; white-space: nowrap; }
    ul { padding-left: 18px; margin-top: 4px; }
    li { font-size: 11px; color: #334155; margin-bottom: 2px; line-height: 1.45; }
    
    /* Skills */
    .skill-row { margin-bottom: 3px; font-size: 11px; line-height: 1.5; }
    .skill-cat { font-weight: 600; color: #0f172a; }
    .skill-items { color: #334155; }
    
    /* Projects */
    .project { margin-bottom: 8px; }
    .project-name { font-size: 12px; font-weight: 600; color: #0f172a; display: inline; }
    .project-tech { font-size: 10.5px; color: #64748b; display: inline; }
    .project-desc { font-size: 11px; color: #334155; margin-top: 2px; line-height: 1.45; }
    
    /* Education */
    .edu-entry { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
    .edu-left { }
    .edu-degree { font-size: 12px; font-weight: 600; color: #0f172a; }
    .edu-school { font-size: 11px; color: #475569; }
    .edu-year { font-size: 10.5px; color: #64748b; white-space: nowrap; }
    
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
    ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p: string) => clean(p)).join(' <span class="contact-sep">|</span> ')}</div>` : ''}
  </div>

  <!-- Summary -->
  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary">${clean(resume.summary)}</p>
  </div>
  ` : ''}

  <!-- Experience -->
  ${resume.experience?.length > 0 ? `
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${resume.experience.map((exp: any) => `
    <div class="exp-entry">
      <div class="exp-header">
        <div>
          <span class="exp-title">${clean(exp.title)}</span>
          ${exp.company ? ` <span class="exp-company">— ${clean(exp.company)}</span>` : ''}
        </div>
        <span class="exp-duration">${clean(exp.duration)}</span>
      </div>
      ${exp.bullets?.length > 0 ? `<ul>${exp.bullets.map((b: string) => `<li>${clean(b)}</li>`).join('')}</ul>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Skills -->
  ${resume.skills?.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    ${resume.skills.map((sg: any) => `
    <div class="skill-row">
      <span class="skill-cat">${clean(sg.category)}: </span>
      <span class="skill-items">${sg.items?.map((s: string) => clean(s)).join(', ') || ''}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Projects -->
  ${resume.projects?.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${resume.projects.map((p: any) => `
    <div class="project">
      <div><span class="project-name">${clean(p.name)}</span>${p.technologies?.length > 0 ? ` <span class="project-tech">| ${p.technologies.map((t: string) => clean(t)).join(', ')}</span>` : ''}</div>
      ${p.description ? `<div class="project-desc">${clean(p.description)}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Education -->
  ${resume.education?.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${resume.education.map((e: any) => `
    <div class="edu-entry">
      <div class="edu-left">
        <span class="edu-degree">${clean(e.degree)}</span>
        ${e.school ? ` <span class="edu-school">— ${clean(e.school)}</span>` : ''}
      </div>
      <span class="edu-year">${clean(e.year)}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}
</div>
</body>
</html>`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">ATS Resume Analyzer</h2>
          <p className="text-slate-400 text-sm">Analyze & optimize your resume for any job description</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6 md:gap-8">
        {/* Left Column: Input Form */}
        <div className="space-y-6">
          <div className="card-surface p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Upload Resume</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                {file ? (
                  <p className="text-sm text-emerald-400 font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-300 font-medium">Click or drag file to upload</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF and DOCX</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Target Job Description</label>
              <Textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                placeholder="Paste the full job description here..."
                className="bg-white/5 border-white/10 resize-none font-mono text-xs focus-visible:border-indigo-500"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !file || !jobDescription.trim()}
              className="w-full btn-brand h-12 rounded-xl font-bold text-[15px]"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
              ) : (
                'Analyze Resume Fit'
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="card-surface p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <Target className="w-16 h-16 opacity-20 mb-4" />
              <p>Enter a job description and click Analyze to see how well your resume matches.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
              <p className="animate-pulse">AI is analyzing keywords, formatting, and impact...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Tab Navigation */}
              {result && (
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5 mb-6">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'analysis'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Target className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    ATS Analysis
                  </button>
                  {improvedResume && (
                    <button
                      onClick={() => setActiveTab('improved')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'improved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      Improved Resume
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'jobs'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <BriefcaseIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    Job Matches
                  </button>
                </div>
              )}

              {/* === ANALYSIS TAB === */}
              {activeTab === 'analysis' && (
                <div className="space-y-8">
                  {/* Score Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-200">Match Score</h3>
                      <p className="text-slate-400 text-sm mt-1">Based on ATS parsing algorithms</p>
                    </div>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                      result.overall_score >= 80 ? 'border-emerald-500 text-emerald-400' :
                      result.overall_score >= 60 ? 'border-amber-500 text-amber-400' :
                      'border-red-500 text-red-400'
                    }`}>
                      <span className="text-2xl font-black">{result.overall_score}%</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.scores || {}).map(([key, score]: any) => (
                      <div key={key} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{key}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${score}%` }} 
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300 w-8">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Keywords */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keywords Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords_found?.map((kw: string) => (
                          <span key={kw} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                        {(!result.keywords_found || result.keywords_found.length === 0) && (
                          <span className="text-slate-500 text-sm italic">None found</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-400" /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords_missing?.map((kw: string) => (
                          <span key={kw} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                        {(!result.keywords_missing || result.keywords_missing.length === 0) && (
                          <span className="text-slate-500 text-sm italic">No missing keywords!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-3">Actionable Suggestions</h4>
                    <div className="space-y-3">
                      {result.suggestions?.map((sug: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                            sug.priority === 'high' ? 'text-red-400' :
                            sug.priority === 'medium' ? 'text-amber-400' :
                            'text-indigo-400'
                          }`} />
                          <div>
                            <p className="text-slate-300 text-sm">{sug.suggestion}</p>
                            <p className="text-slate-500 text-xs mt-1 capitalize">Category: {sug.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improve Resume CTA */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-indigo-500/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-100">Improve This Resume</h4>
                          <p className="text-sm text-slate-400 mt-1 mb-4">
                            AI will rewrite your summary, experience bullets, skills, and project descriptions — 
                            optimized for this specific job. Download as PDF when ready.
                          </p>
                          <Button
                            onClick={handleImproveResume}
                            disabled={improving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                          >
                            {improving ? (
                              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Rewriting Resume...</>
                            ) : (
                              <><Sparkles className="w-5 h-5 mr-2" /> Improve &amp; Optimize Resume</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === IMPROVED RESUME TAB === */}
              {activeTab === 'improved' && improvedResume && (
                <div className="space-y-6 animate-fade-in">
                  {/* Header with Download */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-200">ATS-Optimized Resume</h3>
                        <p className="text-slate-500 text-xs">Rewritten for maximum ATS compatibility</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadPDF}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                  </div>

                  {/* Improvements Made */}
                  {improvedResume.improvements_made?.length > 0 && (
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Improvements Made
                      </h4>
                      <ul className="space-y-1.5">
                        {improvedResume.improvements_made.map((imp: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary Section */}
                  {improvedResume.summary && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" /> Professional Summary
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed">{improvedResume.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Experience Section */}
                  {improvedResume.experience?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-400" /> Professional Experience
                      </h4>
                      {improvedResume.experience.map((exp: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{exp.title}</p>
                              <p className="text-xs text-indigo-400 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-xs text-slate-500 shrink-0 ml-4">{exp.duration}</span>
                          </div>
                          {exp.bullets?.length > 0 && (
                            <ul className="space-y-1.5 mt-2">
                              {exp.bullets.map((bullet: string, bi: number) => (
                                <li key={bi} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-indigo-500 mt-1.5 shrink-0">▸</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Section */}
                  {improvedResume.skills?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" /> Skills
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                        {improvedResume.skills.map((skillGroup: any, i: number) => (
                          <div key={i}>
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">{skillGroup.category}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {skillGroup.items?.map((skill: string, si: number) => (
                                <span key={si} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {improvedResume.projects?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-indigo-400" /> Projects
                      </h4>
                      {improvedResume.projects.map((project: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                          <p className="text-sm font-semibold text-slate-200">{project.name}</p>
                          <p className="text-sm text-slate-300">{project.description}</p>
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {project.technologies.map((tech: string, ti: number) => (
                                <span key={ti} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md text-xs font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education Section */}
                  {improvedResume.education?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-400" /> Education
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                        {improvedResume.education.map((edu: any, i: number) => (
                          <div key={i} className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{edu.degree}</p>
                              <p className="text-xs text-slate-400">{edu.school}</p>
                            </div>
                            <span className="text-xs text-slate-500 shrink-0 ml-4">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Download CTA */}
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Analysis
                    </button>
                    <Button
                      onClick={handleDownloadPDF}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 px-5 rounded-xl transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download as PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Improving state (within improved tab) */}
              {activeTab === 'improved' && !improvedResume && improving && (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                  <p className="animate-pulse font-medium">AI is rewriting your resume...</p>
                  <p className="text-sm text-slate-500 mt-2">Optimizing summary, experience, skills &amp; more</p>
                </div>
              )}

              {/* === JOBS TAB === */}
              {activeTab === 'jobs' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">AI-Powered Global Job Matches</h3>
                      <p className="text-slate-500 text-xs">Relevant active jobs based on your analyzed resume</p>
                    </div>
                    {jobs.length > 0 && (
                      <Button onClick={handleFindJobs} disabled={loadingJobs} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300">
                        {loadingJobs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Refresh Matches
                      </Button>
                    )}
                  </div>

                  {jobs.length === 0 && !loadingJobs ? (
                    <div className="text-center py-12 border border-white/10 border-dashed rounded-xl bg-white/5">
                      <BriefcaseIcon className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                      <h4 className="text-slate-300 font-semibold mb-2">Ready to find your next role?</h4>
                      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                        Our AI will match your resume skills and experience against active job postings globally.
                      </p>
                      <Button onClick={handleFindJobs} disabled={loadingJobs} className="btn-brand">
                        Find Matching Jobs Now
                      </Button>
                    </div>
                  ) : loadingJobs ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                      <p className="animate-pulse font-medium text-slate-300">Scanning global job markets...</p>
                      <p className="text-sm text-slate-500 mt-2">Matching your unique skills and experience</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobs.map(job => (
                        <JobCard key={job.id} job={job} resumeId={result?.id} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <UpgradeModal 
        open={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        feature="Unlimited ATS Checks" 
      />
    </div>
  )
}
