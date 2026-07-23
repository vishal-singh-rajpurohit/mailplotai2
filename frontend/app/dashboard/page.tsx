"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, X, Check } from "lucide-react";

import AppSidebar from "@/components/AppSidebar";
import SyncStatus from "@/components/SyncStatus";
import VoiceInput from "@/components/VoiceInput";
import EmailList from "@/components/EmailList";
import EmailDetailsPanel from "@/components/EmailDetailsPanel";
import InsightsDashboard from "@/components/InsightsDashboard";

import { useEmails } from "@/lib/hooks/useEmails";
import { useVoiceCommand } from "@/lib/hooks/useVoiceCommand";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if unauthorized
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Filters State
  const [filters, setFilters] = useState<{
    category?: string | null;
    is_read?: boolean | null;
    is_urgent?: boolean | null;
    needs_reply?: boolean | null;
    date_from?: string | null;
    date_to?: string | null;
  }>({});
  
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceQueryBanner, setVoiceQueryBanner] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook queries
  const { data: emails, isLoading, refetch } = useEmails(filters);
  const { parseCommand, isParsing } = useVoiceCommand();

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setSelectedEmailId(null);
    setSearchQuery("");
  };

  const handleVoiceCommand = async (transcript: string) => {
    try {
      // 1. Post to backend voice parser
      const res = await parseCommand(transcript);
      const parsedFilters = res.parsed_intent.filters;
      
      // 2. Set active filters
      const updatedFilters: typeof filters = {};
      if (parsedFilters.category) updatedFilters.category = parsedFilters.category;
      if (parsedFilters.is_unread !== null) updatedFilters.is_read = !parsedFilters.is_unread;
      if (parsedFilters.urgency_min !== null && parsedFilters.urgency_min! >= 0.7) updatedFilters.is_urgent = true;
      if (parsedFilters.needs_reply !== null) updatedFilters.needs_reply = parsedFilters.needs_reply;
      
      if (parsedFilters.date_range) {
        if (parsedFilters.date_range.start) updatedFilters.date_from = parsedFilters.date_range.start;
        if (parsedFilters.date_range.end) updatedFilters.date_to = parsedFilters.date_range.end;
      }

      setFilters(updatedFilters);
      setVoiceQueryBanner(transcript);
      
      // If we got a keyword, set search query
      if (parsedFilters.keyword) {
        setSearchQuery(parsedFilters.keyword);
        // Note: useEmails list will filter with standard filters. 
        // If keyword search is needed, the query will trigger.
      }

      // Hide insights, show mailbox listing
      setShowInsights(false);
      setSelectedEmailId(null);
      showToast("Voice command parsed successfully!");
    } catch (e) {
      console.error("Failed to parse voice command", e);
      showToast("Voice parsing failed. Let's try again.");
    }
  };

  const clearVoiceFilters = () => {
    setFilters({});
    setSearchQuery("");
    setVoiceQueryBanner(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keyboard shortcut: Press "Space" or "M" key on dashboard to activate voice input?
  // Let's keep it simple, mouse click is excellent.

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <span className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold">Authorizing Session...</span>
      </div>
    );
  }

  // Filter list by keyword client-side if a general search query is typed but semantic search isn't run
  const filteredEmails = emails?.filter((mail) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      mail.subject.toLowerCase().includes(q) ||
      mail.sender_name.toLowerCase().includes(q) ||
      mail.sender_email.toLowerCase().includes(q) ||
      mail.snippet.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* App Sidebar navigation */}
      <AppSidebar
        currentFilter={filters}
        onFilterChange={handleFilterChange}
        showInsights={showInsights}
        setShowInsights={setShowInsights}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header navbar */}
        <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          
          {/* Quick Search */}
          <div className="max-w-md w-full relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
            <input
              type="text"
              placeholder="Search subject, sender or snippet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 placeholder-slate-455"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Sync trigger status widget */}
            <SyncStatus />
          </div>

        </header>

        {/* Dashboard Work Area */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          
          {/* Left panel - Insights or Email list */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
            
            {/* Voice Input mic dashboard widget */}
            <div className="flex-shrink-0">
              <VoiceInput onCommand={handleVoiceCommand} />
            </div>

            {/* Voice Command Banner */}
            {voiceQueryBanner && (
              <div className="flex items-center justify-between gap-4 bg-violet-550/10 border border-violet-500/25 px-4 py-2.5 rounded-2xl text-xs text-violet-600 dark:text-violet-400 font-medium">
                <span className="truncate">Voice command results for: &quot;{voiceQueryBanner}&quot;</span>
                <button
                  onClick={clearVoiceFilters}
                  className="flex-shrink-0 p-1 hover:bg-violet-500/10 rounded-lg text-violet-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto">
              {showInsights ? (
                <InsightsDashboard 
                  onSelectEmail={(id) => {
                    setShowInsights(false);
                    setFilters({});
                    setSelectedEmailId(id);
                  }} 
                />
              ) : (
                <EmailList
                  emails={filteredEmails}
                  isLoading={isLoading}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={(id) => setSelectedEmailId(id)}
                />
              )}
            </div>

          </div>

          {/* Right panel - Email details drawer */}
          {!showInsights && (
            <div className="hidden lg:block w-[450px] xl:w-[500px] flex-shrink-0 h-full">
              <EmailDetailsPanel
                emailId={selectedEmailId}
                onClose={() => setSelectedEmailId(null)}
                onSuccessToast={showToast}
              />
            </div>
          )}

        </div>

        {/* Mobile Slide-out drawer for Email Details */}
        {!showInsights && selectedEmailId && (
          <div className="lg:hidden absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-md h-full bg-white dark:bg-slate-900">
              <EmailDetailsPanel
                emailId={selectedEmailId}
                onClose={() => setSelectedEmailId(null)}
                onSuccessToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Custom Pop-up Toast message */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-700 animate-[slideIn_0.2s_ease-out] text-xs font-semibold">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}
