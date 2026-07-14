import React from "react";
import { EmailType } from "@/lib/validators";
import EmailCard from "./EmailCard";
import { MailOpen, Inbox } from "lucide-react";

interface EmailListProps {
  emails: EmailType[] | undefined;
  isLoading: boolean;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export default function EmailList({
  emails,
  isLoading,
  selectedEmailId,
  onSelectEmail,
}: EmailListProps) {
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-850 rounded" />
              <div className="h-3 w-12 bg-slate-200 dark:bg-slate-850 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-850 rounded" />
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-850 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-850 rounded" />
            <div className="flex gap-2 mt-1">
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-850 rounded-full" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-850 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 gap-3 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 shadow border rounded-full text-slate-400 dark:text-slate-500">
          <Inbox className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">No emails found</p>
          <p className="text-xs">Your inbox is clear. Try running a mailbox sync or adjusting filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          isSelected={selectedEmailId === email.id}
          onClick={() => onSelectEmail(email.id)}
        />
      ))}
    </div>
  );
}
