import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DailyInsightsSchema, DailyInsightsType } from "@/lib/validators";

export function useInsights() {
  return useQuery<DailyInsightsType>({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/insights/dashboard");
      return DailyInsightsSchema.parse(res.data);
    },
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep stats live
  });
}
