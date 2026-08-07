"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { createNote, deleteNote } from "@/lib/actions/notes.actions";
import { formatRelativeDate } from "@/lib/utils/format";
import type { Note } from "@/types";

export function LeadNotesPanel({ leadId, notes }: { leadId: string; notes: Note[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createNote(leadId, {}, formData);
      if (!result?.error) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNote(id, leadId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
        <Textarea name="body" placeholder="Add a note about this lead..." rows={3} />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Add note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Notes you add will show up here." />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm whitespace-pre-wrap text-foreground">{note.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(note.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
