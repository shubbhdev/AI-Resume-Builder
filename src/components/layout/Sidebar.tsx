'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Target,
  Sparkles,
  Mail,
  Mic,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Star,
  Clock,
  Zap,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useSubscription } from '@/hooks/useSubscription'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/resume',       label: 'Resume Builder',  icon: FileText },
  { href: '/ats',          label: 'ATS Analyzer',    icon: Target },
  { href: '/cover-letter', label: 'Cover Letters',   icon: Mail },
  { href: '/jobs',         label: 'Job Tracker',     icon: Briefcase },
]

const BOTTOM_ITEMS = [
  { href: '/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  onMobileClose?: () => void
}

export function Sidebar({ collapsed = false, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { plan, isPremium, isTrialActive, trialDaysRemaining } = useSubscription()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'CA'

  const PlanBadge = () => {
    if (isTrialActive) {
      return (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">
            {collapsed ? `${trialDaysRemaining}d` : `Trial · ${trialDaysRemaining}d left`}
          </span>
        </div>
      )
    }
    if (isPremium) {
      return (
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-indigo-400" />
          {!collapsed && <span className="text-indigo-400 text-xs font-medium">Premium</span>}
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
        <Zap className="w-3 h-3 text-slate-400" />
        {!collapsed && <span className="text-slate-400 text-xs font-medium">Free</span>}
      </div>
    )
  }

  const handleNavClick = () => {
    // Close mobile menu on navigation
    if (onMobileClose) onMobileClose()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-white/6 bg-[#0D0D14] transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/6">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-base gradient-brand-text">CareerAI</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto" onClick={handleNavClick}>
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
          </Link>
        )}
        
        {/* Close button on mobile */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-slate-200 transition ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Collapse toggle on desktop */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="hidden md:block text-slate-500 hover:text-slate-300 transition ml-auto"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item: any) => {
          const { href, label, icon: Icon, premium } = item
          const active = isActive(href)
          const locked = premium && !isPremium

          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
                active
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-[3px] border-indigo-500 pl-[9px]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn('shrink-0 w-4 h-4', active && 'text-indigo-400')} />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {locked && (
                    <Star className="ml-auto w-3 h-3 text-amber-400/60" />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-2 space-y-0.5 border-t border-white/6 pt-2">
        {/* Upgrade CTA — only for free/trial expiring */}
        {!isPremium && !collapsed && (
          <Link
            href="/billing"
            onClick={handleNavClick}
            className="flex items-center gap-2 mx-1 mb-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition group"
          >
            <Star className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="text-left">
              <p className="text-indigo-300 text-xs font-semibold">Upgrade to Premium</p>
              <p className="text-indigo-400/60 text-[10px]">₹499/month</p>
            </div>
          </Link>
        )}

        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={handleNavClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* User info */}
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl bg-white/3 border border-white/6',
            collapsed && 'justify-center px-2'
          )}
        >
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="gradient-brand text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-xs font-medium truncate">
                  {user?.user_metadata?.full_name ?? user?.email?.split('@')[0]}
                </p>
                <PlanBadge />
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-slate-300 transition shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
