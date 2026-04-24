/** @jsxImportSource hono/jsx */
import { Hono, type Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { TheoPage } from "../components/TheoPage";
import { BadgesPage } from "../components/BadgesPage";
import { calcAge } from "../utils/calcAge";
import { recordScan, getScanStats } from "../db/scans";
import { getLikes } from "../db/likes";
import { listImageKeys, pickImages } from "../r2/images";
import { detectLang } from "../i18n/translations";
import { getTheme } from "../themes";
import type { Bindings } from "../index";

const ALLOWED_BADGES  = new Set(["adesso", "nemetschek"]);
const COOKIE_MAX_AGE  = 43200; // 12 Stunden

export const theoRoutes = new Hono<{ Bindings: Bindings }>();

/** Hilfsfunktion: IP hashen */
async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hilfsfunktion: Seite rendern */
async function renderPage(
  c: Context<{ Bindings: Bindings }>,
  env: Bindings,
  executionCtx: ExecutionContext,
  badgeId: string,
  source: "qr" | "direct",
  ip: string | null,
  ua: string | null,
  lang: string | undefined
) {
  // Geo-Daten aus Cloudflare Request Metadata (nur in Produktion verfügbar)
  const cf = c.req.raw.cf as { country?: string; city?: string } | undefined;
  const country = cf?.country ?? null;
  const city = cf?.city ?? null;

  // Cookie-Check: gleicher Badge bereits innerhalb der letzten Stunde gezählt?
  const cookieName = `scanned_${badgeId}`;
  const alreadyCounted = getCookie(c, cookieName);

  if (!alreadyCounted) {
    const ipHash = await hashIp(ip);
    executionCtx.waitUntil(
      recordScan(env.DB, "theo", badgeId, ipHash, ua, source, country, city)
    );
    setCookie(c, cookieName, "1", {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      path: "/",
    });
  }

  const [allKeys, stats, imageLikes] = await Promise.all([
    listImageKeys(env.IMAGES),
    getScanStats(env.DB, "theo"),
    getLikes(env.DB),
  ]);

  const selectedKeys = pickImages(allKeys);
  const { years, months, days } = calcAge(env.THEO_BIRTH_DATE);
  const detectedLang = detectLang(lang);
  const theme = getTheme(badgeId);

  return (
    <TheoPage
      name={env.THEO_NAME}
      breed={env.THEO_BREED}
      title={env.THEO_TITLE}
      badgeNr={env.THEO_BADGE_NR}
      ageYears={years}
      ageMonths={months}
      ageDays={days}
      email={env.THEO_EMAIL}
      phone={env.THEO_PHONE}
      imageKeys={selectedKeys}
      badge={badgeId}
      theme={theme}
      lang={detectedLang}
      stats={stats}
      imageLikes={imageLikes}
    />
  );
}

/** Direkter Aufruf: foundtheo.de → keine Badge, source = direct */
theoRoutes.get("/", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  return c.html(
    await renderPage(c, c.env, c.executionCtx, "direct", "direct", ip, ua, c.req.query("lang"))
  );
});

/** Badge-Übersicht: /theo/badges */
theoRoutes.get("/badges", async (c) => {
  const stats = await getScanStats(c.env.DB, "theo");
  return c.html(<BadgesPage stats={stats} />);
});

/** QR-Scan: /theo/adesso oder /theo/nemetschek → source = qr */
theoRoutes.get("/:badge", async (c) => {
  const badge = c.req.param("badge").toLowerCase();

  if (!ALLOWED_BADGES.has(badge)) {
    return c.notFound();
  }

  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  return c.html(
    await renderPage(c, c.env, c.executionCtx, badge, "qr", ip, ua, c.req.query("lang"))
  );
});
