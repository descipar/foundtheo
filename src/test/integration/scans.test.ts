import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import { recordScan, getScanStats } from "../../db/scans";

// Migrations werden automatisch via wrangler.toml migrations_dir angewendet.

describe("recordScan – Deduplication", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM scans;");
  });

  it("speichert einen neuen Scan", async () => {
    await recordScan(env.DB, "theo", "adesso", "hash123", "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(1);
  });

  it("dedupliziert: zweiter Scan mit gleicher IP + Badge wird ignoriert", async () => {
    await recordScan(env.DB, "theo", "adesso", "hash123", "ua/1.0", "qr");
    await recordScan(env.DB, "theo", "adesso", "hash123", "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(1);
  });

  it("zählt verschiedene Badges getrennt", async () => {
    await recordScan(env.DB, "theo", "adesso", "hash123", "ua/1.0", "qr");
    await recordScan(env.DB, "theo", "nemetschek", "hash123", "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(1);
    expect(stats.nemetschek).toBe(1);
  });

  it("zählt verschiedene IPs für denselben Badge getrennt", async () => {
    await recordScan(env.DB, "theo", "adesso", "hash_a", "ua/1.0", "qr");
    await recordScan(env.DB, "theo", "adesso", "hash_b", "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(2);
  });

  it("speichert Scan ohne IP (null)", async () => {
    await recordScan(env.DB, "theo", "adesso", null, "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(1);
  });

  it("speichert mehrere Scans ohne IP (keine Dedup bei null)", async () => {
    await recordScan(env.DB, "theo", "adesso", null, "ua/1.0", "qr");
    await recordScan(env.DB, "theo", "adesso", null, "ua/1.0", "qr");
    const stats = await getScanStats(env.DB, "theo");
    // Ohne IP kein Dedup → beide werden gezählt
    expect(stats.adesso).toBe(2);
  });

  it("getScanStats gibt 0 zurück, wenn keine Scans vorhanden", async () => {
    const stats = await getScanStats(env.DB, "theo");
    expect(stats.adesso).toBe(0);
    expect(stats.nemetschek).toBe(0);
    expect(stats.direct).toBe(0);
  });
});
