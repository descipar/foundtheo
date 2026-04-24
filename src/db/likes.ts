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
 * Verringert den Like-Zähler für einen Image-Key um 1 (Minimum: 0).
 * Gibt den neuen Zählerstand zurück. Tut nichts, wenn der Key unbekannt ist.
 */
export async function decrementLike(
  db: D1Database,
  imageKey: string
): Promise<number> {
  const row = await db
    .prepare(
      `UPDATE image_likes SET cnt = MAX(0, cnt - 1)
       WHERE image_key = ?
       RETURNING cnt`
    )
    .bind(imageKey)
    .first<{ cnt: number }>();
  return row?.cnt ?? 0;
}

/**
 * Setzt alle Like-Zähler zurück (löscht alle Zeilen).
 * Neue Bilder starten danach automatisch wieder bei 0.
 * Wirft bei DB-Fehler – konsistent mit dem Error-Handling in den Routes.
 */
export async function resetLikes(db: D1Database): Promise<number> {
  try {
    const result = await db.prepare("DELETE FROM image_likes").run();
    return result.meta.changes ?? 0;
  } catch (err) {
    console.error("resetLikes: DB-Fehler", err);
    throw new Error("Likes konnten nicht zurückgesetzt werden");
  }
}
