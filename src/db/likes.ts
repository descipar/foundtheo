/**
 * Datenbankfunktionen für das Image-Like-System.
 * Tabelle: image_likes (image_key TEXT PRIMARY KEY, cnt INTEGER DEFAULT 0)
 */

/**
 * Gibt alle Like-Zähler als Map zurück: { [image_key]: count }
 * Fehlende Keys → 0 (der Aufrufer nutzt ?? 0 für Defaults).
 */
export async function getLikes(
  db: D1Database
): Promise<Record<string, number>> {
  const rows = await db
    .prepare("SELECT image_key, cnt FROM image_likes")
    .all<{ image_key: string; cnt: number }>();
  return Object.fromEntries(rows.results.map((r) => [r.image_key, r.cnt]));
}

/**
 * Erhöht den Like-Zähler für einen Image-Key um 1.
 * Legt die Zeile automatisch an, falls sie noch nicht existiert.
 * Gibt den neuen Zählerstand zurück.
 */
export async function incrementLike(
  db: D1Database,
  imageKey: string
): Promise<number> {
  const row = await db
    .prepare(
      `INSERT INTO image_likes (image_key, cnt) VALUES (?, 1)
       ON CONFLICT(image_key) DO UPDATE SET cnt = cnt + 1
       RETURNING cnt`
    )
    .bind(imageKey)
    .first<{ cnt: number }>();
  return row?.cnt ?? 1;
}

/**
 * Setzt alle Like-Zähler zurück (löscht alle Zeilen).
 * Neue Bilder starten danach automatisch wieder bei 0.
 */
export async function resetLikes(db: D1Database): Promise<number> {
  const result = await db.prepare("DELETE FROM image_likes").run();
  return result.meta.changes ?? 0;
}
