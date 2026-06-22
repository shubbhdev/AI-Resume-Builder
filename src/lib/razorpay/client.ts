// src/lib/razorpay/client.ts
// Server-side Razorpay instance — only use in API routes

import Razorpay from 'razorpay'

let razorpayInstance: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const isProd = process.env.NODE_ENV === 'production'
    const key_id = isProd 
      ? (process.env.RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!) 
      : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
    const key_secret = isProd 
      ? (process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET!) 
      : process.env.RAZORPAY_KEY_SECRET!

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    })
  }
  return razorpayInstance
}

/** Verify Razorpay webhook signature */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}
