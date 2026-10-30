import { Suspense } from "react";
import { requireOwner } from "@/lib/guards";
import { getDailyRevenue, getMonthlyRevenue, getTodayKey, lastDayKeys } from "@/lib/revenue";
import { formatBirr } from "@/lib/format";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevenueChart } from "./revenue-chart";



function monthLabel(key: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${key}-01T00:00:00Z`));
}

async function ReportsContent() {
  await requireOwner();

  const [dailyRows, monthlyRows] = await Promise.all([
    getDailyRevenue(30),
    getMonthlyRevenue(),
  ]);

   const byDay = new Map(dailyRows.map((r) => [r.period, r]));
  const series = lastDayKeys(30).map((key) => ({
    label: key.slice(5),
    revenue: byDay.get(key)?.revenue ?? 0,
  }));

  const todayKey = getTodayKey();
  const thisMonth = monthlyRows.find((m) => m.period === todayKey.slice(0, 7));
  const months = [...monthlyRows].reverse().slice(0, 12);

  const stats = [
    { title: "Today", value: formatBirr(byDay.get(todayKey)?.revenue ?? 0) },
    { title: "This month", value: formatBirr(thisMonth?.revenue ?? 0) },
    { title: "Completed this month", value: String(thisMonth?.count ?? 0) },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardDescription>{s.title}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily revenue</CardTitle>
          <CardDescription>The last 30 days, completed bookings only.</CardDescription>
        </CardHeader>
        <div className="px-4 pb-4">
          <RevenueChart data={series} />
        </div>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Monthly revenue</h2>
        {months.length === 0 ? (
          <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
            No completed bookings yet.
          </p>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Completed bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((m) => (
                  <TableRow key={m.period}>
                    <TableCell className="font-medium">{monthLabel(m.period)}</TableCell>
                    <TableCell>{m.count}</TableCell>
                    <TableCell className="text-right">{formatBirr(m.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Daily and monthly revenue, so you can see how the business is doing.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <ReportsContent />
      </Suspense>
    </div>
  );
}