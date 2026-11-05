import { Hono } from "hono";
import { theoRoutes } from "./routes/theo";
import { imageRoutes } from "./routes/images";
import { adminRoutes } from "./routes/admin";
import { likesRoutes } from "./routes/likes";

export interface Bindings {
  DB: D1Database;
  IMAGES: R2Bucket;
  THEO_BIRTH_DATE: string;
  THEO_EMAIL: string;
  THEO_PHONE: string;
  THEO_EMAIL_NEMETSCHEK?: string;
  THEO_PHONE_NEMETSCHEK?: string;
  THEO_EMAIL_DIRECT?: string;
  THEO_PHONE_DIRECT?: string;
  THEO_NAME: string;
  THEO_BREED: string;
  THEO_TITLE: string;
  THEO_BADGE_NR: string;
  ADMIN_PASSWORD: string;
  RESEND_API_KEY?: string;
  IP_HASH_SECRET?: string;
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
app.route("/api/like", likesRoutes);
app.route("/admin", adminRoutes);

// Robots.txt – alle Crawler sperren
app.get("/robots.txt", (c) =>
  c.text("User-agent: *\nDisallow: /", 200, { "Cache-Control": "public, max-age=86400" })
);

// Root → direkte Seite ohne Badge
app.get("/", (c) => c.redirect("/theo"));

export default app;
