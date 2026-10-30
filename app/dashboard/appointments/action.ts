"use server";

import type { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canTransition } from "@/lib/appointment-status";
import { bookingSchema } from "@/lib/validation";

export type FormState = { error?: string; values?: Record<string, string> };

export async function createBooking(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const raw = {
    customerName: String(formData.get("customerName") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    vehicle: String(formData.get("vehicle") ?? ""),
    serviceId: String(formData.get("serviceId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", values: raw };
  }

  // The price always comes from the database, never from the browser.
  const service = await db.service.findFirst({
    where: { id: parsed.data.serviceId, active: true },
  });
  if (!service) {
    return { error: "That service is no longer available.", values: raw };
  }

  await db.appointment.create({
    data: {
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      vehicle: parsed.data.vehicle,
      scheduledAt: new Date(parsed.data.scheduledAt),
      price: service.price,
      notes: parsed.data.notes || null,
      serviceId: service.id,
      createdById: user.id,
    },
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  redirect("/dashboard/appointments");
}

export async function setAppointmentStatus(
  id: string,
  next: AppointmentStatus
): Promise<void> {
  await requireUser();

  const appointment = await db.appointment.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!appointment || !canTransition(appointment.status, next)) return;

  await db.appointment.update({ where: { id }, data: { status: next } });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard");
}