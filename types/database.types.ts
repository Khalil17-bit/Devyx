export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceCategory = "web_dev" | "mobile_app" | "automation";
export type ProjectCategory = "web_dev" | "mobile_app" | "automation";
export type SocialPlatform =
  | "whatsapp"
  | "telegram"
  | "messenger"
  | "instagram"
  | "tiktok"
  | "youtube";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "spam";
export type PrimaryCtaAction = "open_chat" | "navigate_contact";

export interface LocalizedString {
  en?: string;
  fr?: string;
  ar?: string;
  [key: string]: string | undefined;
}

export interface LocalizedFeatureItem {
  en?: string;
  fr?: string;
  ar?: string;
}

export interface MetadataItem {
  code?: string;
  label?: string;
  value?: string;
  title?: LocalizedString;
  desc?: LocalizedString;
}

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: number;
          brand_name: string;
          enable_contact_form: boolean;
          chatbot_enabled: boolean;
          primary_cta_action: PrimaryCtaAction;
          contact_email: string;
          seo_title: LocalizedString;
          seo_description: LocalizedString;
          updated_at: string;
        };
        Insert: {
          id?: number;
          brand_name?: string;
          enable_contact_form?: boolean;
          chatbot_enabled?: boolean;
          primary_cta_action?: PrimaryCtaAction;
          contact_email?: string;
          seo_title?: LocalizedString;
          seo_description?: LocalizedString;
          updated_at?: string;
        };
        Update: {
          id?: number;
          brand_name?: string;
          enable_contact_form?: boolean;
          chatbot_enabled?: boolean;
          primary_cta_action?: PrimaryCtaAction;
          contact_email?: string;
          seo_title?: LocalizedString;
          seo_description?: LocalizedString;
          updated_at?: string;
        };
      };
      page_sections: {
        Row: {
          section_key: string;
          badge_text: LocalizedString;
          headline: LocalizedString;
          subheadline: LocalizedString;
          body_text: LocalizedString;
          primary_cta_label: LocalizedString;
          secondary_cta_label: LocalizedString;
          metadata_items: MetadataItem[];
          updated_at: string;
        };
        Insert: {
          section_key: string;
          badge_text?: LocalizedString;
          headline?: LocalizedString;
          subheadline?: LocalizedString;
          body_text?: LocalizedString;
          primary_cta_label?: LocalizedString;
          secondary_cta_label?: LocalizedString;
          metadata_items?: MetadataItem[];
          updated_at?: string;
        };
        Update: {
          section_key?: string;
          badge_text?: LocalizedString;
          headline?: LocalizedString;
          subheadline?: LocalizedString;
          body_text?: LocalizedString;
          primary_cta_label?: LocalizedString;
          secondary_cta_label?: LocalizedString;
          metadata_items?: MetadataItem[];
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          slug: string;
          category: ServiceCategory;
          icon_name: string;
          title: LocalizedString;
          short_description: LocalizedString;
          full_description: LocalizedString;
          cta_label: LocalizedString;
          features: LocalizedFeatureItem[];
          is_featured_home: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category: ServiceCategory;
          icon_name?: string;
          title?: LocalizedString;
          short_description?: LocalizedString;
          full_description?: LocalizedString;
          cta_label?: LocalizedString;
          features?: LocalizedFeatureItem[];
          is_featured_home?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category?: ServiceCategory;
          icon_name?: string;
          title?: LocalizedString;
          short_description?: LocalizedString;
          full_description?: LocalizedString;
          cta_label?: LocalizedString;
          features?: LocalizedFeatureItem[];
          is_featured_home?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          category: ProjectCategory;
          title: LocalizedString;
          short_summary: LocalizedString;
          problem_statement: LocalizedString;
          solution_provided: LocalizedString;
          results_achieved: LocalizedString;
          tech_stack: string[];
          cover_image_url: string;
          gallery_images: string[];
          live_url: string | null;
          is_featured: boolean;
          is_published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category: ProjectCategory;
          title?: LocalizedString;
          short_summary?: LocalizedString;
          problem_statement?: LocalizedString;
          solution_provided?: LocalizedString;
          results_achieved?: LocalizedString;
          tech_stack?: string[];
          cover_image_url?: string;
          gallery_images?: string[];
          live_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category?: ProjectCategory;
          title?: LocalizedString;
          short_summary?: LocalizedString;
          problem_statement?: LocalizedString;
          solution_provided?: LocalizedString;
          results_achieved?: LocalizedString;
          tech_stack?: string[];
          cover_image_url?: string;
          gallery_images?: string[];
          live_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: SocialPlatform;
          url: string;
          display_handle: string;
          custom_label: LocalizedString;
          is_active: boolean;
          display_order: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: SocialPlatform;
          url?: string;
          display_handle?: string;
          custom_label?: LocalizedString;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: SocialPlatform;
          url?: string;
          display_handle?: string;
          custom_label?: LocalizedString;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          state_province: string;
          service_type: string;
          message: string;
          locale: "ar" | "fr" | "en";
          status: LeadStatus;
          admin_notes: string | null;
          n8n_synced: boolean;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          state_province: string;
          service_type: string;
          message: string;
          locale: "ar" | "fr" | "en";
          status?: LeadStatus;
          admin_notes?: string | null;
          n8n_synced?: boolean;
          ip_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          state_province?: string;
          service_type?: string;
          message?: string;
          locale?: "ar" | "fr" | "en";
          status?: LeadStatus;
          admin_notes?: string | null;
          n8n_synced?: boolean;
          ip_hash?: string;
          created_at?: string;
        };
      };
      api_rate_limits: {
        Row: {
          key: string;
          request_count: number;
          window_start: string;
        };
        Insert: {
          key: string;
          request_count?: number;
          window_start?: string;
        };
        Update: {
          key?: string;
          request_count?: number;
          window_start?: string;
        };
      };
    };
    Views: {};
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      service_category: ServiceCategory;
      project_category: ProjectCategory;
      social_platform: SocialPlatform;
      lead_status: LeadStatus;
      primary_cta_action: PrimaryCtaAction;
    };
  };
}
