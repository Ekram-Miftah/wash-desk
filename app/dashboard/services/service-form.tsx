"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "./action";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  defaults?: Record<string, string>;
};

export function ServiceForm({ action, submitLabel, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  const value = (key: string) => state.values?.[key] ?? defaults?.[key] ?? "";

  return (
    <form action={formAction} className="grid max-w-lg gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={value("name")} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" defaultValue={value("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price (Birr)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            defaultValue={value("price")}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="durationMin">Duration (minutes)</Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={5}
            step={1}
            defaultValue={value("durationMin")}
            required
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link
          href="/dashboard/services"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}