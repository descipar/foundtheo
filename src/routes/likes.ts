import { Hono } from "hono";
import { incrementLike } from "../db/likes";
import type { Bindings } from "../index";

export const likesRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/like/:key
 *
 * Erhöht den Like-Zähler für ein Bild.
 * Der Key wird URL-encoded übergeben (z.B. dogs%2Ftheo%2Ffoto.jpg).
 *
 * Sicherheit: Nur Keys mit Präfix "dogs/" sind erlaubt – verhindert
 * missbrauchen des Endpunkts für beliebige Strings.
 *
 * Antwort: { cnt: number } – der neue Zählerstand.
 */
likesRoutes.post("/:key{.+}", async (c) => {
  const rawKey = c.req.param("key");

  // Nur Keys mit bekanntem Präfix erlauben
  if (!rawKey.startsWith("dogs/")) {
    return c.json({ error: "forbidden" }, 403);
  }

  const newCount = await incrementLike(c.env.DB, rawKey);
  return c.json({ cnt: newCount });
});
