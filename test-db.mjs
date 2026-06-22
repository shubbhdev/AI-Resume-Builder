import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('='))
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

console.log('1. Loading NEXT_PUBLIC_SUPABASE_URL:', url)
console.log('2. Loading SUPABASE_SERVICE_ROLE_KEY:', key)
console.log('3. Is the key literally ending in "placeholder.service_role"?', key.endsWith('placeholder.service_role'))

console.log('\n4. Attempting to connect to Supabase with this key...')
try {
  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  
  if (error) {
    console.error('\n[EXACT DATABASE ERROR]')
    console.error(JSON.stringify(error, null, 2))
  } else {
    console.log('\n[SUCCESS] Connected to database and fetched profiles.')
  }
} catch (e) {
  console.error('\n[EXACT CODE ERROR]', e.message)
}
