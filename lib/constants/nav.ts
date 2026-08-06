import {
  LayoutDashboard,
  Users,
  Gauge,
  Search,
  Sparkles,
  Send,
  KanbanSquare,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Website Audit", href: "/website-audit", icon: Gauge },
  { title: "SEO Audit", href: "/seo-audit", icon: Search },
  { title: "AI Opportunities", href: "/ai-opportunities", icon: Sparkles },
  { title: "Outreach", href: "/outreach", icon: Send },
  { title: "CRM Pipeline", href: "/pipeline", icon: KanbanSquare },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];
