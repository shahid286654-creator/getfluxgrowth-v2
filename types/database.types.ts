/**
 * Hand-authored to match supabase/migrations/*.sql exactly. Once a real
 * Supabase project exists, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > types/database.types.ts
 * and reconcile any drift against the migrations, which remain the
 * source of truth.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LeadStatus =
  | "new"
  | "qualified"
  | "unqualified"
  | "contacted"
  | "converted"
  | "lost";

export type PipelineStage =
  | "new"
  | "qualified"
  | "contacted"
  | "replied"
  | "meeting"
  | "proposal"
  | "won"
  | "lost";

export type AuditCategory =
  | "performance"
  | "mobile"
  | "ux"
  | "cta"
  | "trust"
  | "speed"
  | "technical_issues";

export type SeoAuditCategory =
  | "metadata"
  | "headings"
  | "schema"
  | "internal_links"
  | "core_web_vitals"
  | "technical_seo";

export type ScoreStatus = "good" | "needs_improvement" | "poor";

export type AiOpportunityType =
  | "automation"
  | "chatbot"
  | "crm"
  | "email"
  | "whatsapp"
  | "lead_capture";

export type OpportunityImpact = "low" | "medium" | "high";
export type OpportunityStatus = "identified" | "proposed" | "dismissed";

export type OutreachType =
  | "email_generator"
  | "linkedin_message"
  | "follow_up_1"
  | "follow_up_2"
  | "proposal";

export type OutreachStatus = "draft" | "sent" | "scheduled" | "archived";

export type ActivityType =
  | "lead_created"
  | "status_changed"
  | "stage_changed"
  | "email_sent"
  | "reply_received"
  | "meeting_booked"
  | "note_added"
  | "audit_completed"
  | "outreach_generated";

export type IntegrationStatus = "coming_soon" | "beta" | "live";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          company_name: string | null;
          company_website: string | null;
          company_logo_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          company_name?: string | null;
          company_website?: string | null;
          company_logo_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: never[];
      };
      leads: {
        Row: {
          id: string;
          owner_id: string;
          company_name: string;
          website: string | null;
          industry: string | null;
          country: string | null;
          email: string | null;
          linkedin_url: string | null;
          status: LeadStatus;
          pipeline_stage: PipelineStage;
          notes_summary: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          company_name: string;
          website?: string | null;
          industry?: string | null;
          country?: string | null;
          email?: string | null;
          linkedin_url?: string | null;
          status?: LeadStatus;
          pipeline_stage?: PipelineStage;
          notes_summary?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "leads_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audits: {
        Row: {
          id: string;
          lead_id: string;
          category: AuditCategory;
          score: number | null;
          status: ScoreStatus;
          summary: string | null;
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          category: AuditCategory;
          score?: number | null;
          status?: ScoreStatus;
          summary?: string | null;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audits"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "audits_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_audits: {
        Row: {
          id: string;
          lead_id: string;
          category: SeoAuditCategory;
          score: number | null;
          status: ScoreStatus;
          summary: string | null;
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          category: SeoAuditCategory;
          score?: number | null;
          status?: ScoreStatus;
          summary?: string | null;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seo_audits"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "seo_audits_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_opportunities: {
        Row: {
          id: string;
          lead_id: string;
          type: AiOpportunityType;
          title: string;
          description: string | null;
          impact: OpportunityImpact;
          estimated_value: string | null;
          status: OpportunityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: AiOpportunityType;
          title: string;
          description?: string | null;
          impact?: OpportunityImpact;
          estimated_value?: string | null;
          status?: OpportunityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_opportunities"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "ai_opportunities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      outreach: {
        Row: {
          id: string;
          lead_id: string;
          owner_id: string | null;
          type: OutreachType;
          subject: string | null;
          body: string | null;
          status: OutreachStatus;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          owner_id?: string | null;
          type: OutreachType;
          subject?: string | null;
          body?: string | null;
          status?: OutreachStatus;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["outreach"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "outreach_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outreach_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          lead_id: string | null;
          actor_id: string | null;
          type: ActivityType;
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          actor_id?: string | null;
          type: ActivityType;
          description: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          lead_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_settings: {
        Row: {
          id: string;
          owner_id: string;
          company_name: string | null;
          website: string | null;
          industry: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          company_name?: string | null;
          website?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_settings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "company_settings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      api_key_placeholders: {
        Row: {
          id: string;
          owner_id: string;
          provider: string;
          label: string;
          masked_value: string;
          is_connected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          provider: string;
          label: string;
          masked_value?: string;
          is_connected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["api_key_placeholders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "api_key_placeholders_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      integrations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          status: IntegrationStatus;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          status?: IntegrationStatus;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      lead_status: LeadStatus;
      pipeline_stage: PipelineStage;
      audit_category: AuditCategory;
      seo_audit_category: SeoAuditCategory;
      score_status: ScoreStatus;
      ai_opportunity_type: AiOpportunityType;
      opportunity_impact: OpportunityImpact;
      opportunity_status: OpportunityStatus;
      outreach_type: OutreachType;
      outreach_status: OutreachStatus;
      activity_type: ActivityType;
      integration_status: IntegrationStatus;
    };
  };
}
