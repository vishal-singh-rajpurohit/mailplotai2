"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, Mail, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState("demo_user@inboxpilot.ai");
  const [demoName, setDemoName] = useState("Demo User");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Auto-trigger demo if url query parameter ?demo=true is present
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setIsDemoOpen(true);
    }
  }, [searchParams]);

  const handleProviderLogin = (provider: string) => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) return;
    setIsLoading("demo");
    await signIn("credentials", {
      email: demoEmail.trim(),
      name: demoName.trim() || "Demo User",
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl text-slate-350">
      
      {/* Brand Logo */}
      <div className="flex flex-col items-center text-center gap-1.5">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-4 h-4 fill-white/10" />
          </div>
          <span className="font-black text-sm tracking-wide text-white">INBOXPILOT AI</span>
        </Link>
        <h2 className="text-xl font-bold text-white">
          {isDemoOpen ? "Join the AI Sandbox" : "Connect your mailbox"}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          {isDemoOpen
            ? "Enter a mock username/email to try the full assistant locally with preloaded mock inbox records."
            : "Select Google or Microsoft to sync and analyze your email mailbox securely."}
        </p>
      </div>

      {!isDemoOpen ? (
        /* Regular Login View */
        <div className="flex flex-col gap-3">
          
          {/* Google Login */}
          <button
            onClick={() => handleProviderLogin("google")}
            disabled={isLoading !== null}
            className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-semibold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all ${
              isLoading && isLoading !== "google" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading === "google" ? (
              <span className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.77-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.5z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.21C.44 8.24 0 10.06 0 12s.44 3.76 1.21 5.38l4.11-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.38l4.11 3.11c.94-2.85 3.57-4.96 6.68-4.96z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Microsoft Login */}
          <button
            onClick={() => handleProviderLogin("microsoft-entra-id")}
            disabled={isLoading !== null}
            className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-semibold text-xs border border-white/5 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all ${
              isLoading && isLoading !== "microsoft" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading === "microsoft-entra-id" ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#F25022" d="M0 0h11v11H0z" />
                <path fill="#7FBA00" d="M12 0h11v11H12z" />
                <path fill="#00A4EF" d="M0 12h11v11H0z" />
                <path fill="#FFB900" d="M12 12h11v11H12z" />
              </svg>
            )}
            <span>Sign in with Microsoft</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2 text-[10px] font-black uppercase text-slate-600">
            <span className="h-px bg-white/5 flex-1" />
            <span>Or test locally</span>
            <span className="h-px bg-white/5 flex-1" />
          </div>

          {/* Demo Sandbox Login */}
          <button
            onClick={() => setIsDemoOpen(true)}
            className="w-full py-3 bg-violet-650 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
          >
            <span>Launch Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      ) : (
        /* Sandbox/Credentials Login Form */
        <form onSubmit={handleDemoLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. demo_user@inboxpilot.ai"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading !== null}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all mt-2"
          >
            {isLoading === "demo" ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Access Dashboard"
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDemoOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 mx-auto mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to OAuth sign in</span>
          </button>
        </form>
      )}

      {/* Footer notes */}
      <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-violet-400/80 flex-shrink-0 mt-0.5" />
          <p>
            <b>OAuth Scope Permission</b>: We only request email read/send privileges to verify context. We do not store raw keys. Revoke authorization at any time.
          </p>
        </div>
      </div>

    </div>
  );
}
