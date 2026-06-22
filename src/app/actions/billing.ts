'use server'

import { createClient } from '@/lib/supabase/server'
import { getRazorpay } from '@/lib/razorpay/client'
import { PLAN_PRICES } from '@/types/subscription'

export async function createCheckoutOrder(interval: 'monthly' | 'annual' = 'monthly') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // 1. Check if user already has an active premium subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (subscription?.plan === 'premium' && subscription?.status === 'active') {
    throw new Error('You are already subscribed to Premium')
  }

  // 2. Initialize Razorpay instance
  const razorpay = getRazorpay()

  // 3. Create a Razorpay Order
  const priceData = PLAN_PRICES[interval]
  const options = {
    amount: priceData.paise, // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      userId: user.id,
      email: user.email,
      interval: interval,
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await razorpay.orders.create(options as any)
    
    // 4. Update the subscription row to record the pending order
    // Using explicit typing bypass for strict Next.js compiler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({
        razorpay_order_id: order.id,
        amount_paise: options.amount,
        billing_interval: interval,
      })
      .eq('user_id', user.id)

    // Return order details to client to initialize Razorpay checkout
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      user: {
        name: user.user_metadata?.full_name,
        email: user.email,
      }
    }
  } catch (error) {
    console.error('Failed to create Razorpay order', error)
    throw new Error('Payment service unavailable. Please try again later.')
  }
}

export async function getBillingHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payments } = await (supabase as any)
    .from('payments')
    .select('id, amount, status, created_at, currency')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return payments || []
}
