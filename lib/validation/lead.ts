import { z } from "zod";

/**
 * Zod validation schema for Lead Consultation Ingest
 * Validates input on both client and server before database insertion.
 */
export const leadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(120, { message: "Name must not exceed 120 characters" }),

  phone: z
    .string()
    .trim()
    .min(6, { message: "Phone number must be at least 6 digits" })
    .max(30, { message: "Phone number must not exceed 30 characters" })
    .regex(/^[+]?[\d\s\-().]{6,30}$/, {
      message: "Please enter a valid phone number",
    }),

  state_province: z
    .string()
    .trim()
    .min(2, { message: "State/Province must be at least 2 characters" })
    .max(100, { message: "State/Province must not exceed 100 characters" }),

  service_type: z
    .string()
    .trim()
    .min(2, { message: "Please select a valid service type" })
    .max(100),

  message: z
    .string()
    .trim()
    .min(10, { message: "Project details must be at least 10 characters" })
    .max(3000, { message: "Project details must not exceed 3,000 characters" }),

  locale: z.enum(["ar", "fr", "en"]).default("en"),

  // Anti-spam honeypot field (must remain empty)
  honeypot: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export interface LeadSubmissionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  rateLimited?: boolean;
  formDisabled?: boolean;
}
