import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { EmailSchema, EmailType } from "@/lib/validators";
import { z } from "zod";

interface EmailFilters {
  category?: string | null;
  is_read?: boolean | null;
  is_urgent?: boolean | null;
  needs_reply?: boolean | null;
  date_from?: string | null;
  date_to?: string | null;
}

export function useEmails(filters: EmailFilters = {}) {

  return useQuery<EmailType[]>({

    queryKey: ["emails", filters],

    queryFn: async () => {

      const params = new URLSearchParams();

      if (filters.category) params.append("category", filters.category);

      if (filters.is_read !== undefined && filters.is_read !== null) {
        params.append("is_read", String(filters.is_read));
      }

      if (filters.is_urgent !== undefined && filters.is_urgent !== null) {
        params.append("is_urgent", String(filters.is_urgent));
      }

      if (filters.needs_reply !== undefined && filters.needs_reply !== null) {
        params.append("needs_reply", String(filters.needs_reply));
      }

      if (filters.date_from) params.append("date_from", filters.date_from);

      if (filters.date_to) params.append("date_to", filters.date_to);

      const res = await apiClient.get(`/api/v1/emails?${params.toString()}`);

      return z.array(EmailSchema).parse(res.data);

    },
  });
}

export function useEmailDetails(emailId: string | null) {
  const queryClient = useQueryClient();
  
  return useQuery<EmailType>({
    queryKey: ["email", emailId],
    queryFn: async () => {
      if (!emailId) throw new Error("Email ID is required");
      const res = await apiClient.get(`/api/v1/emails/${emailId}`);
      
      // Invalidate list queries because reading an email changes is_read to true
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      
      return EmailSchema.parse(res.data);
    },
    enabled: !!emailId,
  });
}

export function useSearchEmails(query: string, useSemantic: boolean = true) {
  return useQuery<EmailType[]>({
    queryKey: ["emails", "search", query, useSemantic],
    queryFn: async () => {
      if (!query) return [];
      const res = await apiClient.get(
        `/api/v1/emails/search?q=${encodeURIComponent(query)}&semantic=${useSemantic}`
      );
      return z.array(EmailSchema).parse(res.data);
    },
    enabled: !!query,
  });
}

export function useSendReply(emailId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ body, language }: { body: string; language: string }) => {
      const res = await apiClient.post(`/api/v1/emails/${emailId}/reply`, {
        body,
        language,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });
    },
  });
}
