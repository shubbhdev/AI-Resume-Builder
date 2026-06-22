// src/app/(auth)/layout.tsx
// Centered auth layout — no sidebar, full-page gradient background
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CareerAI — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top nav bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-bold text-lg gradient-brand-text">CareerAI</span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-slate-600 text-xs">
        © 2025 CareerAI · 
        <Link href="/privacy" className="hover:text-slate-400 transition ml-1">Privacy</Link> · 
        <Link href="/terms" className="hover:text-slate-400 transition ml-1">Terms</Link>
      </footer>
    </div>
  )
}
