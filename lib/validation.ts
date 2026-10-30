import { z } from "zod";

export const serviceSchema = z.object({
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

export const bookingSchema = z.object({
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