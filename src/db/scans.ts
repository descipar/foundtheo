export interface Env {
  DB: D1Database;
}

const DEDUPE_SECONDS = 30;

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
  source: ScanSource = "qr"
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
      `INSERT INTO scans (dog_id, badge_id, ip_hash, ua, source)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(dogId, badgeId, ipHash, ua, source)
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
