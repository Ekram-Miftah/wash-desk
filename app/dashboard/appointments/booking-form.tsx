"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBirr } from "@/lib/format";
import { createBooking } from "./action";

type ServiceOption = { id: string; name: string; price: number };

export function BookingForm({ services }: { services: ServiceOption[] }) {
  const [state, formAction, pending] = useActionState(createBooking, {});
  const [local, setLocal] = useState("");

  // The browser turns the picked time into an exact UTC timestamp.
  const iso = local ? new Date(local).toISOString() : "";
  const value = (key: string) => state.values?.[key] ?? "";

  return (
    <form action={formAction} className="grid max-w-lg gap-4">
      <div className="grid gap-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input id="customerName" name="customerName" defaultValue={value("customerName")} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="customerPhone">Phone</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          placeholder="0911 000 000"
          defaultValue={value("customerPhone")}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vehicle">Vehicle</Label>
        <Input
          id="vehicle"
          name="vehicle"
          placeholder="Toyota Vitz, white"
          defaultValue={value("vehicle")}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="serviceId">Service</Label>
        <select
          id="serviceId"
          name="serviceId"
          defaultValue={value("serviceId")}
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Choose a service
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {formatBirr(s.price)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="when">Date and time</Label>
        <Input
          id="when"
          type="datetime-local"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          required
        />
        <input type="hidden" name="scheduledAt" value={iso} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" defaultValue={value("notes")} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create booking"}
        </Button>
        <Link
          href="/dashboard/appointments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}