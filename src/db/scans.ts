export interface Env {
  DB: D1Database;
}

const DEDUPE_SECONDS = 43200; // 12 Stunden – verhindert Reloads und Doppelscans

export type ScanSource = "qr" | "direct";

/**
 * Records a scan for a dog/badge combination.
 * Deduplicates within DEDUPE_SECONDS for the same ip_hash + badge_id.
 */
export async function recordScan(
  db: D1Database,
  dogId: string,
  badgeId: string,
  ipHash: string | null,
  ua: string | null,
  source: ScanSource = "qr",
  country: string | null = null,
  city: string | null = null
): Promise<void> {
  // Deduplication: skip if same ip_hash + badge_id within DEDUPE_SECONDS
  if (ipHash) {
    const recent = await db
      .prepare(
        `SELECT id FROM scans
         WHERE ip_hash = ? AND badge_id = ?
           AND scanned_at >= datetime('now', '-${DEDUPE_SECONDS} seconds')
         LIMIT 1`
      )
      .bind(ipHash, badgeId)
      .first();

    if (recent) return;
  }

  await db
    .prepare(
      `INSERT INTO scans (dog_id, badge_id, ip_hash, ua, source, country, city)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(dogId, badgeId, ipHash, ua, source, country, city)
    .run();
}

export interface ScanStats {
  adesso: number;
  nemetschek: number;
  direct: number;
}

/**
 * Returns scan counts per badge and direct visits for a given dog.
 */
export async function getScanStats(
  db: D1Database,
  dogId: string
): Promise<ScanStats> {
  const rows = await db
    .prepare(
      `SELECT badge_id, COUNT(*) as cnt
       FROM scans WHERE dog_id = ?
       GROUP BY badge_id`
    )
    .bind(dogId)
    .all<{ badge_id: string; cnt: number }>();

  const stats: ScanStats = { adesso: 0, nemetschek: 0, direct: 0 };
  for (const row of rows.results) {
    if (row.badge_id === "adesso") stats.adesso = row.cnt;
    if (row.badge_id === "nemetschek") stats.nemetschek = row.cnt;
    if (row.badge_id === "direct") stats.direct = row.cnt;
  }
  return stats;
}

export interface AdminStats {
  totalScans: number;
  byBadge: { badge_id: string; cnt: number }[];
  last30Days: { day: string; cnt: number }[];
  topCountries: { country: string; cnt: number }[];
  topCities: { city: string; country: string; cnt: number }[];
  bySource: { source: string; cnt: number }[];
}

/**
 * Löscht Scans – entweder alle oder nur für einen bestimmten Badge.
 * Gibt die Anzahl der gelöschten Zeilen zurück.
 */
export async function deleteScans(
  db: D1Database,
  badgeId?: string
): Promise<number> {
  const result = badgeId
    ? await db.prepare("DELETE FROM scans WHERE badge_id = ?").bind(badgeId).run()
    : await db.prepare("DELETE FROM scans").run();
  return result.meta.changes ?? 0;
}

/** Leerer Fallback für den Fall eines DB-Fehlers */
const EMPTY_ADMIN_STATS: AdminStats = {
  totalScans: 0,
  byBadge: [],
  last30Days: [],
  topCountries: [],
  topCities: [],
  bySource: [],
};

/**
 * Returns extended statistics for the admin dashboard.
 * Falls back to empty stats on DB error to prevent a crash.
 */
export async function getAdminStats(db: D1Database): Promise<AdminStats> {
  try {
    const [byBadge, last30Days, topCountries, topCities, bySource] = await Promise.all([
      db.prepare(
        `SELECT badge_id, COUNT(*) as cnt FROM scans GROUP BY badge_id ORDER BY cnt DESC`
      ).all<{ badge_id: string; cnt: number }>(),

      db.prepare(
        `SELECT date(scanned_at) as day, COUNT(*) as cnt
         FROM scans
         WHERE scanned_at >= datetime('now', '-30 days')
         GROUP BY day ORDER BY day ASC`
      ).all<{ day: string; cnt: number }>(),

      db.prepare(
        `SELECT COALESCE(country, '?') as country, COUNT(*) as cnt
         FROM scans GROUP BY country ORDER BY cnt DESC LIMIT 10`
      ).all<{ country: string; cnt: number }>(),

      db.prepare(
        `SELECT COALESCE(city, '?') as city, COALESCE(country, '?') as country, COUNT(*) as cnt
         FROM scans GROUP BY city, country ORDER BY cnt DESC LIMIT 10`
      ).all<{ city: string; country: string; cnt: number }>(),

      db.prepare(
        `SELECT source, COUNT(*) as cnt FROM scans GROUP BY source ORDER BY cnt DESC`
      ).all<{ source: string; cnt: number }>(),
    ]);

    const totalScans = byBadge.results.reduce((sum, r) => sum + r.cnt, 0);

    return {
      totalScans,
      byBadge:      byBadge.results,
      last30Days:   last30Days.results,
      topCountries: topCountries.results,
      topCities:    topCities.results,
      bySource:     bySource.results,
    };
  } catch (err) {
    console.error("getAdminStats: DB-Fehler", err);
    return EMPTY_ADMIN_STATS;
  }
}
