'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, Menu } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useSubscription } from '@/hooks/useSubscription'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Clock, Star } from 'lucide-react'

// Map route paths to page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/resume':       'Resume Builder',
  '/ats':          'ATS Analyzer',
  '/optimizer':    'AI Optimizer',
  '/cover-letter': 'Cover Letters',
  '/interview':    'Interview Coach',
  '/jobs':         'Job Tracker',
  '/billing':      'Billing & Plans',
  '/settings':     'Settings',
}

interface TopbarProps {
  onMobileMenuToggle?: () => void
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const { isTrialActive, trialDaysRemaining, isPremium } = useSubscription()

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'CareerAI'

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'CA'

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/6 bg-[#0D0D14]/80 backdrop-blur-sm shrink-0">
      {/* Left — hamburger + Page title */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-slate-100 font-semibold text-base">{title}</h1>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Trial banner */}
        {isTrialActive && (
          <Link
            href="/billing"
            className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-xs text-amber-400 font-medium hover:bg-amber-500/15 transition"
          >
            <Clock className="w-3 h-3" />
            {trialDaysRemaining} days left in trial
          </Link>
        )}

        {/* Upgrade pill — free users */}
        {!isPremium && !isTrialActive && (
          <Link
            href="/billing"
            className="hidden sm:flex items-center gap-1.5 gradient-brand rounded-full px-3 py-1 text-xs text-white font-semibold hover:opacity-90 transition glow-brand"
          >
            <Star className="w-3 h-3" />
            Upgrade
          </Link>
        )}

        {/* Notifications (placeholder) */}
        <button className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <Link href="/settings">
          <Avatar className="w-7 h-7 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/40 transition">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="gradient-brand text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
