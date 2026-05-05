import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import { recordScan, getScanStats, getAdminStats } from "../../db/scans";

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

describe("getAdminStats", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM scans;");
  });

  it("gibt leere Statistiken zurück wenn keine Scans vorhanden", async () => {
    const stats = await getAdminStats(env.DB);
    expect(stats.totalScans).toBe(0);
    expect(stats.byBadge).toEqual([]);
    expect(stats.last30Days).toEqual([]);
    expect(stats.topCountries).toEqual([]);
    expect(stats.topCities).toEqual([]);
    expect(stats.bySource).toEqual([]);
  });

  it("zählt totalScans über alle Badges korrekt", async () => {
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, source) VALUES ('theo','adesso','qr'), ('theo','nemetschek','qr')"
    ).run();
    const stats = await getAdminStats(env.DB);
    expect(stats.totalScans).toBe(2);
  });

  it("liefert byBadge mit korrekter Aufschlüsselung", async () => {
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, source) VALUES ('theo','adesso','qr'), ('theo','adesso','qr'), ('theo','nemetschek','qr')"
    ).run();
    const stats = await getAdminStats(env.DB);
    const adesso = stats.byBadge.find((r) => r.badge_id === "adesso");
    const nemetschek = stats.byBadge.find((r) => r.badge_id === "nemetschek");
    expect(adesso?.cnt).toBe(2);
    expect(nemetschek?.cnt).toBe(1);
  });

  it("liefert topCountries sortiert nach Häufigkeit", async () => {
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, source, country) VALUES ('theo','adesso','qr','DE'), ('theo','adesso','qr','DE'), ('theo','adesso','qr','AT')"
    ).run();
    const stats = await getAdminStats(env.DB);
    expect(stats.topCountries[0].country).toBe("DE");
    expect(stats.topCountries[0].cnt).toBe(2);
    expect(stats.topCountries[1].country).toBe("AT");
    expect(stats.topCountries[1].cnt).toBe(1);
  });

  it("liefert bySource mit Trennung von qr und direct", async () => {
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, source) VALUES ('theo','adesso','qr'), ('theo','adesso','qr'), ('theo','direct','direct')"
    ).run();
    const stats = await getAdminStats(env.DB);
    const qr = stats.bySource.find((r) => r.source === "qr");
    const direct = stats.bySource.find((r) => r.source === "direct");
    expect(qr?.cnt).toBe(2);
    expect(direct?.cnt).toBe(1);
  });

  it("liefert last30Days nur für Scans innerhalb der letzten 30 Tage", async () => {
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, source, scanned_at) VALUES ('theo','adesso','qr', datetime('now')), ('theo','adesso','qr', datetime('now', '-31 days'))"
    ).run();
    const stats = await getAdminStats(env.DB);
    const total = stats.last30Days.reduce((sum, r) => sum + r.cnt, 0);
    expect(total).toBe(1);
  });
});
