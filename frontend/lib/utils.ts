import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString: string | Date): string {
  const d = new Date(dateString);
  const now = new Date();
  
  // If today, show time
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year, show Date without year
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatUrgency(score: number): { label: string; color: string; bg: string } {
  if (score >= 0.7) {
    return { label: "Urgent", color: "text-red-500 border-red-500", bg: "bg-red-500/10" };
  }
  if (score >= 0.4) {
    return { label: "Medium", color: "text-amber-500 border-amber-500", bg: "bg-amber-500/10" };
  }
  return { label: "Low", color: "text-slate-500 border-slate-300 dark:border-slate-700", bg: "bg-slate-500/5" };
}
