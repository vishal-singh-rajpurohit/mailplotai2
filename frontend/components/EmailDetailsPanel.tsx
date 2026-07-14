"use client";

import React, { useState } from "react";
import { useEmailDetails } from "@/lib/hooks/useEmails";
import { formatTime } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";
import UrgencyBadge from "./UrgencyBadge";
import ReplyModal from "./ReplyModal";
import { 
  X, Calendar, CheckSquare, Users, Landmark, Tag, Shield, 
  Sparkles, FileText, Globe, Send, MessageSquare, ChevronRight, AlertTriangle 
} from "lucide-react";

interface EmailDetailsPanelProps {
  emailId: string | null;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

type TabType = "body" | "insights";

export default function EmailDetailsPanel({
  emailId,
  onClose,
  onSuccessToast,
}: EmailDetailsPanelProps) {
  const { data: email, isLoading, error } = useEmailDetails(emailId);
  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [explanationLang, setExplanationLang] = useState<"en" | "hi">("en");
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  if (!emailId) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-900/10 border-l border-slate-100 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 bg-white dark:bg-slate-900 shadow border rounded-2xl flex items-center justify-center mb-4 text-slate-350">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">No email selected</h3>
        <p className="text-xs max-w-xs mt-1">Select an email from the list to view summaries, action items, simple English/Hindi explanations, and suggested responses.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-12 bg-slate-250 dark:bg-slate-850 rounded" />
          <div className="h-8 w-8 bg-slate-250 dark:bg-slate-850 rounded-full" />
        </div>
        <div className="h-7 w-5/6 bg-slate-250 dark:bg-slate-850 rounded mb-4" />
        <div className="flex gap-2 mb-6">
          <div className="h-5 w-20 bg-slate-250 dark:bg-slate-850 rounded-full" />
          <div className="h-5 w-20 bg-slate-250 dark:bg-slate-850 rounded-full" />
        </div>
        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
          <div className="h-4 w-16 bg-slate-250 dark:bg-slate-850 rounded" />
          <div className="h-4 w-20 bg-slate-250 dark:bg-slate-850 rounded" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-4 w-full bg-slate-250 dark:bg-slate-850 rounded" />
          <div className="h-4 w-full bg-slate-250 dark:bg-slate-850 rounded" />
          <div className="h-4 w-2/3 bg-slate-250 dark:bg-slate-850 rounded" />
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border-l border-slate-250 dark:border-slate-800 text-center gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Failed to load email</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">An error occurred while fetching the email details.</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const hasActionItems = email.action_items && email.action_items.length > 0;
  const hasDeadlines = email.deadlines && email.deadlines.length > 0;
  
  // Safely check for entities count
  const hasEntities = email.entities && (
    (email.entities.people?.length ?? 0) > 0 || 
    (email.entities.companies?.length ?? 0) > 0 || 
    (email.entities.dates?.length ?? 0) > 0 || 
    (email.entities.amounts?.length ?? 0) > 0
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-[slideIn_0.3s_ease-out]">
      
      {/* Header Info */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        
        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CategoryBadge category={email.category} />
            {email.urgency_score > 0 && <UrgencyBadge score={email.urgency_score} />}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 select-text leading-snug">
            {email.subject}
          </h2>
          
          {/* Metadata Sender/Date */}
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex items-baseline justify-between gap-4 text-xs">
              <span className="text-slate-700 dark:text-slate-350 font-semibold select-text">
                From: {email.sender_name} &lt;{email.sender_email}&gt;
              </span>
              <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {formatTime(email.received_at)}
              </span>
            </div>
            
            {email.recipients && email.recipients.length > 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 select-text truncate">
                To: {email.recipients.map((r) => r.name || r.email).join(", ")}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "insights"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Insights
        </button>
        <button
          onClick={() => setActiveTab("body")}
          className={`flex items-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-all ml-6 ${
            activeTab === "body"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          Original Mail
        </button>
      </div>

      {/* Main Content Drawer */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {activeTab === "insights" ? (
          <>
            {/* AI Summary Block */}
            {email.summary && (
              <div className="bg-violet-500/[0.02] border border-violet-500/10 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Executive Summary</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium select-text">
                  {email.summary}
                </p>
              </div>
            )}

            {/* Simple Explanation Block (English & Hindi) */}
            {(email.simple_explanation_en || email.simple_explanation_hi) && (
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                
                {/* Header and Toggle */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Simple Explanation</span>
                  </div>
                  
                  {/* Language switch */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setExplanationLang("en")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        explanationLang === "en"
                          ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setExplanationLang("hi")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        explanationLang === "hi"
                          ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-sm text-slate-700 dark:text-slate-250 leading-relaxed select-text">
                  {explanationLang === "en" 
                    ? email.simple_explanation_en 
                    : email.simple_explanation_hi || email.simple_explanation_en}
                </p>
              </div>
            )}

            {/* Action Items List */}
            {hasActionItems && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Action Items
                </h3>
                <div className="flex flex-col gap-2">
                  {email.action_items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl shadow-sm"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/20"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-250 select-text leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deadlines Timeline */}
            {hasDeadlines && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Deadlines
                </h3>
                <div className="flex flex-col gap-2.5">
                  {email.deadlines?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 p-3 bg-amber-500/[0.01] border border-amber-500/10 rounded-xl text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-250 font-medium select-text">
                        {item.task}
                      </span>
                      {item.deadline && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full whitespace-nowrap">
                          {new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entities Chips */}
            {hasEntities && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Extracted Context
                </h3>
                
                <div className="flex flex-col gap-3 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/20">
                  
                  {/* People */}
                  {email.entities?.people && email.entities.people.length > 0 && (
                    <div className="flex items-start gap-2.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase w-20 mt-1 select-none">People</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {email.entities.people.map((name, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">{name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Companies */}
                  {email.entities?.companies && email.entities.companies.length > 0 && (
                    <div className="flex items-start gap-2.5 flex-wrap border-t border-slate-50 dark:border-slate-850 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase w-20 mt-1 select-none">Companies</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {email.entities.companies.map((company, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">{company}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amounts */}
                  {email.entities?.amounts && email.entities.amounts.length > 0 && (
                    <div className="flex items-start gap-2.5 flex-wrap border-t border-slate-50 dark:border-slate-850 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase w-20 mt-1 select-none">Amounts</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {email.entities.amounts.map((amount, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg text-xs font-bold text-indigo-500 shadow-sm">{amount}</span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </>
        ) : (
          /* Original Email Body tab */
          <div className="bg-slate-50/50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 flex-1 min-h-[350px] overflow-x-auto select-text">
            {email.body_html ? (
              <div 
                className="prose dark:prose-invert prose-xs max-w-full text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: email.body_html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') 
                }} 
              />
            ) : (
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-350 whitespace-pre-wrap font-sans leading-relaxed">
                {email.body_plain || email.snippet}
              </pre>
            )}
          </div>
        )}

      </div>

      {/* Footer sticky bar with Send Reply button */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center gap-4">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Powered by InboxPilot AI
        </span>
        <button
          onClick={() => setIsReplyOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Reply Assistant
        </button>
      </div>

      {/* Reply assistant Modal */}
      <ReplyModal
        emailId={email.id}
        emailSubject={email.subject}
        senderName={email.sender_name || email.sender_email}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        onSuccessToast={onSuccessToast}
      />

    </div>
  );
}
