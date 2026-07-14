import Link from "next/link";
import { Sparkles, Mic, ShieldAlert, Mail, ArrowRight, CheckCircle2, ChevronRight, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-150">
      
      {/* Visual Background Glows */}
      <span className="absolute left-[-20%] top-[-10%] w-[60vw] h-[60vw] bg-violet-650/15 rounded-full blur-[120px] pointer-events-none" />
      <span className="absolute right-[-10%] bottom-[-10%] w-[50vw] h-[50vw] bg-indigo-650/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-4 h-4 fill-white/10" />
          </div>
          <span className="font-black text-sm tracking-wide text-white">INBOXPILOT AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center gap-6">
        
        {/* Intro Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-[10px] font-bold tracking-widest uppercase">
          <Mic className="w-3.5 h-3.5" />
          <span>SaaS Voice Mail Assistant</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white max-w-4xl tracking-tight leading-[1.08] select-none">
          Navigate your email inbox using the power of{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Voice and AI
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
          Securely link your Gmail or Outlook account. Ask questions, categorize tasks, highlight deadlines, and dictate replies in English or Hindi.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Managing Inbox with AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login?demo=true"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white rounded-2xl text-sm font-bold transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Try Demo Sandbox</span>
          </Link>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="relative mt-12 md:mt-16 w-full max-w-4xl rounded-3xl border border-white/5 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-md">
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden aspect-[16/10] flex flex-col">
            
            {/* Top Mock Window Bar */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="h-5 w-48 bg-white/5 rounded-md flex items-center justify-center text-[10px] text-slate-500 font-semibold">
                inboxpilot-ai.app/dashboard
              </div>
              <div className="w-12" />
            </div>

            {/* Mock Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Mock Sidebar */}
              <div className="w-1/4 border-r border-white/5 bg-slate-950 p-3 hidden sm:flex flex-col gap-4">
                <div className="h-6 w-16 bg-white/10 rounded-md" />
                <div className="flex flex-col gap-2 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-full bg-white/5 rounded-md" style={{ width: `${80 - i * 8}%` }} />
                  ))}
                </div>
              </div>
              
              {/* Mock Body */}
              <div className="flex-1 p-5 flex flex-col gap-4 bg-slate-900/10">
                <div className="h-8 w-2/3 bg-white/5 rounded-full self-center flex items-center px-4 justify-between">
                  <span className="text-[10px] text-slate-500">Show important emails...</span>
                  <Mic className="w-3.5 h-3.5 text-violet-500" />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 border border-white/5 bg-slate-950/65 rounded-xl p-3 flex flex-col gap-2">
                      <div className="h-3 w-12 bg-white/10 rounded" />
                      <div className="h-3.5 w-full bg-white/5 rounded" />
                      <div className="h-3 w-16 bg-violet-600/20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* Feature Section */}
      <section className="relative z-10 py-16 md:py-24 border-t border-white/5 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-3xl flex flex-col gap-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Voice-driven Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask commands naturally in English or Hindi like &quot;Find invoices from college about tuition fees&quot; and see matching results instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-3xl flex flex-col gap-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Deep AI Insight Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Summarize content, extract actionable items, detect upcoming deadlines, parse currency values, and generate automatic reply drafts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-3xl flex flex-col gap-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Client Integration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrate Gmail and Outlook accounts securely with NextAuth. We save encrypted OAuth tokens to protect user privacy.
            </p>
          </div>

        </div>
      </section>

      {/* Security Note */}
      <section className="relative z-10 py-12 text-center text-xs text-slate-500 border-t border-white/5 bg-slate-950">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-violet-400/80 mb-1" />
          <p className="font-semibold text-slate-400">Strict Data Privacy & OAuth Security</p>
          <p className="leading-relaxed">
            InboxPilot AI decrypts mail access keys only inside memory. We do not store raw mail access credentials. You can revoke access at any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-white/5 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-slate-600">
        <span>© 2026 InboxPilot AI SaaS. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}
