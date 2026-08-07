import {
  UserPlus,
  ArrowRightLeft,
  Mail,
  MessageSquareReply,
  CalendarCheck,
  StickyNote,
  FileSearch,
  Sparkles,
  CircleDot,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityType } from "@/types";

const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  lead_created: UserPlus,
  status_changed: ArrowRightLeft,
  stage_changed: ArrowRightLeft,
  email_sent: Mail,
  reply_received: MessageSquareReply,
  meeting_booked: CalendarCheck,
  note_added: StickyNote,
  audit_completed: FileSearch,
  outreach_generated: Sparkles,
};

export function ActivityFeedItem({
  type,
  description,
  createdAt,
  leadName,
}: {
  type: ActivityType;
  description: string;
  createdAt: string;
  leadName?: string | null;
}) {
  const Icon = ACTIVITY_ICON[type] ?? CircleDot;

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5 pb-4">
        <p className="text-sm text-foreground">
          {description}
          {leadName && (
            <span className="text-muted-foreground"> &middot; {leadName}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
