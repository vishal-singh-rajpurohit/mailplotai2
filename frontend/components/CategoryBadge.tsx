import React from "react";
import { 
  Briefcase, User, Landmark, BookOpen, Users, Tag, Shield, 
  FileText, Calendar, AlertOctagon, HelpCircle 
} from "lucide-react";

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const configMap: Record<string, { label: string; bg: string; text: string; icon: React.ComponentType<any> }> = {
    work: { label: "Work", bg: "bg-blue-500/10", text: "text-blue-500 border-blue-500/20", icon: Briefcase },
    personal: { label: "Personal", bg: "bg-emerald-500/10", text: "text-emerald-500 border-emerald-500/20", icon: User },
    finance: { label: "Finance", bg: "bg-indigo-500/10", text: "text-indigo-500 border-indigo-500/20", icon: Landmark },
    education: { label: "Education", bg: "bg-violet-500/10", text: "text-violet-500 border-violet-500/20", icon: BookOpen },
    social: { label: "Social", bg: "bg-pink-500/10", text: "text-pink-500 border-pink-500/20", icon: Users },
    promotions: { label: "Promotions", bg: "bg-amber-500/10", text: "text-amber-500 border-amber-500/20", icon: Tag },
    security: { label: "Security", bg: "bg-rose-500/10", text: "text-rose-500 border-rose-500/20", icon: Shield },
    invoice: { label: "Invoice", bg: "bg-teal-500/10", text: "text-teal-500 border-teal-500/20", icon: FileText },
    meeting: { label: "Meeting", bg: "bg-cyan-500/10", text: "text-cyan-500 border-cyan-500/20", icon: Calendar },
    spam: { label: "Spam", bg: "bg-orange-500/10", text: "text-orange-500 border-orange-500/20", icon: AlertOctagon },
    other: { label: "General", bg: "bg-slate-500/10", text: "text-slate-500 border-slate-500/20", icon: HelpCircle }
  };

  const config = configMap[category.toLowerCase()] || configMap.other;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}
