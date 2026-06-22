import { createClient } from './src/lib/supabase/server'
async function run() {
  const supabase = await createClient()
  supabase.from('job_applications')
}
