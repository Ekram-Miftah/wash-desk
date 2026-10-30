import { db } from "@/lib/db";

const TZ = "Africa/Addis_Ababa";

type Row = { period: string; revenue: bigint; count: bigint };

export type RevenuePoint = { period: string; revenue: number; count: number };

function toPoints(rows: Row[]): RevenuePoint[] {
  return rows.map((r) => ({
    period: r.period,
    revenue: Number(r.revenue),
    count: Number(r.count),
  }));
}

// "2026-10-31", in Ethiopia time
export function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

export async function getDailyRevenue(days: number): Promise<RevenuePoint[]> {
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.$queryRaw<Row[]>`
    SELECT to_char(("scheduledAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Africa/Addis_Ababa', 'YYYY-MM-DD') AS period,
           COALESCE(SUM("price"), 0)::bigint AS revenue,
           COUNT(*)::bigint AS count
    FROM "Appointment"
    WHERE "status" = 'COMPLETED' AND "scheduledAt" >= ${from}
    GROUP BY 1
    ORDER BY 1`;
  return toPoints(rows);
}

export async function getMonthlyRevenue(): Promise<RevenuePoint[]> {
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const rows = await db.$queryRaw<Row[]>`
    SELECT to_char(("scheduledAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Africa/Addis_Ababa', 'YYYY-MM') AS period,
           COALESCE(SUM("price"), 0)::bigint AS revenue,
           COUNT(*)::bigint AS count
    FROM "Appointment"
    WHERE "status" = 'COMPLETED' AND "scheduledAt" >= ${from}
    GROUP BY 1
    ORDER BY 1`;
  return toPoints(rows);
}


const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayKey() {
  return dayKey(new Date());
}

// The last N days as "YYYY-MM-DD" keys in Ethiopia time, oldest first
export function lastDayKeys(days: number): string[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) =>
    dayKey(new Date(now - (days - 1 - i) * DAY_MS))
  );
}