import React from "react";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface UrgencyBadgeProps {
  score: number;
}

export default function UrgencyBadge({ score }: UrgencyBadgeProps) {
  let label = "Low Urgency";
  let bg = "bg-slate-500/5";
  let text = "text-slate-500 border-slate-200 dark:border-slate-800";
  let Icon = CheckCircle2;

  if (score >= 0.7) {
    label = "Urgent";
    bg = "bg-red-500/10";
    text = "text-red-500 border-red-500/20";
    Icon = AlertCircle;
  } else if (score >= 0.4) {
    label = "Medium";
    bg = "bg-amber-500/10";
    text = "text-amber-500 border-amber-500/20";
    Icon = Clock;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}
