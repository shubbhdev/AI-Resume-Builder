'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { FileText, Target, PenTool, Briefcase, Plus, Sparkles, ChevronRight, FileCheck2, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { ActivityItem } from './page'
import { formatDistanceToNow } from 'date-fns'

interface DashboardClientProps {
  resumeCount: number
  coverLetterCount: number
  bestAtsScore: string
  recentActivity: ActivityItem[]
  hasScannedATS: boolean
  isPremium: boolean
}

export function DashboardClient({ resumeCount, coverLetterCount, bestAtsScore, recentActivity, hasScannedATS, isPremium }: DashboardClientProps) {
  const router = useRouter()
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // 3D parallax scroll effects
  const yStats = useTransform(scrollYProgress, [0, 1], [0, -50])
  const yActions = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  const stats = [
    { label: 'Resumes', value: resumeCount.toString(), icon: FileText, color: 'indigo' },
    { label: 'Best ATS Score', value: bestAtsScore, icon: Target, color: 'emerald' },
    { label: 'Cover Letters', value: coverLetterCount.toString(), icon: PenTool, color: 'violet' },
    { label: 'Jobs Tracked', value: '0', icon: Briefcase, color: 'cyan' },
  ]

  const actions = [
    { href: '/resume', label: 'Build Resume', icon: FilePlus, desc: 'Start from scratch', color: 'indigo' },
    { href: '/ats', label: 'Check ATS Score', icon: Target, desc: 'Analyze your resume', color: 'emerald' },
    { href: '/cover-letter', label: 'Cover Letter', icon: PenTool, desc: 'AI-generated in 30s', color: 'violet' },
    { href: '/interview', label: 'Practice Interview', icon: Sparkles, desc: 'AI mock questions', color: 'pink' },
  ]

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-20 perspective-1000">
      <motion.div 
        style={{ opacity, scale }}
        className="flex items-center justify-between"
      >
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl rounded-full"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
           <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 relative z-10">
              Welcome back 👋
            </h1>
            {isPremium && (
              <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                PREMIUM
              </span>
            )}
          </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm md:text-base mt-2 font-medium"
          >
            Here's your career progress at a glance. Let's make today count.
          </motion.p>
        </div>
      </motion.div>

      {/* Stats row with 3D hover effects */}
      <motion.div 
        style={{ y: yStats }}
        className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.4 }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: 5, 
              rotateX: -5,
              z: 50,
              transition: { duration: 0.2 } 
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className={`relative p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden group cursor-pointer`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-400`} />
              </div>
              <p className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div style={{ y: yActions }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6"
        >
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Quick Actions
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push(action.href)}
              className="relative p-4 md:p-6 rounded-2xl bg-[#0D0D14] border border-white/5 hover:border-indigo-500/30 transition-colors group cursor-pointer overflow-hidden"
            >
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${action.color}-500/10 blur-3xl group-hover:bg-${action.color}-500/20 transition-colors duration-500 rounded-full`} />
              <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/10 flex items-center justify-center mb-4`}>
                <action.icon className={`w-5 h-5 text-${action.color}-400`} />
              </div>
              <h4 className="text-white font-semibold mb-1 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                {action.label}
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 translate-x-2 group-hover:translate-x-0" />
              </h4>
              <p className="text-sm text-slate-500">{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Onboarding Checklist */}
      {(resumeCount === 0 || !hasScannedATS || coverLetterCount === 0) && (
        <motion.div style={{ y: yActions }} className="mt-8 p-6 rounded-2xl bg-[#0D0D14] border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
          <h3 className="text-xl font-bold text-white mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className={`p-4 rounded-xl border ${resumeCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${resumeCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {resumeCount > 0 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">1</span>}
                </div>
                <p className={`font-semibold ${resumeCount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>Create Resume</p>
              </div>
              <p className="text-sm text-slate-500 ml-11">Build your first tailored resume.</p>
            </div>
            
            <div className={`p-4 rounded-xl border ${hasScannedATS ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasScannedATS ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {hasScannedATS ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">2</span>}
                </div>
                <p className={`font-semibold ${hasScannedATS ? 'text-emerald-400' : 'text-slate-200'}`}>Analyze ATS</p>
              </div>
              <p className="text-sm text-slate-500 ml-11">Scan resume against a job description.</p>
            </div>

            <div className={`p-4 rounded-xl border ${coverLetterCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${coverLetterCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {coverLetterCount > 0 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">3</span>}
                </div>
                <p className={`font-semibold ${coverLetterCount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>Generate Cover Letter</p>
              </div>
              <p className="text-sm text-slate-500 ml-11">Use AI to write a perfect cover letter.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div style={{ y: yActions }} className="mt-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'resume' ? 'bg-indigo-500/10 text-indigo-400' :
                  activity.type === 'cover_letter' ? 'bg-violet-500/10 text-violet-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {activity.type === 'resume' ? <FileText className="w-5 h-5" /> :
                   activity.type === 'cover_letter' ? <PenTool className="w-5 h-5" /> :
                   <Target className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Getting Started CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.01 }}
        className="relative rounded-3xl overflow-hidden mt-12 p-[1px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-xl animate-pulse" />
        <div className="relative bg-[#0A0A0F] rounded-3xl p-8 md:p-14 text-center overflow-hidden flex flex-col items-center justify-center z-10 min-h-[300px] md:h-[400px]">
          
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotateZ: [0, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20"
          >
            <FileCheck2 className="w-12 h-12 text-white" />
          </motion.div>

          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 z-10">Start building your future</h3>
          <p className="text-slate-400 text-lg max-w-lg mx-auto mb-8 z-10">
            Create an ATS-optimized, beautifully designed resume in minutes. Stand out from the crowd and land your dream job.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/resume')}
            className="group relative px-8 py-4 bg-white text-indigo-950 font-bold rounded-xl overflow-hidden shadow-xl z-10 flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Resume Now
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

        </div>
      </motion.div>
    </div>
  )
}

function FilePlus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}
