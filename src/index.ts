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

app.route("/theo", theoRoutes);
app.route("/api/images", imageRoutes);

// Statische Assets (Logos etc.) aus public/
app.use("/public/*", serveStatic({ root: "./" }));

// Root → direkte Seite ohne Badge
app.get("/", (c) => c.redirect("/theo"));

export default app;
