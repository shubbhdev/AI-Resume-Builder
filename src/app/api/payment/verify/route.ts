import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
    console.log('[PAYMENT VERIFY] Received payload:', { razorpay_order_id, razorpay_payment_id })
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('[PAYMENT VERIFY] Missing payment details')
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // 1. Authenticate user to ensure request is from the logged-in user
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabaseUserClient = await createServerClient()
    const { data: { user } } = await supabaseUserClient.auth.getUser()

    if (!user) {
      console.error('[PAYMENT VERIFY] Unauthorized request - No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isProd = process.env.NODE_ENV === 'production'
    const secret = isProd 
      ? (process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET!) 
      : process.env.RAZORPAY_KEY_SECRET!

    const keyId = isProd 
      ? (process.env.RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!) 
      : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!

    console.log(`[PAYMENT VERIFY] Mode: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`)
    console.log(`[PAYMENT VERIFY] Key Type: ${keyId?.startsWith('rzp_test_') ? 'TEST KEYS (No real charges)' : 'LIVE KEYS'}`)

    // 2. Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    // 3. Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Log masked runtime key for user validation
    const maskedKey = supabaseServiceKey && supabaseServiceKey.length > 20 
      ? supabaseServiceKey.substring(0, 20) + '...' 
      : supabaseServiceKey || 'UNDEFINED';

    console.log('[PAYMENT VERIFY] ENV CHECK - SUPABASE_SERVICE_ROLE_KEY (Masked):', maskedKey);
    console.log('[PAYMENT VERIFY] ENV CHECK - Key literally ends in "placeholder.service_role"?', typeof supabaseServiceKey === 'string' && supabaseServiceKey.endsWith('placeholder.service_role'));
    console.log('[PAYMENT VERIFY] ENV CHECK - NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl)
    console.log('[PAYMENT VERIFY] AUTH CHECK - Authenticated user id:', user.id)

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    if (generated_signature !== razorpay_signature) {
      console.error('[PAYMENT VERIFY] Signature mismatch. Expected:', generated_signature, 'Got:', razorpay_signature)
      const { error: failedUpdateError } = await supabaseAdmin
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', razorpay_order_id)
      
      console.log('[PAYMENT VERIFY] Failed Payment DB Update Result:', failedUpdateError || 'Success')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('[PAYMENT VERIFY] Signature verification result: SUCCESS')

    // 4. Update payment to successful
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()

    console.log('[PAYMENT VERIFY] Payment DB Update Error:', paymentError || 'None')
    console.log('[PAYMENT VERIFY] Payment DB Update Data (Rows affected):', paymentData?.length || 0)

    if (paymentError) {
      throw new Error(`Payment DB Update Error: ${paymentError.message}`)
    }

    // 5. Get subscription interval
    const { data: currentSub, error: subFetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('billing_interval')
      .eq('user_id', user.id)
      .single()

    console.log('[PAYMENT VERIFY] Subscription Fetch Error:', subFetchError || 'None')

    const interval = currentSub?.billing_interval || 'monthly'
    const periodDays = interval === 'annual' ? 365 : 30
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString()
    
    // 6. Upsert Subscription
    const { data: subData, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: 'premium',
        status: 'active',
        billing_interval: interval,
        razorpay_order_id,
        razorpay_payment_id,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()

    console.log('[PAYMENT VERIFY] Subscription Upsert Error:', subError || 'None')
    console.log('[PAYMENT VERIFY] Subscription Upsert Data (Rows affected):', subData?.length || 0)

    if (subError) {
      throw new Error(`Subscription DB Update Error: ${subError.message} (Details: ${subError.details}, Hint: ${subError.hint})`)
    }

    console.log(`[PAYMENT VERIFY] Subscription upgraded successfully for user: ${user.id}`)
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[PAYMENT VERIFY] Catch Block Error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
