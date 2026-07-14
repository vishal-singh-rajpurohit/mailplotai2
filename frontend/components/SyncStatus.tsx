"use client";

import React from "react";
import { useSyncEmails } from "@/lib/hooks/useSyncEmails";
import { RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SyncStatus() {
  const { data: session } = useSession();
  const { syncInbox, isSyncing, syncStatus, error } = useSyncEmails();

  const handleSync = () => {
    if (isSyncing) return;
    
    // Determine provider based on user sign-in session
    const sessionProvider = (session as any)?.provider;
    // Demo uses the Gmail-shaped mock inbox, while the backend records the
    // account itself as a distinct "demo" provider.
    const provider = (sessionProvider === "google" || sessionProvider === "demo")
      ? "gmail"
      : (sessionProvider === "microsoft-entra-id" || sessionProvider === "microsoft")
        ? "outlook"
        : sessionProvider || "gmail";
    syncInbox({ provider, fullSync: false });
  };

  const sessionProvider = (session as any)?.provider;
  const providerLabel = sessionProvider === "demo"
    ? "Demo Inbox"
    : sessionProvider === "microsoft-entra-id" || sessionProvider === "microsoft"
      ? "Outlook"
      : "Gmail";

  return (
    <div className="flex items-center gap-3">
      {/* Detail State Text */}
      {isSyncing && (
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
          Syncing {providerLabel}... 
          {syncStatus?.processed_emails !== undefined && syncStatus?.total_emails !== undefined && (
            <span>({syncStatus.processed_emails}/{syncStatus.total_emails})</span>
          )}
        </span>
      )}
      
      {!isSyncing && syncStatus?.status === "success" && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold animate-[fadeOut_4s_forwards]">
          <Check className="w-3.5 h-3.5" />
          Mailbox updated
        </span>
      )}

      {error && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-red-500 font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          Sync failed
        </span>
      )}

      {/* Sync trigger button */}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
          isSyncing
            ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-250 active:scale-95"
        }`}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-violet-500" : ""}`} />
        <span>Sync {providerLabel}</span>
      </button>
    </div>
  );
}
