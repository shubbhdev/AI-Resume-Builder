import { Database } from './src/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>('http://localhost', 'anon')
const result = supabase.from('job_applications')
