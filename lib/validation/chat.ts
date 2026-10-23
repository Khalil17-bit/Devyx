import { z } from "zod";
import type { JarvisAction, HandoffData, EstimateData } from "@/lib/ai/assistant-context";

/**
 * Attachment schema: strictly base64-encoded images (JPEG, PNG, WEBP)
 * 2MB max ceiling strictly enforced to protect tokens and serverless memory.
 */
const attachmentSchema = z.object({
  /** MIME type of the attachment — PNG, JPEG, WEBP only */
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  /** Base64-encoded file content (~2.8MB base64 characters max for 2MB file) */
  data: z.string().min(1).max(3_000_000),
  /** Original filename */
  name: z.string().max(255),
  /** File size in bytes (strictly <= 2MB) */
  size: z.number().max(2 * 1024 * 1024).optional(),
});

export type AttachmentInput = z.infer<typeof attachmentSchema>;

export const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2500),
});

export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;

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
  language: z.enum(["ar", "fr", "en", "darija", "ar-MA", "auto"]).default("auto"),
  currentPage: z.string().max(256).default("/"),
  theme: z.enum(["dark", "light"]).optional(),
  /** Recent conversation history (client-side memory) */
  history: z.array(chatHistoryItemSchema).optional(),
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
    hourlyRemaining?: number;
    sessionRemaining: number;
    hourlyLimit?: number;
    resetsInMinutes?: number;
    dailyRemaining: number;
  };
}
