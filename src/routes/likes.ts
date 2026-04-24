import { Hono } from "hono";
import { incrementLike, decrementLike } from "../db/likes";
import type { Bindings } from "../index";

export const likesRoutes = new Hono<{ Bindings: Bindings }>();

/** Sicherheitscheck: Nur Keys mit Präfix "dogs/" erlauben */
function isValidKey(key: string): boolean {
  return key.startsWith("dogs/");
}

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

/**
 * POST /api/unlike/:key
 * Verringert den Like-Zähler um 1 (Minimum 0) – ermöglicht das Zurücknehmen
 * eines Likes innerhalb derselben Session (ohne Reload).
 * Antwort: { cnt: number }
 */
likesRoutes.post("/unlike/:key{.+}", async (c) => {
  const rawKey = c.req.param("key");
  if (!isValidKey(rawKey)) return c.json({ error: "forbidden" }, 403);

  const newCount = await decrementLike(c.env.DB, rawKey);
  return c.json({ cnt: newCount });
});
