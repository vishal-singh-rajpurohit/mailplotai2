import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  image: z.string().nullable().optional(),
  provider: z.string(),
  preferred_language: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const EmailRecipientSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const EmailDeadlineSchema = z.object({
  task: z.string(),
  deadline: z.string().nullable().optional(),
});

export const EmailEntitiesSchema = z.object({
  people: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  dates: z.array(z.string()).default([]),
  amounts: z.array(z.string()).default([]),
});

export const EmailSchema = z.object({
  id: z.string().uuid(),
  provider: z.string(),
  message_id: z.string(),
  thread_id: z.string().nullable().optional(),
  subject: z.string(),
  sender_email: z.string(),
  sender_name: z.string(),
  recipients: z.array(EmailRecipientSchema).default([]),
  snippet: z.string(),
  body_plain: z.string(),
  body_html: z.string(),
  received_at: z.string(),
  is_read: z.boolean(),
  is_starred: z.boolean(),
  labels: z.array(z.string()).default([]),
  category: z.string(),
  urgency_score: z.number(),
  importance_score: z.number(),
  summary: z.string().nullable().optional(),
  simple_explanation_en: z.string().nullable().optional(),
  simple_explanation_hi: z.string().nullable().optional(),
  action_items: z.array(z.string()).nullable().optional(),
  deadlines: z.array(EmailDeadlineSchema).nullable().optional(),
  entities: EmailEntitiesSchema.nullable().optional(),
  needs_reply: z.boolean(),
  created_at: z.string(),
});

export const SyncJobSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  provider: z.string(),
  total_emails: z.number(),
  processed_emails: z.number(),
  error_message: z.string().nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
});

export const TopSenderSchema = z.object({
  email: z.string(),
  name: z.string(),
  count: z.number(),
});

export const DailyInsightsSchema = z.object({
  unread_count: z.number(),
  urgent_count: z.number(),
  needs_reply_count: z.number(),
  categories: z.record(z.string(), z.number()),
  top_senders: z.array(TopSenderSchema).default([]),
  deadlines_today: z.array(
    z.object({
      task: z.string(),
      deadline: z.string().nullable().optional(),
      email_id: z.string(),
      email_subject: z.string(),
    })
  ).default([]),
  daily_summary: z.string(),
});

export type UserType = z.infer<typeof UserSchema>;
export type EmailType = z.infer<typeof EmailSchema>;
export type SyncJobType = z.infer<typeof SyncJobSchema>;
export type DailyInsightsType = z.infer<typeof DailyInsightsSchema>;
export type EmailRecipientType = z.infer<typeof EmailRecipientSchema>;
export type EmailDeadlineType = z.infer<typeof EmailDeadlineSchema>;
