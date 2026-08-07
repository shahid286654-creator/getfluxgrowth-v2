"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createOutreachDraft, updateOutreach } from "@/lib/actions/outreach.actions";
import { outreachSchema, type OutreachInput } from "@/lib/validations/outreach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OUTREACH_TYPE_CONFIG } from "@/lib/constants/outreach-types";
import type { Outreach } from "@/types";

type LeadOption = { id: string; company_name: string };

export function OutreachEditorDialog({
  outreach,
  leadId,
  leadOptions,
  open,
  onOpenChange,
}: {
  outreach?: Outreach;
  leadId?: string;
  leadOptions?: LeadOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(outreach);
  const fixedLeadId = leadId ?? outreach?.lead_id;

  const form = useForm<OutreachInput>({
    resolver: zodResolver(outreachSchema),
    defaultValues: {
      lead_id: fixedLeadId ?? "",
      type: outreach?.type ?? "email_generator",
      subject: outreach?.subject ?? "",
      body: outreach?.body ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        lead_id: fixedLeadId ?? "",
        type: outreach?.type ?? "email_generator",
        subject: outreach?.subject ?? "",
        body: outreach?.body ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, outreach, fixedLeadId]);

  function onSubmit(values: OutreachInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("lead_id", values.lead_id);
      formData.set("type", values.type);
      formData.set("subject", values.subject ?? "");
      formData.set("body", values.body ?? "");

      const result =
        isEdit && outreach
          ? await updateOutreach(outreach.id, outreach.lead_id, {}, formData)
          : await createOutreachDraft({}, formData);

      if (result?.error) {
        form.setError("root", { message: result.error });
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit draft" : "New outreach draft"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this outreach message." : "Draft a new message for a lead."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {!fixedLeadId && (
              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(leadOptions ?? []).map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OUTREACH_TYPE_CONFIG).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Quick question about your website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create draft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
