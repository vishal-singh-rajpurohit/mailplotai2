import React from "react";
import { EmailType } from "@/lib/validators";
import { formatTime } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";
import UrgencyBadge from "./UrgencyBadge";
import { MessageSquare, Calendar, Sparkles } from "lucide-react";

interface EmailCardProps {
  email: EmailType;
  isSelected: boolean;
  onClick: () => void;
}

export default function EmailCard({ email, isSelected, onClick }: EmailCardProps) {
  const hasDeadlines = email.deadlines && email.deadlines.length > 0;
  
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col gap-2 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-violet-500/5 border-violet-500/40 ring-1 ring-violet-500/30"
          : "bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800"
      }`}
    >
      {/* Unread marker bar */}
      {!email.is_read && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 rounded-l-xl" />
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col min-w-0">
          <span className={`text-sm text-slate-800 dark:text-slate-200 truncate ${!email.is_read ? "font-bold" : "font-semibold"}`}>
            {email.sender_name || email.sender_email.split("@")[0]}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
            {email.sender_email}
          </span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {formatTime(email.received_at)}
        </span>
      </div>

      {/* Subject Line */}
      <h4 className={`text-sm text-slate-900 dark:text-slate-100 line-clamp-1 ${!email.is_read ? "font-bold" : "font-medium"}`}>
        {email.subject}
      </h4>

      {/* Snippet / AI Summary */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {email.summary || email.snippet}
      </p>

      {/* Badges and Indicators Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 border-t border-slate-100 dark:border-slate-850 pt-2.5">
        
        {/* Category & Urgency badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={email.category} />
          {email.urgency_score > 0 && <UrgencyBadge score={email.urgency_score} />}
        </div>

        {/* Indicators for Deadlines / Actions / Reply */}
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          {email.needs_reply && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-violet-500/5 text-[10px] font-bold text-violet-500 border border-violet-500/20 rounded"
              title="AI detected reply needed"
            >
              <MessageSquare className="w-2.5 h-2.5" />
              Reply
            </span>
          )}
          {hasDeadlines && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/5 text-[10px] font-bold text-amber-500 border border-amber-500/20 rounded"
              title="Deadlines extracted"
            >
              <Calendar className="w-2.5 h-2.5" />
              Due
            </span>
          )}
          {email.summary && (
            <span title="AI analyzed">
              <Sparkles className="w-3.5 h-3.5 text-violet-500/70" />
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
