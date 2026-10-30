import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/appointment-status";

describe("appointment status changes", () => {
  it("lets a pending booking be confirmed or cancelled", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
  });

  it("lets a confirmed booking be completed or cancelled", () => {
    expect(canTransition("CONFIRMED", "COMPLETED")).toBe(true);
    expect(canTransition("CONFIRMED", "CANCELLED")).toBe(true);
  });

  it("does not let a booking skip the confirmation step", () => {
    expect(canTransition("PENDING", "COMPLETED")).toBe(false);
  });

  it("does not let a booking go backwards", () => {
    expect(canTransition("CONFIRMED", "PENDING")).toBe(false);
  });

  it("locks completed and cancelled bookings", () => {
    expect(canTransition("COMPLETED", "CANCELLED")).toBe(false);
    expect(canTransition("COMPLETED", "PENDING")).toBe(false);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
  });
});