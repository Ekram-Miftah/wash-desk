"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/guards";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().trim().max(300, "Description is too long"),
  price: z.coerce
    .number()
    .int("Price must be a whole number")
    .min(1, "Price must be at least 1")
    .max(1_000_000),
  durationMin: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(600),
});

export type FormState = { error?: string; values?: Record<string, string> };

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    durationMin: String(formData.get("durationMin") ?? ""),
  };
}

function handleDbError(e: unknown, values: Record<string, string>): FormState {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return { error: "A service with that name already exists.", values };
  }
  throw e;
}

export async function createService(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireOwner();

  const raw = readForm(formData);
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", values: raw };
  }

  try {
    await db.service.create({
      data: { ...parsed.data, description: parsed.data.description || null },
    });
  } catch (e) {
    return handleDbError(e, raw);
  }

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function updateService(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireOwner();

  const raw = readForm(formData);
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", values: raw };
  }

  try {
    await db.service.update({
      where: { id },
      data: { ...parsed.data, description: parsed.data.description || null },
    });
  } catch (e) {
    return handleDbError(e, raw);
  }

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function toggleServiceActive(id: string): Promise<void> {
  await requireOwner();

  const service = await db.service.findUnique({
    where: { id },
    select: { active: true },
  });
  if (!service) return;

  await db.service.update({ where: { id }, data: { active: !service.active } });
  revalidatePath("/dashboard/services");
}