import { Hono } from "hono";
import { getImage } from "../r2/images";
import type { Bindings } from "../index";

export const imageRoutes = new Hono<{ Bindings: Bindings }>();

// Proxy route: /api/images/:key
// Serves images from private R2 bucket – never exposes R2 URLs directly
imageRoutes.get("/:key{.+}", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));

  // Security: only allow keys under dogs/ prefix
  if (!key.startsWith("dogs/")) {
    return c.text("Not found", 404);
  }

  const object = await getImage(c.env.IMAGES, key);

  if (!object) {
    return c.text("Image not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400"); // cache 1 day

  return new Response(object.body, { headers });
});
