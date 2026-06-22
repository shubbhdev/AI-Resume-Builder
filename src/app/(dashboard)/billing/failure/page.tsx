import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-up">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
        <XCircle className="w-12 h-12 text-rose-500 relative z-10" />
      </div>
      
      <h1 className="text-4xl font-black text-white mb-4 text-center">Payment Failed</h1>
      <p className="text-slate-400 text-lg text-center max-w-md mb-8">
        We couldn't process your payment. Your account has not been charged. Please try again.
      </p>

      <Link href="/billing">
        <Button variant="outline" className="h-12 px-8 rounded-xl font-bold flex items-center gap-2 border-white/10 hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
          Back to Billing
        </Button>
      </Link>
    </div>
  )
}
