"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleApiKeyConnection } from "@/lib/actions/settings.actions";
import type { ApiKeyPlaceholder } from "@/types";

export function ApiKeyRow({ apiKey }: { apiKey: ApiKeyPlaceholder }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{apiKey.label}</p>
            <p className="text-xs text-muted-foreground">{apiKey.masked_value}</p>
          </div>
        </div>
        <Switch
          checked={apiKey.is_connected}
          disabled={isPending}
          onCheckedChange={(checked) =>
            startTransition(async () => {
              await toggleApiKeyConnection(apiKey.id, checked);
              router.refresh();
            })
          }
        />
      </CardContent>
    </Card>
  );
}
