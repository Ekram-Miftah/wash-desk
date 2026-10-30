import { describe, expect, it } from "vitest";
import { bookingSchema, serviceSchema } from "@/lib/validation";

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? null : result.error?.issues[0]?.message ?? null;
}

const validService = {
  name: "Exterior Wash",
  description: "",
  price: "300",
  durationMin: "20",
};

describe("service validation", () => {
  it("accepts a normal service and turns numbers from text", () => {
    const result = serviceSchema.safeParse(validService);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(300);
      expect(result.data.durationMin).toBe(20);
    }
  });

  it("rejects a price of zero", () => {
    const result = serviceSchema.safeParse({ ...validService, price: "0" });
    expect(firstError(result)).toBe("Price must be at least 1");
  });

  it("rejects a price with decimals", () => {
    const result = serviceSchema.safeParse({ ...validService, price: "12.5" });
    expect(firstError(result)).toBe("Price must be a whole number");
  });

  it("rejects a price that is not a number", () => {
    expect(serviceSchema.safeParse({ ...validService, price: "abc" }).success).toBe(false);
  });

  it("rejects a duration under 5 minutes", () => {
    const result = serviceSchema.safeParse({ ...validService, durationMin: "2" });
    expect(firstError(result)).toBe("Duration must be at least 5 minutes");
  });

  it("rejects a name that is too short", () => {
    const result = serviceSchema.safeParse({ ...validService, name: "A" });
    expect(firstError(result)).toBe("Name must be at least 2 characters");
  });
});

const validBooking = {
  customerName: "Abebe Kebede",
  customerPhone: "0911 000 000",
  vehicle: "Toyota Vitz, white",
  serviceId: "service-1",
  scheduledAt: "2026-11-01T07:00:00.000Z",
  notes: "",
};

describe("booking validation", () => {
  it("accepts a normal booking", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("accepts a phone number with a country code", () => {
    const result = bookingSchema.safeParse({ ...validBooking, customerPhone: "+251911000000" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number with letters", () => {
    const result = bookingSchema.safeParse({ ...validBooking, customerPhone: "call me" });
    expect(firstError(result)).toBe("Enter a valid phone number");
  });

  it("rejects a phone number that is too short", () => {
    expect(bookingSchema.safeParse({ ...validBooking, customerPhone: "12" }).success).toBe(false);
  });

  it("rejects a missing date", () => {
    const result = bookingSchema.safeParse({ ...validBooking, scheduledAt: "" });
    expect(firstError(result)).toBe("Pick a date and time");
  });

  it("rejects a date that is not a date", () => {
    const result = bookingSchema.safeParse({ ...validBooking, scheduledAt: "not a date" });
    expect(firstError(result)).toBe("Pick a valid date and time");
  });

  it("rejects when no service is chosen", () => {
    const result = bookingSchema.safeParse({ ...validBooking, serviceId: "" });
    expect(firstError(result)).toBe("Choose a service");
  });
});