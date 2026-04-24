import { Hono } from "hono";
import { incrementLike, decrementLike } from "../db/likes";
import type { Bindings } from "../index";

export const likesRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Sicherheitscheck: Nur wohlgeformte Image-Keys erlauben.
 * Erlaubt: dogs/theo/foto.jpg, dogs/theo/bild-01.png
 * Verhindert: Path-Traversal (dogs/../etc/passwd), beliebige Strings
 */
function isValidKey(key: string): boolean {
  return /^dogs\/[a-zA-Z0-9_\-./]+\.(jpg|jpeg|png|webp|avif)$/i.test(key)
    && !key.includes("..");
}

/**
 * POST /api/like/unlike/:key
 * Verringert den Like-Zähler um 1 (Minimum 0) – ermöglicht das Zurücknehmen
 * eines Likes innerhalb derselben Session (ohne Reload).
 * Antwort: { cnt: number }
 *
 * WICHTIG: Muss VOR /:key{.+} registriert werden, damit Hono nicht
 * "unlike/dogs/..." als Key der Like-Route matched.
 */
likesRoutes.post("/unlike/:key{.+}", async (c) => {
  const rawKey = c.req.param("key");
  if (!isValidKey(rawKey)) return c.json({ error: "forbidden" }, 403);

  const newCount = await decrementLike(c.env.DB, rawKey);
  return c.json({ cnt: newCount });
});

/**
 * POST /api/like/:key
 * Erhöht den Like-Zähler um 1.
 * Antwort: { cnt: number }
 */
likesRoutes.post("/:key{.+}", async (c) => {
  const rawKey = c.req.param("key");
  if (!isValidKey(rawKey)) return c.json({ error: "forbidden" }, 403);

  const newCount = await incrementLike(c.env.DB, rawKey);
  return c.json({ cnt: newCount });
});
