"use server";

import type { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer's name").max(80),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  vehicle: z.string().trim().min(2, "Enter the vehicle").max(80),
  serviceId: z.string().min(1, "Choose a service"),
  scheduledAt: z
    .string()
    .min(1, "Pick a date and time")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Pick a valid date and time"),
  notes: z.string().trim().max(300, "Notes are too long"),
});

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

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function setAppointmentStatus(
  id: string,
  next: AppointmentStatus
): Promise<void> {
  await requireUser();

  const appointment = await db.appointment.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!appointment || !transitions[appointment.status].includes(next)) return;

  await db.appointment.update({ where: { id }, data: { status: next } });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard");
}