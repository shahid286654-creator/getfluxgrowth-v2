import type { Database } from "./database.types";

export * from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type Audit = Database["public"]["Tables"]["audits"]["Row"];
export type SeoAudit = Database["public"]["Tables"]["seo_audits"]["Row"];
export type AiOpportunity = Database["public"]["Tables"]["ai_opportunities"]["Row"];
export type Outreach = Database["public"]["Tables"]["outreach"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];
export type ApiKeyPlaceholder = Database["public"]["Tables"]["api_key_placeholders"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];
