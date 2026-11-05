import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { recordScan } from "../db/scans";
import { sendScanNotification } from "../email/notify";
import { hashIp } from "../utils/hashIp";
import { isBot } from "../utils/isBot";
import { ALLOWED_BADGES } from "./theo";
import type { Bindings } from "../index";

const COOKIE_MAX_AGE = 43200; // 12 Stunden

export const scanRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/scan  – Body: { "badge": "adesso" | "nemetschek" | "direct" }
 *
 * Scans werden NICHT mehr beim Ausliefern der Seite gezählt, sondern erst, wenn
 * das Client-Script im Browser läuft und diesen Beacon schickt. Scanner/Crawler,
 * die nur HTML abholen, werden so nicht mehr gezählt.
 *
 * Antwort: { counted: boolean } – true nur bei neu eingetragenem Scan.
 */
scanRoutes.post("/", async (c) => {
  // JSON-Content-Type erzwingen: Cross-Origin-Requests brauchen dafür einen
  // CORS-Preflight, den wir nicht beantworten → fremde Seiten können nicht zählen.
  if (!(c.req.header("content-type") ?? "").includes("application/json")) {
    return c.json({ error: "unsupported media type" }, 415);
  }

  let badge: unknown;
  try {
    badge = ((await c.req.json()) as { badge?: unknown }).badge;
  } catch {
    return c.json({ error: "invalid json" }, 400);
  }
  if (typeof badge !== "string" || (badge !== "direct" && !ALLOWED_BADGES.has(badge))) {
    return c.json({ error: "invalid badge" }, 400);
  }

  const ua = c.req.header("user-agent") ?? null;
  if (isBot(ua)) return c.json({ counted: false });

  // Cookie-Dedupe: gleicher Badge in diesem Browser innerhalb von 12h bereits gezählt
  const cookieName = `scanned_${badge}`;
  if (getCookie(c, cookieName)) return c.json({ counted: false });

  const source = badge === "direct" ? "direct" : "qr";
  const cf = c.req.raw.cf as { country?: string; city?: string } | undefined;
  const country = cf?.country ?? null;
  const city = cf?.city ?? null;
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;
  const ipHash = await hashIp(ip, c.env.IP_HASH_SECRET);

  const isNewScan = await recordScan(c.env.DB, "theo", badge, ipHash, ua, source, country, city);

  if (isNewScan && source === "qr" && c.env.RESEND_API_KEY && c.env.THEO_EMAIL) {
    c.executionCtx.waitUntil(
      sendScanNotification(c.env.RESEND_API_KEY, c.env.THEO_EMAIL, {
        badge, source, country, city, ua,
      })
    );
  }

  setCookie(c, cookieName, "1", {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "Lax",
    secure: true,
    path: "/",
  });

  return c.json({ counted: isNewScan });
});
