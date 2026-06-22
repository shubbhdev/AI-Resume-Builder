// src/components/shared/UpgradeModal.tsx
'use client'

import Link from 'next/link'
import { Sparkles, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature?: string
}

const PREMIUM_FEATURES = [
  'Unlimited resumes & all templates',
  'Unlimited ATS score checks',
  'AI Resume Optimizer',
  'Unlimited cover letters',
  'Full interview coach with AI scoring',
  'Unlimited job tracking',
]

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111118] border border-white/10 rounded-2xl max-w-md p-0 overflow-hidden">
        {/* Gradient header */}
        <div className="gradient-brand p-6 text-center relative">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-1">
            {feature
              ? `Unlock ${feature} and all premium features`
              : 'Unlock the full power of CareerAI'}
          </p>
        </div>

        <div className="p-6">
          {/* Features */}
          <div className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-4 mb-4 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-slate-100">₹499</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">or ₹3,999/year — save 33%</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link href="/billing" onClick={onClose}>
              <Button className="w-full btn-brand h-11 rounded-xl font-semibold">
                View Plans & Upgrade
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 text-sm transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
