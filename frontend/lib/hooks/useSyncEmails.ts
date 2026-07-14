import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SyncJobSchema, SyncJobType } from "@/lib/validators";

export function useSyncEmails() {
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: async ({ provider, fullSync }: { provider: string; fullSync?: boolean }) => {
      const res = await apiClient.post("/api/v1/emails/sync", {
        provider,
        full_sync: !!fullSync,
      });
      return res.data; // { job_id: "...", status: "pending" }
    },
    onSuccess: (data) => {
      setActiveJobId(data.job_id);
    },
  });

  const statusQuery = useQuery<SyncJobType>({
    queryKey: ["syncStatus", activeJobId],
    queryFn: async () => {
      if (!activeJobId) throw new Error("No active sync job");
      const res = await apiClient.get(`/api/v1/emails/sync/status/${activeJobId}`);
      return SyncJobSchema.parse(res.data);
    },
    enabled: !!activeJobId,
    // Poll dynamically based on task status
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job && (job.status === "running" || job.status === "pending")) {
        return 2000; // poll every 2s
      }
      return false; // stop polling
    },
  });

  // Watch status to trigger cache refetch on completion
  const currentStatus = statusQuery.data?.status;
  
  useEffect(() => {
    if (currentStatus === "success" || currentStatus === "failed") {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      
      // Keep showing success for 4 seconds, then reset sync state
      const timer = setTimeout(() => {
        setActiveJobId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, queryClient]);

  return {
    syncInbox: syncMutation.mutate,
    isLoading: syncMutation.isPending,
    isSyncing: syncMutation.isPending || !!activeJobId,
    syncStatus: statusQuery.data,
    error: syncMutation.error || statusQuery.error,
  };
}
export type UseSyncEmailsReturn = ReturnType<typeof useSyncEmails>;
