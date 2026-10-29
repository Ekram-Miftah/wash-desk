import { Suspense } from "react";
import { requireOwner } from "@/lib/guards";
import { createService } from "../action";
import { ServiceForm } from "../service-form";

async function Guarded() {
  await requireOwner();
  return <ServiceForm action={createService} submitLabel="Create service" />;
}

export default function NewServicePage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New service</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <Guarded />
      </Suspense>
    </div>
  );
}