import {
  Workflow,
  Bot,
  Users,
  Mail,
  MessageCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { AiOpportunityType } from "@/types";

export const OPPORTUNITY_TYPE_CONFIG: Record<
  AiOpportunityType,
  { label: string; icon: LucideIcon }
> = {
  automation: { label: "Automation", icon: Workflow },
  chatbot: { label: "Chatbot", icon: Bot },
  crm: { label: "CRM", icon: Users },
  email: { label: "Email", icon: Mail },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  lead_capture: { label: "Lead capture", icon: UserPlus },
};
