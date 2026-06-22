// src/lib/ai/gemini.ts
// AI provider wrapper exclusively using Google Gemini

/**
 * Call Google Gemini with a prompt and return the text response
 */
export async function callAI(prompt: string, options?: {
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096, jsonMode = false } = options ?? {}

  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is not set')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Check if response was cut off due to token limit
  const finishReason = data.candidates?.[0]?.finishReason
  if (finishReason === 'MAX_TOKENS') {
    console.warn('[Gemini] Response was truncated due to maxOutputTokens limit')
  }

  return text
}

/** Parse JSON from AI response safely, with repair for common AI JSON issues */
export function parseAIJson<T>(text: string): T {
  // Strip markdown code blocks if present
  let cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim()

  // First try: direct parse
  try {
    return JSON.parse(cleaned) as T
  } catch (firstError) {
    console.warn('[parseAIJson] Direct parse failed:', (firstError as Error).message)
    console.warn('[parseAIJson] Response length:', cleaned.length, '| Last 100 chars:', cleaned.slice(-100))
  }

  // Repair pass: fix common Gemini JSON issues
  try {
    let repaired = cleaned

    // Fix trailing commas before } or ]
    repaired = repaired.replace(/,\s*([\]}])/g, '$1')

    return JSON.parse(repaired) as T
  } catch (secondError) {
    console.warn('[parseAIJson] Comma repair failed:', (secondError as Error).message)
  }

  // Truncation fix: if JSON was cut off mid-response, try to close it
  try {
    let fixed = cleaned

    // If we're inside an unterminated string, close it
    // Count unescaped quotes to detect if we're mid-string
    const quoteCount = (fixed.match(/(?<!\\)"/g) || []).length
    if (quoteCount % 2 !== 0) {
      // Odd number of quotes = we're inside a string. Close it.
      fixed += '"'
    }

    // Remove any trailing partial constructs
    fixed = fixed.replace(/,\s*$/, '')  // trailing comma

    // Count open/close braces and brackets
    const openBraces = (fixed.match(/{/g) || []).length
    const closeBraces = (fixed.match(/}/g) || []).length
    const openBrackets = (fixed.match(/\[/g) || []).length
    const closeBrackets = (fixed.match(/]/g) || []).length

    const missingBrackets = openBrackets - closeBrackets
    const missingBraces = openBraces - closeBraces

    if (missingBrackets > 0 || missingBraces > 0) {
      // Remove trailing partial entries after the last complete value
      fixed = fixed.replace(/,\s*"[^"]*"?\s*$/, '')  // partial key
      fixed = fixed.replace(/,\s*$/, '')               // trailing comma again

      // Close brackets first (inner), then braces (outer) — common JSON nesting
      for (let i = 0; i < missingBrackets; i++) fixed += ']'
      for (let i = 0; i < missingBraces; i++) fixed += '}'

      // Fix any double-commas or comma before closing
      fixed = fixed.replace(/,\s*([\]}])/g, '$1')

      console.log('[parseAIJson] Repaired truncated JSON: closed', missingBraces, 'braces +', missingBrackets, 'brackets')
      return JSON.parse(fixed) as T
    }
  } catch (thirdError) {
    console.warn('[parseAIJson] Truncation repair failed:', (thirdError as Error).message)
  }

  // Last resort: extract the largest valid JSON object
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
  } catch {
    // Fall through
  }

  throw new Error(`Failed to parse AI response as JSON. Raw response preview: ${text.substring(0, 200)}...`)
}

