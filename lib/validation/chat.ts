import { z } from "zod";
import type { JarvisAction, HandoffData, EstimateData } from "@/lib/ai/assistant-context";

/**
 * Attachment schema: base64-encoded image or PDF
 * Max sizes enforced in frontend; schema validates structure only.
 */
const attachmentSchema = z.object({
  /** MIME type of the attachment */
  type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]),
  /** Base64-encoded file content */
  data: z.string().min(1).max(15_000_000), // ~10MB base64 ceiling
  /** Original filename */
  name: z.string().max(255),
  /** File size in bytes (for display) */
  size: z.number().optional(),
});

export type AttachmentInput = z.infer<typeof attachmentSchema>;

/**
 * Validation schema for the AI Chatbot Proxy (/api/chat)
 * Strictly adheres to PRD Section 7.2 & 7.3 with Jarvis Action Extensions
 */
export const chatMessageSchema = z.object({
  sessionId: z
    .string()
    .uuid({ message: "Invalid session UUID format" })
    .default(() => crypto.randomUUID()),
  message: z
    .string()
    .trim()
    .min(0)
    .max(1500, { message: "Message exceeds maximum 1,500 character limit" })
    .default(""),
  language: z.enum(["ar", "fr", "en", "darija", "ar-MA"]).default("en"),
  currentPage: z.string().max(256).default("/"),
  theme: z.enum(["dark", "light"]).optional(),
  /** Optional file attachment (image or PDF) */
  attachment: attachmentSchema.optional(),
}).refine(
  (data) => data.message.trim().length > 0 || !!data.attachment,
  { message: "Either message or attachment must be provided", path: ["message"] }
);

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export interface ChatApiResponse {
  reply: string;
  sessionId: string;
  actions?: JarvisAction[];
  handoff?: HandoffData;
  estimate?: EstimateData;
  fallback?: boolean;
  error?: string;
  mode?: string;
  /** Queue status info when request is throttled */
  queued?: boolean;
  queuePosition?: number;
  estimatedWaitMs?: number;
  /** Token budget info */
  tokenBudget?: {
    dailyRemaining: number;
    sessionRemaining: number;
  };
}
