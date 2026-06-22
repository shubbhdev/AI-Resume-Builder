import Link from 'next/link'
import { ArrowRight, FileText, Target, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Background 3D Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight">CareerAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Sign In</Link>
          <Link href="/signup" className="text-sm font-semibold bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full transition border border-white/5">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-up">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next Generation AI Resume Builder</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Land your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">dream job</span> <br className="hidden md:block"/> in record time.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Build ATS-optimized resumes, generate tailored cover letters, and track applications with the power of artificial intelligence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95">
            Start Building Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
            Sign In
          </Link>
        </div>

        {/* 3D Floating Dashboard Preview */}
        <div className="mt-24 relative w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl -z-10" />
          <div className="relative rounded-2xl border border-white/10 bg-[#111118]/80 backdrop-blur-xl shadow-2xl overflow-hidden transform perspective-[2000px] rotate-x-[5deg] hover:rotate-x-0 transition-transform duration-700 ease-out">
            {/* Fake Browser Top */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            {/* Fake Dashboard Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
              <div className="col-span-2 space-y-4">
                <div className="h-8 w-1/3 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex flex-col items-center justify-center">
                   <Target className="w-8 h-8 text-indigo-400 mb-2" />
                   <div className="h-4 w-1/2 bg-indigo-500/30 rounded" />
                </div>
                <div className="h-48 bg-white/5 rounded-xl border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to get hired</h2>
          <p className="text-slate-400">Stop sending resumes into the void. Use AI to stand out.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: 'Smart Resume Builder', desc: 'Create perfect resumes with AI-generated bullet points and professional summaries.' },
            { icon: Target, title: 'ATS Compatibility Check', desc: 'Upload your resume and instantly see how well it matches any job description.' },
            { icon: Sparkles, title: 'Tailored Cover Letters', desc: 'Generate highly personalized cover letters instantly for each application.' },
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-900/20 pt-24 pb-12 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to upgrade your career?</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of job seekers landing interviews at top tech companies using CareerAI.</p>
        <Link href="/signup" className="inline-flex bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105">
          Get Started For Free
        </Link>
      </section>
      
    </main>
  )
}
