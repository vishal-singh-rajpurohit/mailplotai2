import React from "react";
import { Scale, HelpCircle, FileText, Lock, Globe } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions - InboxPilot AI",
  description: "Terms and conditions for using InboxPilot AI, the voice-based AI email assistant.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col gap-10">
      
      {/* Page Title & Intro */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          Terms and{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Conditions
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Last Updated: July 23, 2026. Please read these terms carefully before using InboxPilot AI.
        </p>
      </div>

      {/* Grid Layout for Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <Scale className="w-5 h-5 text-violet-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Governing Rules</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By signing in via Google or Microsoft, you agree to comply with our usage policies and governing laws.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Secure Consent</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            We access your inbox only after explicit OAuth authentication. You hold control over authorization.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Global Access</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Use InboxPilot AI from anywhere globally. Ensure local laws regarding automated email parsing are followed.
          </p>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 sm:p-10 flex flex-col gap-8 shadow-xl backdrop-blur-sm">
        
        {/* Section 1 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            01
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Acceptance of Terms</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              By accessing and using InboxPilot AI (the &quot;Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, you must immediately cease using the Service.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            02
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">OAuth Authentication & Mailbox Integration</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              To provide voice-based searching, categorization, and drafting features, the Service requires secure connection to your third-party email providers (such as Gmail or Outlook). 
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 mt-1">
              <li>You authorize us to request temporary access tokens via OAuth standard flows.</li>
              <li>Tokens are encrypted and used inside secure execution environments solely to fulfill your direct commands.</li>
              <li>You can revoke access tokens anytime via your Google or Microsoft Account Settings dashboard.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            03
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Intellectual Property Rights</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              All proprietary technology, voice parsing models, interface layouts, branding elements, and software code constituting InboxPilot AI remain the exclusive intellectual property of the operators. You are granted a limited, non-exclusive, non-transferable license to access the interface for personal or professional email management.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            04
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Prohibited Activities</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              You agree not to engage in any activity that disrupts or harms the Service, including but not limited to: reverse-engineering the AI models, generating spam emails, automating voice command traffic excessively, or bypassing rate limits.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            05
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Disclaimer of Warranties</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, express or implied, regarding the accuracy of AI summaries, voice translation transcriptions, categorization correctness, or uninterrupted availability.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            06
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Modifications to the Service</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any feature or portion of the Service at any time without notice. We will post any terms updates on this page.
            </p>
          </div>
        </div>

      </div>

      {/* Support Panel */}
      <div className="border border-white/5 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white">Have questions about our Terms?</h4>
            <p className="text-[11px] text-slate-400">Our legal and technical teams are ready to help clarify.</p>
          </div>
        </div>
        <a 
          href="mailto:support@inboxpilot.ai" 
          className="text-xs font-bold px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl hover:text-white transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Contact Legal</span>
        </a>
      </div>

    </div>
  );
}
