'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

const BENEFITS = [
  'ATS-optimized resume builder',
  'AI-powered resume optimizer',
  'Unlimited ATS score checks',
  'Mock interview coach',
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const password = watch('password', '')

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const map = [
      { label: '', color: '' },
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-amber-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ]
    return { score, ...map[score] }
  }

  const strength = getPasswordStrength(password)

  const onSubmit = async (data: SignupForm) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setEmailSent(true)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-strong rounded-2xl p-8 border border-white/10 card-glow text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Check your inbox!</h2>
          <p className="text-slate-400 text-sm mb-6">
            We&apos;ve sent a verification link to your email. Click it to activate your account and start your 7-day free trial.
          </p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/8 text-left space-y-2 mb-6">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {b}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs">
            Didn&apos;t receive it? Check spam or{' '}
            <button
              onClick={() => setEmailSent(false)}
              className="text-indigo-400 hover:text-indigo-300 transition"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="glass-strong rounded-2xl p-8 border border-white/10 card-glow">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs text-indigo-400 font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            7-Day Free Trial — No Credit Card
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm">Join 10,000+ job seekers using CareerAI</p>
        </div>

        {/* Google OAuth */}
        <button
          id="google-signup-btn"
          onClick={handleGoogleSignup}
          disabled={googleLoading || isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <Separator className="flex-1 bg-white/8" />
          <span className="text-slate-500 text-xs font-medium">or with email</span>
          <Separator className="flex-1 bg-white/8" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-slate-300 text-sm font-medium">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="fullName"
                type="text"
                placeholder="Ravi Sharma"
                autoComplete="name"
                className="pl-10 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 h-11 rounded-xl"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-400 text-xs">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10 pr-10 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 h-11 rounded-xl"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Strength: <span className="text-slate-300">{strength.label}</span>
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10 pr-10 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 h-11 rounded-xl"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-slate-500 text-xs">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-indigo-400 hover:underline">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
          </p>

          {/* Submit */}
          <Button
            id="signup-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-brand h-11 rounded-xl font-semibold text-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</>
            ) : (
              'Start Free 7-Day Trial →'
            )}
          </Button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
