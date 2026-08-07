import { Globe, Search, Mail, MessageCircle, Bot, Puzzle, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IntegrationStatusBadge } from "@/components/shared/status-badge";
import type { Integration } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  Globe,
  Search,
  Mail,
  MessageCircle,
  Bot,
};

export function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = (integration.icon_name && ICONS[integration.icon_name]) || Puzzle;

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <IntegrationStatusBadge status={integration.status} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{integration.name}</p>
          {integration.description && (
            <p className="mt-1 text-sm text-muted-foreground">{integration.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
