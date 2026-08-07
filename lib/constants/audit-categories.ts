import {
  Gauge,
  Smartphone,
  LayoutPanelTop,
  MousePointerClick,
  ShieldCheck,
  Zap,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { AuditCategory } from "@/types";

export const AUDIT_CATEGORY_CONFIG: Record<
  AuditCategory,
  { label: string; icon: LucideIcon }
> = {
  performance: { label: "Performance", icon: Gauge },
  mobile: { label: "Mobile", icon: Smartphone },
  ux: { label: "UX", icon: LayoutPanelTop },
  cta: { label: "Calls to action", icon: MousePointerClick },
  trust: { label: "Trust signals", icon: ShieldCheck },
  speed: { label: "Speed", icon: Zap },
  technical_issues: { label: "Technical issues", icon: AlertTriangle },
};
