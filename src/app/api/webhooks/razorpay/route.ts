// src/app/api/webhooks/razorpay/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay/client'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    const supabase = createAdminClient()

    if (event === 'order.paid' || event === 'payment.captured') {
      const payment = payload.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id
      const notes = payment.notes || {}
      
      const userId = notes.userId
      if (!userId) {
        console.error('Webhook payload missing userId in notes', payment)
        return NextResponse.json({ ok: true }) // Ack anyway to stop retries
      }

      // Upgrade subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('subscriptions')
        .update({
          plan: 'premium',
          status: 'active',
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
          // Extend current_period_end by interval, simplified for now to +1 month/year
          current_period_end: new Date(Date.now() + (notes.interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to update subscription on webhook:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
