import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const placeholders = [
  { title: "Today's revenue", note: "Appears once reports are built" },
  { title: "Bookings today", note: "Appears once scheduling is built" },
  { title: "Active services", note: "Appears once pricing is built" },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
                  A snapshot of today&apos;s work.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {placeholders.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <CardDescription>{p.title}</CardDescription>
              <CardTitle className="text-3xl">—</CardTitle>
              <p className="text-xs text-muted-foreground">{p.note}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}