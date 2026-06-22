// src/components/shared/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullPage?: boolean
}

export function LoadingSpinner({ size = 'md', className, text, fullPage }: LoadingSpinnerProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  if (fullPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full gradient-brand animate-spin" style={{ animationDuration: '0.8s' }} />
          <div className="absolute inset-1 rounded-full bg-[#0A0A0F]" />
          <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-indigo-400" />
        </div>
        {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-indigo-400', sizeMap[size])} />
      {text && <span className="text-slate-400 text-sm">{text}</span>}
    </div>
  )
}
