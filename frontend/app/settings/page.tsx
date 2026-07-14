"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Check, Globe } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<string>("en");
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (session) {
      setLanguage((session as any).preferredLanguage || "en");
    }
  }, [session]);

  const handleSave = async (lang: string) => {
    setLanguage(lang);
    setIsSaving(true);
    try {
      // Call backend preference update
      await apiClient.patch("/api/v1/auth/preferences", {
        preferred_language: lang,
      });
      
      // Update NextAuth token session
      await update({ preferredLanguage: lang });
      
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (e) {
      console.error("Failed to update preferences", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-350 p-6 flex items-center justify-center relative overflow-hidden">
      {/* Glow Backdrop */}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-violet-650/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white">App Settings</h2>
            <p className="text-[10px] text-slate-500">Configure assistant options</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">
              Assistant Explanation Language
            </label>
            <p className="text-xs text-slate-400 px-1 leading-relaxed">
              Select the default language for email insights, action item highlights, and reply suggestions.
            </p>
            
            <div className="flex flex-col gap-2.5 mt-2">
              {/* English Choice */}
              <button
                onClick={() => handleSave("en")}
                className={`flex items-center justify-between p-4 border rounded-2xl text-xs font-semibold text-left transition-all ${
                  language === "en"
                    ? "bg-violet-500/5 border-violet-500 text-white"
                    : "bg-slate-950 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <div className="flex flex-col">
                    <span>English</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">Defaut summaries and insights</span>
                  </div>
                </div>
                {language === "en" && <Check className="w-4 h-4 text-violet-500" />}
              </button>

              {/* Hindi Choice */}
              <button
                onClick={() => handleSave("hi")}
                className={`flex items-center justify-between p-4 border rounded-2xl text-xs font-semibold text-left transition-all ${
                  language === "hi"
                    ? "bg-violet-500/5 border-violet-500 text-white"
                    : "bg-slate-950 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div className="flex flex-col">
                    <span>हिंदी (Hindi)</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">सरल हिंदी में स्पष्टीकरण और सुझाव</span>
                  </div>
                </div>
                {language === "hi" && <Check className="w-4 h-4 text-violet-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security / About */}
        <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500 leading-relaxed flex flex-col gap-1">
          <span className="font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Connected Provider
          </span>
          <span>Logged in via: {(session as any)?.provider || "Demo Sandbox Credentials"}</span>
        </div>

      </div>

      {/* Toast popup */}
      {showSavedToast && (
        <div className="fixed bottom-5 right-5 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl text-xs font-semibold animate-pulse">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Language updated successfully</span>
        </div>
      )}
    </div>
  );
}
