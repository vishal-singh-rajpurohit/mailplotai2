import { EyeOff, Trash2, Lock, HelpCircle, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - InboxPilot AI",
  description: "Privacy Policy describing how InboxPilot AI manages and secures user mailbox and voice data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-10">
      
      {/* Page Title & Intro */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          Privacy{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Policy
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Last Updated: July 23, 2026. Your privacy and mailbox security are our highest priorities.
        </p>
      </div>

      {/* Grid Layout for Quick Security Bulletins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <EyeOff className="w-5 h-5 text-violet-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zero Data Selling</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            We never sell, rent, or trade your personal email content, metadata, or search histories to third parties.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Memory Decryption</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Mail access credentials are decrypted strictly in volatile server memory during request dispatch and discarded.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5">
          <Trash2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Instant Revocation</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Disconnect your mailbox anytime. We wipe active tokens and cached dashboard profiles from our systems instantly.
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
            <h2 className="text-base font-bold text-white">Information We Collect</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              To operate as a voice-driven email assistant, we gather specific information through secure standard APIs:
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 mt-1">
              <li><strong className="text-white">Account Details:</strong> Basic profile info (name, email address, profile picture) retrieved from your chosen OAuth provider.</li>
              <li><strong className="text-white">Mailbox Access:</strong> Temporary OAuth tokens allowing read, categorize, and draft actions on your emails.</li>
              <li><strong className="text-white">Voice Input & Audio Data:</strong> Audio clips recorded via your browser mic, processed in real-time to transcribe search queries and command drafts.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            02
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">How We Use Your Data</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              Your information is exclusively used to enable the voice-based AI assistant features:
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 mt-1">
              <li>To present dynamic inbox views on your Dashboard UI.</li>
              <li>To execute AI-driven categorization, summary generation, and response drafting.</li>
              <li>To convert your English and Hindi voice inputs into text queries.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            03
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Secure Data Handling & Storage</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              We employ strict, modern security safeguards to prevent unauthorized access or disclosure:
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 mt-1">
              <li>OAuth credentials and tokens are stored with AES-256 encryption.</li>
              <li>We do not write your full email body contents to databases; they are fetched dynamically from providers on request.</li>
              <li>Connection streams use TLS 1.3 encryption transit safeguards.</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            04
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Third-Party Subprocessors</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              We coordinate with leading infrastructure partners (such as OpenAI, Google Cloud, and Microsoft Azure) to execute machine learning summary processing and speech-to-text translation. Subprocessors are strictly prohibited from using your data to train their commercial models or storing it beyond temporary transit needs.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="flex gap-4">
          <span className="text-sm font-black text-violet-500/80 bg-violet-500/5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            05
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">Your Control & Deletion Rights</h2>
            <p className="text-xs text-slate-355 leading-relaxed">
              You retain total control of your data. You may disconnect your email inbox or delete your assistant account entirely at any point. Upon confirmation, all cached profiles, access tokens, and sandbox configurations are permanently erased from our system resources.
            </p>
          </div>
        </div>

      </div>

      {/* Support Panel */}
      <div className="border border-white/5 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white">Have questions about our Privacy Policy?</h4>
            <p className="text-[11px] text-slate-400">Our privacy and security compliance officers are ready to answer.</p>
          </div>
        </div>
        <a 
          href="mailto:privacy@inboxpilot.ai" 
          className="text-xs font-bold px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl hover:text-white transition-all flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Privacy</span>
        </a>
      </div>

    </div>
  );
}
