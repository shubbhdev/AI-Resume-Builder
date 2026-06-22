'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Star, Zap, Clock, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'

export default function BillingPage() {
  const router = useRouter()
  const { plan, isPremium, isTrialActive, trialDaysRemaining } = useSubscription()
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    import('@/app/actions/billing').then(m => {
      m.getBillingHistory().then(setHistory)
    })
  }, [])

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval })
      })
      const orderData = await orderRes.json()
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Payment initialization failed')
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CareerAI Premium',
        description: `Upgrade to ${interval} plan`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name,
          email: orderData.user?.email,
        },
        theme: {
          color: '#6366F1',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })
            
            if (verifyRes.ok) {
              router.push('/billing/success')
            } else {
              router.push('/billing/failure')
            }
          } catch (e) {
            router.push('/billing/failure')
          }
        },
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        router.push('/billing/failure')
      })
      rzp.open()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-up">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-100 mb-3">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Choose the right plan for your career growth. Upgrade anytime.
        </p>

        {isPremium && plan === 'premium' && (
          <div className="mt-6 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full font-medium">
            <Star className="w-4 h-4" />
            You are on the Premium Plan
          </div>
        )}
        {isTrialActive && (
          <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full font-medium">
            <Clock className="w-4 h-4" />
            Your free trial ends in {trialDaysRemaining} days
          </div>
        )}

        {!isPremium && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${interval === 'monthly' ? 'text-slate-200' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setInterval(i => i === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-indigo-500 transition-all ${interval === 'annual' ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${interval === 'annual' ? 'text-slate-200' : 'text-slate-500'}`}>
              Annual
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Save 33%</span>
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="card-surface p-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-200">Basic</h3>
          </div>
          <p className="text-slate-500 text-sm mb-6">Perfect for getting started</p>
          <div className="mb-8">
            <span className="text-4xl font-bold text-slate-100">₹0</span>
            <span className="text-slate-500">/forever</span>
          </div>
          
          <Button disabled variant="outline" className="w-full bg-white/5 border-white/10 text-slate-400 mb-8 h-12 rounded-xl">
            {plan === 'free' ? 'Current Plan' : 'Free Tier'}
          </Button>

          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-300">What's included:</p>
            {[
              '1 Resume',
              '2 basic templates',
              '3 ATS score checks per month',
              '3 Cover letters per month',
              '10 Mock interview questions',
            ].map(f => (
              <div key={f} className="flex items-start gap-3 text-sm text-slate-400">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="card-surface p-8 relative border-indigo-500/30 card-glow">
          <div className="absolute top-0 inset-x-0 h-1 gradient-brand" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-slate-200">Premium</h3>
            </div>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-6">Everything you need to land the job</p>
          <div className="mb-8 flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-100">
              {interval === 'monthly' ? '₹499' : '₹333'}
            </span>
            <span className="text-slate-500 mb-1">/month</span>
          </div>
          {interval === 'annual' && !isPremium && (
            <p className="text-emerald-400 text-sm mb-4 -mt-6">Billed ₹3,999 yearly</p>
          )}

          <Button 
            onClick={handleUpgrade}
            disabled={isLoading || (isPremium && plan === 'premium')}
            className="w-full btn-brand mb-8 h-12 rounded-xl font-semibold text-[15px]"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> 
             : (isPremium && plan === 'premium') ? 'Active Plan' 
             : 'Upgrade Now'}
          </Button>

          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-300">Everything in Basic, plus:</p>
            {[
              'Unlimited Resumes & Templates',
              'Unlimited ATS Score Checks',
              'AI Resume Optimizer (Line-by-line)',
              'Unlimited Cover Letters',
              'Unlimited Mock Interviews with AI Scoring',
              'Priority Support'
            ].map(f => (
              <div key={f} className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="mt-12 max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          Billing History
        </h2>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No previous transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item) => (
                    <tr key={item.id} className="text-slate-400 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">{format(new Date(item.created_at), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {item.currency === 'INR' ? '₹' : '$'}{(item.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          item.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500">{item.id.split('-')[0]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
