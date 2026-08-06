-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums

create type lead_status as enum (
  'new',
  'qualified',
  'unqualified',
  'contacted',
  'converted',
  'lost'
);

create type pipeline_stage as enum (
  'new',
  'qualified',
  'contacted',
  'replied',
  'meeting',
  'proposal',
  'won',
  'lost'
);

create type audit_category as enum (
  'performance',
  'mobile',
  'ux',
  'cta',
  'trust',
  'speed',
  'technical_issues'
);

create type seo_audit_category as enum (
  'metadata',
  'headings',
  'schema',
  'internal_links',
  'core_web_vitals',
  'technical_seo'
);

create type score_status as enum (
  'good',
  'needs_improvement',
  'poor'
);

create type ai_opportunity_type as enum (
  'automation',
  'chatbot',
  'crm',
  'email',
  'whatsapp',
  'lead_capture'
);

create type opportunity_impact as enum (
  'low',
  'medium',
  'high'
);

create type opportunity_status as enum (
  'identified',
  'proposed',
  'dismissed'
);

create type outreach_type as enum (
  'email_generator',
  'linkedin_message',
  'follow_up_1',
  'follow_up_2',
  'proposal'
);

create type outreach_status as enum (
  'draft',
  'sent',
  'scheduled',
  'archived'
);

create type activity_type as enum (
  'lead_created',
  'status_changed',
  'stage_changed',
  'email_sent',
  'reply_received',
  'meeting_booked',
  'note_added',
  'audit_completed',
  'outreach_generated'
);

create type integration_status as enum (
  'coming_soon',
  'beta',
  'live'
);
