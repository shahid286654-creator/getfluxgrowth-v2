"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabShellItem = {
  value: string;
  label: string;
  /** Pass an already-rendered icon element, e.g. `<Home className="size-4" />`. */
  icon?: ReactNode;
  content: ReactNode;
};

export function TabShell({
  items,
  defaultValue,
}: {
  items: TabShellItem[];
  defaultValue?: string;
}) {
  return (
    <Tabs defaultValue={defaultValue ?? items[0]?.value} className="gap-4">
      <TabsList className="w-full justify-start overflow-x-auto">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.icon}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
