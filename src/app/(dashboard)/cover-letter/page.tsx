'use client'

import { useState, useEffect } from 'react'
import { Mail, Loader2, Copy, FileText, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateCoverLetter } from '@/app/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { useSubscription } from '@/hooks/useSubscription'

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<any[]>([])
  const [selectedResume, setSelectedResume] = useState<string>('')
  
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  
  const { isPremium } = useSubscription()

  useEffect(() => {
    const fetchResumes = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('resumes').select('id, title, is_primary')
      if (data) {
        const resumesData = data as any[]
        setResumes(resumesData)
        const primary = resumesData.find((r) => r.is_primary)
        if (primary) setSelectedResume(primary.id)
        else if (resumesData.length > 0) setSelectedResume(resumesData[0].id)
      }
    }
    fetchResumes()
  }, [])

  const handleGenerate = async () => {
    if (!selectedResume) return toast.error('Please select a resume base')
    if (!company || !jobTitle) return toast.error('Company and Job Title are required')
    if (company.length < 2) return toast.error('Please enter a valid company name')
    if (jobTitle.length < 2) return toast.error('Please enter a valid job title')

    if (!isPremium) {
      // In a real app we'd track free generations
    }

    setLoading(true)
    try {
      const res = await generateCoverLetter(selectedResume, company, jobTitle, jobDescription)
      setResult(res.content)
      toast.success('Cover letter generated!')
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes('limit')) {
        toast.error('You have reached your free tier limit.')
        setShowUpgrade(true)
      } else {
        toast.error(error.message || 'Failed to generate cover letter')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = () => {
    if (!result) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to download PDF')
      return
    }
    
    // Convert newlines to paragraphs
    const formattedContent = result
      .split('\n\n')
      .map(p => `<p style="margin-bottom: 12px; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cover Letter - ${company}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          body { 
            font-family: 'Inter', -apple-system, sans-serif;
            padding: 1in;
            margin: 0 auto;
            max-width: 8.5in;
            color: #0f172a;
          }
          @media print {
            body { padding: 0.5in; }
          }
        </style>
      </head>
      <body>
        ${formattedContent}
      </body>
      </html>
    `)
    printWindow.document.close()
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up h-full flex flex-col">
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">AI Cover Letter Generator</h2>
          <p className="text-slate-400 text-sm">Create tailored cover letters in seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="card-surface p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300">Base Resume</Label>
              {resumes.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400 mb-3">You haven't built any resumes yet.</p>
                  <a href="/resume" className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
                    Go to Resume Builder
                  </a>
                </div>
              ) : (
                <select 
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-500 transition-colors"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111118]">
                      {r.title} {r.is_primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Target Company</Label>
              <Input 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="bg-white/5 border-white/10 focus-visible:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Job Title</Label>
              <Input 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                className="bg-white/5 border-white/10 focus-visible:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Job Description (Optional but recommended)</Label>
              <Textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the job description to match keywords and tone..."
                className="bg-white/5 border-white/10 resize-none text-xs focus-visible:border-violet-500"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !selectedResume || !company || !jobTitle}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white h-12 rounded-xl font-bold text-[15px] transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Writing...</>
              ) : (
                <><Mail className="w-5 h-5 mr-2" /> Generate Cover Letter</>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="card-surface flex flex-col min-h-[500px] border-violet-500/20">
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/5">
            <h3 className="font-medium text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" /> Output Editor
            </h3>
            {result && (
              <div className="flex items-center gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/10 text-slate-300">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/10 text-indigo-300">
                  <FileText className="w-4 h-4 mr-1.5" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col relative">
            {!result && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Mail className="w-16 h-16 opacity-20 mb-4" />
                <p>Fill out the details and click generate.</p>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-violet-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="animate-pulse">Crafting your perfect cover letter...</p>
              </div>
            )}

            {result && !loading && (
              <Textarea 
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="flex-1 w-full h-full bg-transparent border-none outline-none resize-none text-slate-300 leading-relaxed font-sans text-[15px] focus-visible:ring-0 p-0"
              />
            )}
          </div>
        </div>
      </div>
      
      <UpgradeModal 
        open={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        feature="Unlimited Cover Letters" 
      />
    </div>
  )
}
