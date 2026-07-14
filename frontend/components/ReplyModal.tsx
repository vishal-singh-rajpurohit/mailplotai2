"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, Loader2, CheckCircle2, Globe } from "lucide-react";
import { useSendReply } from "@/lib/hooks/useEmails";
import { apiClient } from "@/lib/api-client";

interface ReplyModalProps {
  emailId: string;
  emailSubject: string;
  senderName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export default function ReplyModal({
  emailId,
  emailSubject,
  senderName,
  isOpen,
  onClose,
  onSuccessToast,
}: ReplyModalProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [replyBody, setReplyBody] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const sendReplyMutation = useSendReply(emailId);

  // Fetch AI Reply Suggestions based on language setting
  useEffect(() => {
    if (isOpen && emailId) {
      fetchSuggestions();
    }
  }, [isOpen, emailId, language]);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await apiClient.post("/api/v1/ai/reply-suggestions", {
        email_id: emailId,
        language: language,
      });
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      console.error("Failed to load reply suggestions", e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setReplyBody(text);
  };

  const handleSend = async () => {
    if (!replyBody.trim()) return;
    
    try {
      await sendReplyMutation.mutateAsync({
        body: replyBody,
        language: language,
      });
      onSuccessToast("Reply sent successfully!");
      setReplyBody("");
      onClose();
    } catch (e) {
      console.error("Failed to send reply", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Reply to {senderName}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-md">
              {emailSubject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          
          {/* Language Toggle & Suggestion Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-violet-500 font-semibold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI Suggested Drafts</span>
            </div>
            
            {/* Language Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === "en"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === "hi"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                हिंदी
              </button>
            </div>
          </div>

          {/* AI Suggestions List */}
          {isLoadingSuggestions ? (
            <div className="flex flex-col gap-2.5 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl" />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="w-full text-left p-3.5 border border-violet-500/10 hover:border-violet-500/30 bg-violet-500/[0.01] hover:bg-violet-500/[0.03] dark:border-violet-500/5 dark:hover:border-violet-500/20 dark:bg-violet-500/[0.005] dark:hover:bg-violet-500/[0.015] rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium transition-all duration-300 active:scale-[0.99] leading-relaxed"
                >
                  {sug}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              Could not generate reply suggestions. Tap text box to write.
            </p>
          )}

          {/* Message Textbox */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">
              Customize message body:
            </label>
            <textarea
              rows={6}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your response here..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-250 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none transition-all duration-300"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSend}
            disabled={sendReplyMutation.isPending || !replyBody.trim()}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
              sendReplyMutation.isPending || !replyBody.trim()
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-750 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {sendReplyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
