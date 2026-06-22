import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpay } from '@/lib/razorpay/client'
import { PLAN_PRICES } from '@/types/subscription'

export async function POST(req: NextRequest) {
  try {
    const { interval } = await req.json()
    if (interval !== 'monthly' && interval !== 'annual') {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subscription?.plan === 'premium' && subscription?.status === 'active') {
      return NextResponse.json({ error: 'You are already subscribed to Premium' }, { status: 400 })
    }

    const razorpay = getRazorpay()
    const priceData = PLAN_PRICES[interval as keyof typeof PLAN_PRICES]
    
    const options = {
      amount: priceData.paise,
      currency: 'INR',
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        email: user.email,
        interval: interval,
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await razorpay.orders.create(options as any)

    // Insert pending payment record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('payments')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: options.amount,
        currency: 'INR',
        status: 'pending'
      })

    // Update subscription with pending order id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({
        razorpay_order_id: order.id,
        amount_paise: options.amount,
        billing_interval: interval,
      })
      .eq('user_id', user.id)

    const isProd = process.env.NODE_ENV === 'production'
    const keyId = isProd 
      ? (process.env.RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!) 
      : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      user: {
        name: user.user_metadata?.full_name || '',
        email: user.email,
      }
    })
  } catch (error: any) {
    console.error('Failed to create Razorpay order', error)
    return NextResponse.json({ error: error.message || 'Payment service unavailable' }, { status: 500 })
  }
}
