/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { TheoPage } from "../components/TheoPage";
import { BadgesPage } from "../components/BadgesPage";
import { calcAge } from "../utils/calcAge";
import { getScanStats } from "../db/scans";
import { getLikes } from "../db/likes";
import { listImageKeys, pickImages } from "../r2/images";
import { detectLang } from "../i18n/translations";
import { getTheme } from "../themes";
import type { Bindings } from "../index";

export const ALLOWED_BADGES = new Set(["adesso", "nemetschek"]);

export const theoRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Hilfsfunktion: Seite rendern.
 * Gezählt wird hier NICHT – das macht das Client-Script per POST /api/scan
 * (siehe routes/scan.ts), damit reine HTML-Scanner/Crawler nicht mitzählen.
 */
async function renderPage(
  env: Bindings,
  badgeId: string,
  lang: string | undefined
) {
  const [allKeys, stats, imageLikes] = await Promise.all([
    listImageKeys(env.IMAGES),
    getScanStats(env.DB, "theo"),
    getLikes(env.DB),
  ]);

  const selectedKeys = pickImages(allKeys);
  const { years, months, days } = calcAge(env.THEO_BIRTH_DATE);
  const detectedLang = detectLang(lang);
  const theme = getTheme(badgeId);

  const badgeContacts = {
    adesso:     { email: env.THEO_EMAIL,                                    phone: env.THEO_PHONE },
    nemetschek: { email: env.THEO_EMAIL_NEMETSCHEK || env.THEO_EMAIL,       phone: env.THEO_PHONE_NEMETSCHEK || env.THEO_PHONE },
    direct:     { email: env.THEO_EMAIL_DIRECT     || env.THEO_EMAIL,       phone: env.THEO_PHONE_DIRECT     || env.THEO_PHONE },
  };
  const activeContact = badgeContacts[badgeId as keyof typeof badgeContacts] ?? badgeContacts.adesso;

  return (
    <TheoPage
      name={env.THEO_NAME}
      breed={env.THEO_BREED}
      title={env.THEO_TITLE}
      badgeNr={env.THEO_BADGE_NR}
      ageYears={years}
      ageMonths={months}
      ageDays={days}
      email={activeContact.email}
      phone={activeContact.phone}
      imageKeys={selectedKeys}
      badge={badgeId}
      theme={theme}
      lang={detectedLang}
      stats={stats}
      imageLikes={imageLikes}
      badgeContacts={badgeContacts}
    />
  );
}

/** Direkter Aufruf: foundtheo.de → keine Badge, source = direct */
theoRoutes.get("/", async (c) => {
  return c.html(
    await renderPage(c.env, "direct", c.req.query("lang"))
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

  return c.html(
    await renderPage(c.env, badge, c.req.query("lang"))
  );
});
