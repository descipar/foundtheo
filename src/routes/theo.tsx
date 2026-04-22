/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { TheoPage, calcAge } from "../components/TheoPage";
import { recordScan, getScanStats } from "../db/scans";
import { listImageKeys, pickImages } from "../r2/images";
import { detectLang } from "../i18n/translations";
import { getTheme } from "../themes";
import type { Bindings } from "../index";

const ALLOWED_BADGES = new Set(["adesso", "nemetschek"]);

export const theoRoutes = new Hono<{ Bindings: Bindings }>();

/** Hilfsfunktion: IP hashen */
async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hilfsfunktion: Seite rendern */
async function renderPage(
  env: Bindings,
  executionCtx: ExecutionContext,
  badgeId: string,
  source: "qr" | "direct",
  ip: string | null,
  ua: string | null,
  lang: string | undefined
) {
  const ipHash = await hashIp(ip);

  executionCtx.waitUntil(
    recordScan(env.DB, "theo", badgeId, ipHash, ua, source)
  );

  const [allKeys, stats] = await Promise.all([
    listImageKeys(env.IMAGES),
    getScanStats(env.DB, "theo"),
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
    />
  );
}

/** Direkter Aufruf: foundtheo.de → keine Badge, source = direct */
theoRoutes.get("/", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  return c.html(
    await renderPage(c.env, c.executionCtx, "direct", "direct", ip, ua, c.req.query("lang"))
  );
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
    await renderPage(c.env, c.executionCtx, badge, "qr", ip, ua, c.req.query("lang"))
  );
});
