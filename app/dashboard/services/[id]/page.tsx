import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/guards";
import { updateService } from "../action";
import { ServiceForm } from "../service-form";

type Params = Promise<{ id: string }>;

async function EditForm({ params }: { params: Params }) {
  await requireOwner();
  const { id } = await params;

  const service = await db.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <ServiceForm
      action={updateService.bind(null, id)}
      submitLabel="Save changes"
      defaults={{
        name: service.name,
        description: service.description ?? "",
        price: String(service.price),
        durationMin: String(service.durationMin),
      }}
    />
  );
}

export default function EditServicePage({ params }: { params: Params }) {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit service</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}