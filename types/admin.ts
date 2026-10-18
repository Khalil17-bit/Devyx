import type { AdminRole } from "@/lib/security/roles";

export interface AdminUserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export interface AdminActionResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AdminAuthResult {
  success: boolean;
  message?: string;
}

export interface AdminSession {
  authenticated: boolean;
  email: string | null;
  id: string | null;
  role: AdminRole | null;
}
