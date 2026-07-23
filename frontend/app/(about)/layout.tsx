import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-150">
      {/* Visual Background Glows */}
      <span className="absolute left-[-20%] top-[-10%] w-[60vw] h-[60vw] bg-violet-650/15 rounded-full blur-[120px] pointer-events-none" />
      <span className="absolute right-[-10%] bottom-[-10%] w-[50vw] h-[50vw] bg-indigo-650/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-4 h-4 fill-white/10" />
          </div>
          <span className="font-black text-sm tracking-wide text-white">INBOXPILOT AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-white/5 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-slate-600">
        <span>© 2026 InboxPilot AI SaaS. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-and-condition" className="hover:text-slate-400 transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
