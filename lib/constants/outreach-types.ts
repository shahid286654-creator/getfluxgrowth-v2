import { Mail, MessageSquare, Send, FileSignature, type LucideIcon } from "lucide-react";
import type { OutreachType } from "@/types";

export const OUTREACH_TYPE_CONFIG: Record<
  OutreachType,
  { label: string; icon: LucideIcon }
> = {
  email_generator: { label: "Email", icon: Mail },
  linkedin_message: { label: "LinkedIn message", icon: MessageSquare },
  follow_up_1: { label: "Follow-up #1", icon: Send },
  follow_up_2: { label: "Follow-up #2", icon: Send },
  proposal: { label: "Proposal", icon: FileSignature },
};
