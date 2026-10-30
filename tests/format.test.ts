import { describe, expect, it } from "vitest";
import { formatBirr, formatDateTime } from "@/lib/format";

describe("formatBirr", () => {
  it("adds a thousands separator and the currency", () => {
    expect(formatBirr(1200)).toBe("1,200 Birr");
  });

  it("formats zero", () => {
    expect(formatBirr(0)).toBe("0 Birr");
  });
});

describe("formatDateTime (Ethiopia time)", () => {
  it("shows 07:00 UTC as 10:00 in Addis Ababa", () => {
    const text = formatDateTime(new Date("2026-10-31T07:00:00Z"));
    expect(text).toContain("10:00");
    expect(text).toContain("31 Oct");
  });

  it("keeps a late-evening booking on the same day", () => {
    const text = formatDateTime(new Date("2026-10-31T20:30:00Z"));
    expect(text).toContain("23:30");
    expect(text).toContain("31 Oct");
  });

  it("moves past midnight to the next Ethiopian day", () => {
    const text = formatDateTime(new Date("2026-10-31T21:30:00Z"));
    expect(text).toContain("00:30");
    expect(text).toContain("1 Nov");
  });
});