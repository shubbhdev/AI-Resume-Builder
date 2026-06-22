import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('='))
)

const key = env.GOOGLE_AI_API_KEY

async function testGemini() {
  console.log('Testing Gemini API key:', key.substring(0, 10) + '...')
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, reply with exactly one word: test" }] }]
      })
    })
    
    if (!res.ok) {
      const errorBody = await res.text()
      console.log('HTTP Status:', res.status)
      console.log('Error Body:', errorBody)
    } else {
      const data = await res.json()
      console.log('Success:', data.candidates?.[0]?.content?.parts?.[0]?.text)
    }
  } catch (e) {
    console.error('Fetch Error:', e.message)
  }
}

testGemini()
