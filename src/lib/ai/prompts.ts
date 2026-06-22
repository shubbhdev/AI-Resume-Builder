// src/lib/ai/prompts.ts
// All AI prompt templates for CareerAI

import type { ResumeContent } from '@/types/resume'

export const PROMPTS = {
  optimizeSummary: (summary: string, jobDescription?: string) => `
You are an expert resume writer with 15+ years of experience. 
Rewrite the following professional summary to be ATS-optimized, compelling, and tailored${jobDescription ? ' to the job description' : ''}.

Rules:
- Keep it 3-4 sentences max
- Use strong action verbs
- Include quantified achievements where possible  
- Match keywords from the job description
- Be specific, not generic
- Write in first person without using "I"

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}
Current Summary:
${summary}

Return ONLY the improved summary text, nothing else.
`,

  optimizeExperience: (bullets: string[], jobTitle: string, jobDescription?: string) => `
You are an expert resume writer. Rewrite these job experience bullets to be more impactful and ATS-friendly.

Rules:
- Start each bullet with a strong action verb (Led, Built, Increased, Reduced, etc.)
- Include specific metrics and numbers where possible
- Show impact, not just tasks
- Keep each bullet under 2 lines
- Maximum 5-6 bullets
${jobDescription ? '- Match keywords from the provided job description' : ''}

Job Title: ${jobTitle}
${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ''}

Current bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return ONLY a JSON array of improved bullet strings, nothing else.
Example: ["Led development of...", "Increased performance by..."]
`,

  generateCoverLetter: (resume: Partial<ResumeContent>, company: string, jobTitle: string, jobDescription: string) => `
You are an expert career coach. Write a compelling, personalized cover letter.

Rules:
- 3-4 paragraphs, professional but personable
- Opening: hook with enthusiasm and fit
- Middle: 2 specific achievements from the resume that match the job
- Closing: call to action
- Avoid generic phrases like "I am a hard worker"
- Match the tone to the company
- Keep it under 350 words

Candidate Info:
Name: ${resume.personalInfo?.name}
Title: ${resume.personalInfo?.title}
Summary: ${resume.summary}
Top Skills: ${resume.skills?.flatMap(s => s.items).slice(0, 10).join(', ')}

Target:
Company: ${company}
Role: ${jobTitle}
Job Description: ${jobDescription}

Return ONLY the cover letter text, formatted with paragraph breaks. DO NOT include any conversational filler, markdown formatting (like \`\`\`markdown), or introductory text. Just the letter itself.
`,

  generateInterviewQuestion: (type: string, previousQuestions: string[] = []) => `
You are an expert technical interviewer. Generate ONE interview question.

Interview Type: ${type}
${previousQuestions.length > 0 ? `Already asked (don't repeat):\n${previousQuestions.join('\n')}` : ''}

Return a JSON object with:
{
  "question": "The interview question",
  "type": "${type}",
  "difficulty": "easy|medium|hard",
  "hint": "A subtle hint if the user is stuck",
  "idealAnswerPoints": ["Key point 1", "Key point 2", "Key point 3"]
}
`,

  scoreInterviewAnswer: (question: string, answer: string, idealPoints: string[]) => `
You are an expert interviewer evaluating a candidate's response.

Question: ${question}
Candidate's Answer: ${answer}
Ideal Answer Points: ${idealPoints.join(', ')}

Evaluate and return JSON:
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentence specific feedback>",
  "strengths": ["<what they did well>"],
  "improvements": ["<what to improve>"]
}
`,

  analyzeATS: (resumeText: string, jobDescription?: string) => `
You are an ATS (Applicant Tracking System) expert. Analyze this resume.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}
Resume Content:
${resumeText}

Return a JSON analysis:
{
  "overall_score": <0-100>,
  "scores": {
    "formatting": <0-100>,
    "keywords": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>
  },
  "keywords_found": ["keyword1", "keyword2"],
  "keywords_missing": ["keyword1", "keyword2"],
  "suggestions": [
    { "priority": "high|medium|low", "category": "keywords|formatting|content|experience", "suggestion": "Specific actionable suggestion" }
  ]
}
`,

  improveResume: (resumeText: string, jobDescription: string, missingKeywords: string[] = []) => `
You are a world-class resume writer and ATS optimization expert. Your task is to completely REWRITE and OPTIMIZE the resume below so it scores 90%+ on any ATS system for the target job.

IMPORTANT: Use the ACTUAL content from the original resume. Do NOT invent experiences, companies, degrees, or qualifications. You must ONLY rewrite, reorganize, and optimize what already exists.

Target Job Description:
${jobDescription}

${missingKeywords.length > 0 ? `Missing Keywords to Integrate:\n${missingKeywords.join(', ')}\n` : ''}

Original Resume Content:
${resumeText}

REWRITE RULES:
1. SUMMARY: Write a powerful 3-4 sentence professional summary that naturally incorporates missing keywords and highlights relevant experience for the target role.
2. EXPERIENCE: Rewrite each job entry with strong action verbs, quantified achievements, and ATS-friendly keywords. Keep real company names, titles, and dates.
3. SKILLS: Reorganize and expand the skills section to include all relevant technical and soft skills mentioned in the job description that the candidate actually possesses.
4. PROJECTS: If projects exist, rewrite descriptions to emphasize relevant technologies and impact. If no projects section exists, set projects to an empty array.
5. EDUCATION: Keep education entries intact but optimize formatting.

Return a JSON object with the following structure EXACTLY:
{
  "contact_info": {
    "name": "Full Name from resume",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country",
    "linkedin": "linkedin URL or username",
    "github": "github URL or username"
  },
  "summary": "Optimized professional summary (4-5 impactful sentences)",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": ["Detailed achievement bullet 1", "Detailed achievement bullet 2", "Detailed achievement bullet 3", "Detailed achievement bullet 4", "Detailed achievement bullet 5"]
    }
  ],
  "skills": [
    {
      "category": "Category Name",
      "items": ["Skill1", "Skill2", "Skill3"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Detailed ATS-optimized project description with impact and technologies used",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "Year or Duration"
    }
  ],
  "improvements_made": ["Brief description of improvement 1", "Brief description of improvement 2"]
}

CRITICAL RULES:
- ONLY return valid JSON. Do NOT include markdown blocks like \`\`\`json.
- The resume must FILL an entire single page (US Letter 8.5x11 inches). Do NOT make it too short:
- Summary: 4-5 rich sentences that showcase expertise
- Experience: 5-6 detailed bullets per job — each bullet should be a full descriptive sentence with metrics
- Projects: 2-3 sentence descriptions highlighting impact, challenges solved, and technologies
- Skills: 4-5 categories with comprehensive skill listings
- Make every section detailed and descriptive — use the full page.
`,
}
