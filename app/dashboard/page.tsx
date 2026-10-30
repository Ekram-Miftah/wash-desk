import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { dayKey, getDailyRevenue } from "@/lib/revenue";
import { formatBirr, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function OverviewContent() {
  const user = await requireUser();
  const isOwner = user.role === "OWNER";

  const now = new Date();
  const todayKey = dayKey(now);
  // Ethiopia has no daylight saving, so +03:00 is always correct.
  const startOfToday = new Date(`${todayKey}T00:00:00+03:00`);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [bookingsToday, activeServices, upcoming, daily] = await Promise.all([
    db.appointment.count({
      where: {
        scheduledAt: { gte: startOfToday, lt: endOfToday },
        status: { not: "CANCELLED" },
      },
    }),
    db.service.count({ where: { active: true } }),
    db.appointment.findMany({
      where: { scheduledAt: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { service: { select: { name: true } } },
    }),
    isOwner ? getDailyRevenue(2) : Promise.resolve([]),
  ]);

  const revenueToday = daily.find((r) => r.period === todayKey)?.revenue ?? 0;

  const stats = [
    ...(isOwner
      ? [{ title: "Today's revenue", value: formatBirr(revenueToday), note: "Completed bookings" }]
      : []),
    { title: "Bookings today", value: String(bookingsToday), note: "Excluding cancelled" },
    { title: "Active services", value: String(activeServices), note: "Open for booking" },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardDescription>{s.title}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{s.note}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
          <CardDescription>The next five that are pending or confirmed.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing coming up.{" "}
              <Link href="/dashboard/appointments/new" className="underline underline-offset-4">
                Create a booking
              </Link>
            </p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.customerName} · {a.vehicle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.service.name} · {formatDateTime(a.scheduledAt)}
                    </p>
                  </div>
                  <Badge variant={a.status === "CONFIRMED" ? "secondary" : "outline"}>
                    {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of today&apos;s work.</p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <OverviewContent />
      </Suspense>
    </div>
  );
}