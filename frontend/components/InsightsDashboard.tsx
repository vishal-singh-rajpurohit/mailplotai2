"use client";

import React from "react";
import { useInsights } from "@/lib/hooks/useInsights";
import { 
  Mail, AlertCircle, MessageSquare, Calendar, Sparkles, 
  TrendingUp, UserCheck, Inbox, Clock, ArrowUpRight 
} from "lucide-react";
import CategoryBadge from "./CategoryBadge";

interface InsightsDashboardProps {
  onSelectEmail: (id: string) => void;
}

export default function InsightsDashboard({ onSelectEmail }: InsightsDashboardProps) {
  const { data: stats, isLoading, error } = useInsights();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" />
          ))}
        </div>
        {/* Daily Summary */}
        <div className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" />
        {/* Two Col layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500 gap-3">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Insights Unavailable</h3>
        <p className="text-xs max-w-xs">Failed to calculate daily metrics. Please check your network connection or verify that emails are synced.</p>
      </div>
    );
  }

  // Calculate total categorized emails
  const totalCategorized = Object.values(stats.categories).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Unread */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Unread</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.unread_count}</span>
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Urgent</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.urgent_count}</span>
          </div>
        </div>

        {/* Needs Reply */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Needs Reply</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.needs_reply_count}</span>
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Deadlines</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.deadlines_today.length}</span>
          </div>
        </div>

      </div>

      {/* 2. Daily AI Summary Board */}
      <div className="bg-violet-600 dark:bg-violet-950 border border-violet-500/20 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden">
        {/* Glow backdrop decorator */}
        <span className="absolute -right-16 -top-16 w-48 h-48 bg-violet-400/20 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-violet-200">
            Daily AI Inbox Summary
          </h3>
          <p className="text-sm font-semibold leading-relaxed text-white/90 select-text">
            {stats.daily_summary}
          </p>
        </div>
      </div>

      {/* 3. Detailed Breakdown section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Share List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Category Distribution
          </h3>
          
          {totalCategorized > 0 ? (
            <div className="flex flex-col gap-3.5">
              {Object.entries(stats.categories).map(([cat, count]) => {
                const percentage = Math.round((count / totalCategorized) * 100);
                return (
                  <div key={cat} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <CategoryBadge category={cat} />
                      <span className="font-bold text-slate-500">{count} ({percentage}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2 h-full min-h-[160px]">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="text-xs">No email categories available.</p>
            </div>
          )}
        </div>

        {/* Top Senders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-violet-500" />
            Frequent Contacts
          </h3>
          
          {stats.top_senders && stats.top_senders.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-850">
              {stats.top_senders.map((sender, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {sender.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {sender.email}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl whitespace-nowrap">
                    {sender.count} messages
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2 h-full min-h-[160px]">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="text-xs">No frequent contacts detected yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* 4. Deadlines Timeline Board */}
      {stats.deadlines_today && stats.deadlines_today.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            Upcoming extracted deadlines
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.deadlines_today.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onSelectEmail(item.email_id)}
                className="flex items-start justify-between gap-3 p-3.5 border border-amber-500/10 bg-amber-500/[0.01] hover:bg-amber-500/[0.03] dark:border-amber-500/5 dark:bg-amber-500/[0.003] dark:hover:bg-amber-500/[0.015] rounded-2xl cursor-pointer hover:shadow-sm transition-all group duration-300"
              >
                <div className="flex flex-col min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 select-text leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {item.task}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate select-none flex items-center gap-0.5">
                    Ref: {item.email_subject}
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
                {item.deadline && (
                  <span className="text-[10px] font-black px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full whitespace-nowrap shadow-sm select-none">
                    {new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
