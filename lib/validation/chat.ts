import { z } from "zod";

/**
 * Validation schema for the AI Chatbot Proxy (/api/chat)
 * Strictly adheres to PRD Section 7.2 & 7.3
 */
export const chatMessageSchema = z.object({
  sessionId: z
    .string()
    .uuid({ message: "Invalid session UUID format" })
    .default(() => crypto.randomUUID()),
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(1500, { message: "Message exceeds maximum 1,500 character limit" }),
  language: z.enum(["ar", "fr", "en"]).default("en"),
  currentPage: z.string().max(256).default("/"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export interface ChatApiResponse {
  reply: string;
  sessionId: string;
  fallback?: boolean;
  error?: string;
}
