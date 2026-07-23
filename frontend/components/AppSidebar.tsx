"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Inbox, AlertCircle, MessageSquare, LogOut, Briefcase, User, Landmark,
  BookOpen, Shield, FileText, Calendar, BarChart3, Compass, Sparkles
} from "lucide-react";

interface AppSidebarProps {
  currentFilter: {
    category?: string | null;
    is_read?: boolean | null;
    is_urgent?: boolean | null;
    needs_reply?: boolean | null;
  };
  onFilterChange: (filters: {
    category?: string | null;
    is_read?: boolean | null;
    is_urgent?: boolean | null;
    needs_reply?: boolean | null;
  }) => void;
  showInsights: boolean;
  setShowInsights: (show: boolean) => void;
}

export default function AppSidebar({
  currentFilter,
  onFilterChange,
  showInsights,
  setShowInsights,
}: AppSidebarProps) {
  const { data: session } = useSession();

  const primaryNavItems = [
    {
      label: "Dashboard Insights",
      icon: BarChart3,
      active: showInsights,
      onClick: () => {
        setShowInsights(true);
        // Clear filters to show all ininsights
        onFilterChange({});
      }
    },
    {
      label: "All Mailbox",
      icon: Inbox,
      active: !showInsights && !currentFilter.category && currentFilter.is_read === undefined && currentFilter.is_urgent === undefined && currentFilter.needs_reply === undefined,
      onClick: () => {
        setShowInsights(false);
        onFilterChange({});
      }
    },
    {
      label: "Urgent Emails",
      icon: AlertCircle,
      active: !showInsights && currentFilter.is_urgent === true,
      onClick: () => {
        setShowInsights(false);
        onFilterChange({ is_urgent: true });
      }
    },
    {
      label: "Needs Reply",
      icon: MessageSquare,
      active: !showInsights && currentFilter.needs_reply === true,
      onClick: () => {
        setShowInsights(false);
        onFilterChange({ needs_reply: true });
      }
    },
    {
      label: "Unread Messages",
      icon: Compass,
      active: !showInsights && currentFilter.is_read === false,
      onClick: () => {
        setShowInsights(false);
        onFilterChange({ is_read: false });
      }
    }
  ];

  const categories = [
    { name: "work", label: "Work", icon: Briefcase, color: "text-blue-500" },
    { name: "personal", label: "Personal", icon: User, color: "text-emerald-500" },
    { name: "finance", label: "Finance", icon: Landmark, color: "text-indigo-500" },
    { name: "education", label: "Education", icon: BookOpen, color: "text-violet-500" },
    { name: "security", label: "Security", icon: Shield, color: "text-rose-500" },
    { name: "invoice", label: "Invoices", icon: FileText, color: "text-teal-500" },
    { name: "meeting", label: "Meetings", icon: Calendar, color: "text-cyan-500" }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0">
      
      {/* Brand Header */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-slate-850">
        <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
          <Sparkles className="w-4 h-4 fill-white/10" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-wide text-white">INBOXPILOT AI</span>
          <span className="text-[10px] font-bold text-violet-400">Email Voice Assistant</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-6">
        
        {/* Nav Group 1 - Main links */}
        <div className="flex flex-col gap-1">
          {primaryNavItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.active
                    ? "bg-violet-650 text-white shadow-md shadow-violet-650/10"
                    : "hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nav Group 2 - Categories */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-extrabold text-slate-550 uppercase tracking-widest px-4">
            Categories
          </span>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = !showInsights && currentFilter.category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setShowInsights(false);
                    onFilterChange({ category: cat.name });
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-800 text-white font-bold"
                      : "hover:bg-slate-850 hover:text-slate-200 text-slate-400"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* User Footer Panel */}
      {session?.user && (
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User Profile"}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-violet-500/20"
              />
            ) : (
              <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-slate-300">
                {session.user.name ? session.user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {session.user.name}
              </span>
              <span className="text-[9px] text-slate-500 truncate">
                {session.user.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-850 hover:bg-red-950/20 hover:text-red-400 text-slate-400 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

    </aside>
  );
}
