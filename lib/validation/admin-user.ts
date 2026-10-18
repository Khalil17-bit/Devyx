import { z } from "zod";
import { ADMIN_ROLES } from "@/lib/security/roles";

export const createAdminUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" })
    .max(255, { message: "Email is too long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password is too long" }),
  full_name: z
    .string()
    .trim()
    .max(100, { message: "Name is too long" })
    .optional(),
  role: z
    .enum(ADMIN_ROLES, {
      errorMap: () => ({ message: "Please select a valid administrative role" }),
    })
    .default("Administrator"),
});

export const updateAdminUserSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" })
    .max(255, { message: "Email is too long" })
    .optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password is too long" })
    .optional()
    .or(z.literal("")),
  full_name: z
    .string()
    .trim()
    .max(100, { message: "Name is too long" })
    .optional(),
  role: z
    .enum(ADMIN_ROLES, {
      errorMap: () => ({ message: "Please select a valid administrative role" }),
    })
    .optional(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
