import { Suspense } from "react";
import Link from "next/link";
import type { AppointmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { formatBirr, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setAppointmentStatus } from "./action";

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

const badgeVariant = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
} satisfies Record<AppointmentStatus, "outline" | "secondary" | "default" | "destructive">;

const nextActions: Record<AppointmentStatus, { label: string; to: AppointmentStatus }[]> = {
  PENDING: [
    { label: "Confirm", to: "CONFIRMED" },
    { label: "Cancel", to: "CANCELLED" },
  ],
  CONFIRMED: [
    { label: "Complete", to: "COMPLETED" },
    { label: "Cancel", to: "CANCELLED" },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

type SearchParams = Promise<{ status?: string }>;

async function AppointmentsList({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const { status } = await searchParams;
  const filter = statuses.find((s) => s === status);

  const appointments = await db.appointment.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { scheduledAt: "desc" },
    take: 50,
    include: { service: { select: { name: true } } },
  });

  const tabs = [{ label: "All", value: undefined }, ...statuses.map((s) => ({
    label: s.charAt(0) + s.slice(1).toLowerCase(),
    value: s,
  }))];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/dashboard/appointments?status=${tab.value}` : "/dashboard/appointments"}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              filter === tab.value
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No appointments here yet.
        </p>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(a.scheduledAt)}</TableCell>
                  <TableCell>
                    <p className="font-medium">{a.customerName}</p>
                    <p className="text-xs text-muted-foreground">{a.customerPhone}</p>
                  </TableCell>
                  <TableCell>{a.vehicle}</TableCell>
                  <TableCell>{a.service.name}</TableCell>
                  <TableCell>{formatBirr(a.price)}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant[a.status]}>
                      {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {nextActions[a.status].map((action) => (
                        <form key={action.to} action={setAppointmentStatus.bind(null, a.id, action.to)}>
                          <Button
                            type="submit"
                            size="sm"
                            variant={action.to === "CANCELLED" ? "ghost" : "outline"}
                          >
                            {action.label}
                          </Button>
                        </form>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {appointments.length === 50 && (
        <p className="text-xs text-muted-foreground">Showing the latest 50.</p>
      )}
    </div>
  );
}

export default function AppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Every booking in one place, from request to completed wash.
          </p>
        </div>
        <Link href="/dashboard/appointments/new" className={buttonVariants()}>
          New booking
        </Link>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <AppointmentsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}