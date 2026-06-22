import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const isPlaceholder = key.includes('placeholder')
  const prefix = key.length > 20 ? key.substring(0, 20) + '...' : key
  
  return NextResponse.json({
    hasKey: !!key,
    prefix,
    isPlaceholder,
    exactName: 'SUPABASE_SERVICE_ROLE_KEY'
  })
}
