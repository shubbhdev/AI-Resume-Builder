import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-up">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
      </div>
      
      <h1 className="text-4xl font-black text-white mb-4 text-center">Payment Successful!</h1>
      <p className="text-slate-400 text-lg text-center max-w-md mb-8">
        Your account has been upgraded to Premium. You now have unlimited access to all features.
      </p>

      <Link href="/dashboard">
        <Button className="btn-brand h-12 px-8 rounded-xl font-bold flex items-center gap-2">
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  )
}
