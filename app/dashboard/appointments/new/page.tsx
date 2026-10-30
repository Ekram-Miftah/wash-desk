import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { BookingForm } from "../booking-form";

async function FormWithServices() {
  await requireUser();
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true },
  });

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        There are no active services. Add or activate one on the Services page first.
      </p>
    );
  }

  return <BookingForm services={services} />;
}

export default function NewBookingPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New booking</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <FormWithServices />
      </Suspense>
    </div>
  );
}