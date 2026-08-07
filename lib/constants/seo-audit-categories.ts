import {
  FileText,
  Heading,
  Code,
  Link as LinkIcon,
  Gauge,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { SeoAuditCategory } from "@/types";

export const SEO_AUDIT_CATEGORY_CONFIG: Record<
  SeoAuditCategory,
  { label: string; icon: LucideIcon }
> = {
  metadata: { label: "Metadata", icon: FileText },
  headings: { label: "Headings", icon: Heading },
  schema: { label: "Schema", icon: Code },
  internal_links: { label: "Internal links", icon: LinkIcon },
  core_web_vitals: { label: "Core Web Vitals", icon: Gauge },
  technical_seo: { label: "Technical SEO", icon: Search },
};
