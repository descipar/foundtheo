import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calcAge } from "../../utils/calcAge";

describe("calcAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("berechnet 0 Jahre, 0 Monate, 0 Tage am Geburtstag", () => {
    vi.setSystemTime(new Date("2025-04-17"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 0, months: 0, days: 0 });
  });

  it("berechnet ganzzahlige Jahre korrekt", () => {
    vi.setSystemTime(new Date("2026-04-17"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 1, months: 0, days: 0 });
  });

  it("berechnet Monate ohne Jahreswechsel korrekt", () => {
    vi.setSystemTime(new Date("2025-07-17"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 0, months: 3, days: 0 });
  });

  it("berechnet Tage innerhalb eines Monats korrekt", () => {
    vi.setSystemTime(new Date("2025-04-24"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 0, months: 0, days: 7 });
  });

  it("behandelt Monatsübergang korrekt (Tage < 0)", () => {
    // 1. Mai, Geburtstag am 17. April: 0 Jahre, 0 Monate, 14 Tage
    vi.setSystemTime(new Date("2025-05-01"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 0, months: 0, days: 14 });
  });

  it("behandelt Jahresübergang korrekt (Monate < 0)", () => {
    // 1. März 2026, Geburtstag am 17. April 2025: 0 Jahre, 10 Monate, 12 Tage
    vi.setSystemTime(new Date("2026-03-01"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 0, months: 10, days: 12 });
  });

  it("berechnet mehrere Jahre und Monate und Tage korrekt", () => {
    vi.setSystemTime(new Date("2028-06-20"));
    const result = calcAge("2025-04-17");
    expect(result).toEqual({ years: 3, months: 2, days: 3 });
  });
});
