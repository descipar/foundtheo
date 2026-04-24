import { Hono } from "hono";
import { theoRoutes } from "./routes/theo";
import { imageRoutes } from "./routes/images";
import { adminRoutes } from "./routes/admin";
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
  ADMIN_PASSWORD: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// Nur Anfragen von foundtheo.de erlauben – workers.dev und andere Domains sperren
// localhost wird für lokale Entwicklung durchgelassen
app.use("*", async (c, next) => {
  const host = (c.req.header("host") ?? "").split(":")[0]; // Port entfernen
  const allowedHosts = ["foundtheo.de", "www.foundtheo.de", "localhost"];
  if (!allowedHosts.includes(host)) {
    return c.text("Not found", 404);
  }
  await next();
});

app.route("/theo", theoRoutes);
app.route("/api/images", imageRoutes);
app.route("/admin", adminRoutes);

// Statische Assets (Logos etc.) aus public/
app.use("/public/*", serveStatic({ root: "./" }));

// Robots.txt – alle Crawler sperren
app.get("/robots.txt", (c) =>
  c.text("User-agent: *\nDisallow: /", 200, { "Cache-Control": "public, max-age=86400" })
);

// Root → direkte Seite ohne Badge
app.get("/", (c) => c.redirect("/theo"));

export default app;
