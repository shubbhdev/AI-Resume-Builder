'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data: ForgotForm) => {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setSentEmail(data.email)
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-strong rounded-2xl p-8 border border-white/10 card-glow text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm mb-2">
            We&apos;ve sent a password reset link to:
          </p>
          <p className="text-indigo-400 font-medium text-sm mb-6">{sentEmail}</p>
          <p className="text-slate-500 text-xs mb-6">
            Click the link in the email to reset your password. The link expires in 1 hour.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full btn-brand rounded-xl h-11 font-semibold">
                Back to Sign In
              </Button>
            </Link>
            <button
              onClick={() => setEmailSent(false)}
              className="text-slate-500 hover:text-slate-300 text-sm transition"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="glass-strong rounded-2xl p-8 border border-white/10 card-glow">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Forgot password?</h1>
          <p className="text-slate-400 text-sm">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-10 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 h-11 rounded-xl"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <Button
            id="forgot-password-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-brand h-11 rounded-xl font-semibold text-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm mt-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
