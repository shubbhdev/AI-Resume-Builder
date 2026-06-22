'use server'

import { createClient } from '@/lib/supabase/server'
import { callAI, parseAIJson } from '@/lib/ai/gemini'
import { PROMPTS } from '@/lib/ai/prompts'
import * as mammoth from 'mammoth'
import { logActivity } from '@/lib/logger'
import { checkUserLimit, LimitReachedError } from '@/lib/limits'

export async function analyzeATSScore(resumeId: string, jobDescription: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await checkUserLimit(user.id, 'ats_scan')
  // Fetch resume
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: resume, error } = await (supabase as any).from('resumes').select('*').eq('id', resumeId).eq('user_id', user.id).single()
  if (error || !resume) throw new Error('Resume not found')

  // Convert resume content to string representation
  const content = resume.content
  const resumeText = `
Name: ${content.personalInfo?.name || ''}
Title: ${content.personalInfo?.title || ''}
Summary: ${content.summary || ''}
Experience: ${content.experience?.map((e: any) => `${e.title} at ${e.company} - ${e.description}`).join('\n') || ''}
Education: ${content.education?.map((e: any) => `${e.degree} at ${e.school}`).join('\n') || ''}
Skills: ${content.skills?.map((s: any) => s.items.join(', ')).join(', ') || ''}
  `.trim()

  const prompt = PROMPTS.analyzeATS(resumeText, jobDescription)
  const responseText = await callAI(prompt, { jsonMode: true })

  const analysis = parseAIJson<any>(responseText)

  // Save to DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: scanData } = await (supabase as any).from('ats_scans').insert({
    user_id: user.id,
    resume_id: resumeId,
    job_description: jobDescription,
    overall_score: analysis.overall_score,
    scores: analysis.scores,
    keywords_found: analysis.keywords_found,
    keywords_missing: analysis.keywords_missing,
    suggestions: analysis.suggestions,
  }).select().single()

  await logActivity(user.id, 'ats_score_analyzed', { resumeId })

  return scanData || analysis
}

export async function analyzeUploadedResume(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const jobDescription = formData.get('jobDescription') as string

  if (!file) throw new Error('No file uploaded')
  if (!jobDescription) throw new Error('No job description provided')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(new Uint8Array(arrayBuffer))
  let extractedText = ''

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      // pdf-parse v2 is a class-based API
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require('pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      await parser.load()
      const textResult = await parser.getText()
      extractedText = textResult.text || textResult.pages?.map((p: any) => p.text).join('\n') || ''
      console.log('[ATS] PDF text extracted successfully. Length:', extractedText.length)
    } catch (e: any) {
      console.error('[ATS] PDF parsing error:', e)
      throw new Error('PDF Error: ' + (e.message || e))
    }
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
      console.log('[ATS] DOCX text extracted successfully. Length:', extractedText.length)
      console.log('[ATS] DOCX text preview (first 500 chars):', extractedText.substring(0, 500))
    } catch (e) {
      console.error('[ATS] DOCX parsing error:', e)
      throw new Error('Failed to parse DOCX. Please try a different DOCX or use PDF.')
    }
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX.')
  }

  if (!extractedText || extractedText.trim().length === 0) {
    console.error('[ATS] No text could be extracted from the uploaded file')
    throw new Error('No text could be extracted from the uploaded file. The file may be image-based or encrypted. Please try a different file.')
  }

  console.log('[ATS] Sending extracted text to AI for analysis. Text length:', extractedText.trim().length)
  const prompt = PROMPTS.analyzeATS(extractedText, jobDescription)
  const responseText = await callAI(prompt, { jsonMode: true })

  let analysis: any = {}
  try {
    analysis = parseAIJson<any>(responseText)
  } catch (err) {
    console.error('[ATS] Failed to parse AI response:', err)
    throw new Error('AI returned an invalid response format. Please try again.')
  }
  
  // Provide defaults for critical array fields
  analysis.keywords_found = analysis.keywords_found || []
  analysis.keywords_missing = analysis.keywords_missing || []
  analysis.suggestions = analysis.suggestions || []
  analysis.scores = analysis.scores || {}
  analysis.overall_score = analysis.overall_score || 0

  // Save to DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: scanData } = await (supabase as any).from('ats_scans').insert({
    user_id: user.id,
    resume_id: null,
    job_description: jobDescription,
    overall_score: analysis.overall_score,
    scores: analysis.scores,
    keywords_found: analysis.keywords_found,
    keywords_missing: analysis.keywords_missing,
    suggestions: analysis.suggestions,
  }).select().single()

  await logActivity(user.id, 'uploaded_resume_analyzed')

  return { ...(scanData || analysis), extractedText }
}

export async function generateCoverLetter(resumeId: string, company: string, jobTitle: string, jobDescription: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await checkUserLimit(user.id, 'cover_letter')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: resume, error } = await (supabase as any).from('resumes').select('*').eq('id', resumeId).eq('user_id', user.id).single()
  if (error || !resume) throw new Error('Resume not found')

  const prompt = PROMPTS.generateCoverLetter(resume.content, company, jobTitle, jobDescription)
  const letter = await callAI(prompt, { temperature: 0.8 })

  // Clean up any markdown blocks if the AI returned them
  const cleanedLetter = letter.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim()

  // Save to DB
  let coverLetterData: any = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('cover_letters').insert({
      user_id: user.id,
      resume_id: resumeId,
      title: `${jobTitle} at ${company}`,
      company_name: company,
      job_title: jobTitle,
      job_description: jobDescription,
      content: cleanedLetter,
    }).select().single()
    
    if (!error && data) {
      coverLetterData = data
      await logActivity(user.id, 'cover_letter_generated', { company, jobTitle })
    }
  } catch (e) {
    console.error('Failed to log cover letter to DB:', e)
  }

  return coverLetterData || { content: cleanedLetter }
}

export async function optimizeSummary(summary: string, jobDescription?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const prompt = PROMPTS.optimizeSummary(summary, jobDescription)
  const improved = await callAI(prompt, { temperature: 0.7 })

  return improved
}

export async function optimizeDescription(description: string, jobTitle: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const prompt = `You are an expert resume writer. Rewrite this job experience description to be more impactful and ATS-friendly.
Target Job Title: ${jobTitle || 'Professional'}
Current Description:
${description}

Rules:
- Keep it concise but powerful
- Use strong action verbs
- Focus on achievements and metrics
- Return ONLY the improved text, no intro, no quotes.`

  const improved = await callAI(prompt, { temperature: 0.7 })
  return improved
}

export async function improveUploadedResume(
  resumeText: string,
  jobDescription: string,
  missingKeywords: string[] = []
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('No resume text provided. Please analyze a resume first.')
  }
  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new Error('No job description provided.')
  }

  console.log('[ATS-IMPROVE] Starting resume improvement. Text length:', resumeText.length)
  console.log('[ATS-IMPROVE] Missing keywords to integrate:', missingKeywords)

  const prompt = PROMPTS.improveResume(resumeText, jobDescription, missingKeywords)
  const responseText = await callAI(prompt, { 
    jsonMode: true, 
    temperature: 0.7,
    maxTokens: 8192 
  })

  let improvedResume: any = {}
  try {
    improvedResume = parseAIJson<any>(responseText)
  } catch (err) {
    console.error('[ATS-IMPROVE] Failed to parse AI response:', err)
    throw new Error('AI returned an invalid improved resume format. Please try again.')
  }
  
  // Provide defaults
  improvedResume.improvements_made = improvedResume.improvements_made || []
  
  console.log('[ATS-IMPROVE] Resume improved successfully. Sections:', Object.keys(improvedResume))

  await logActivity(user.id, 'resume_improved')

  return improvedResume
}
