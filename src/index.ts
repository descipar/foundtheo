import { Hono } from "hono";
import { theoRoutes } from "./routes/theo";
import { imageRoutes } from "./routes/images";
import { serveStatic } from "hono/cloudflare-workers";

export interface Bindings {
  DB: D1Database;
  IMAGES: R2Bucket;
  THEO_BIRTH_DATE: string;
  THEO_EMAIL: string;
  THEO_PHONE: string;
  THEO_NAME: string;
  THEO_BREED: string;
  THEO_TITLE: string;
  THEO_BADGE_NR: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// Nur Anfragen von foundtheo.de erlauben – workers.dev und andere Domains sperren
app.use("*", async (c, next) => {
  const host = c.req.header("host") ?? "";
  if (!host.includes("foundtheo.de")) {
    return c.text("Not found", 404);
  }
  await next();
});

app.route("/theo", theoRoutes);
app.route("/api/images", imageRoutes);

// Statische Assets (Logos etc.) aus public/
app.use("/public/*", serveStatic({ root: "./" }));

// Robots.txt – alle Crawler sperren
app.get("/robots.txt", (c) =>
  c.text("User-agent: *\nDisallow: /", 200, { "Cache-Control": "public, max-age=86400" })
);

// Root → direkte Seite ohne Badge
app.get("/", (c) => c.redirect("/theo"));

export default app;
