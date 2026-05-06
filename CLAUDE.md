# foundtheo – Projektkontext für Claude

## Was ist das?
Eine kleine öffentliche Webseite für Hund Theo, erreichbar über QR-Codes auf Hundemarken.
Jemand findet Theo, scannt den QR-Code und sieht eine "Found this dog"-Seite mit Bildern und Kontaktdaten.

## Tech Stack
- **Framework**: Hono.js mit TypeScript und JSX
- **Hosting**: Cloudflare Workers
- **Datenbank**: Cloudflare D1 (SQLite) – Datenbankname: `theo-badge`
- **Bilder**: Cloudflare R2 (privat) – Bucketname: `theo-badges-images`, Jurisdiction EU
- **Domain**: foundtheo.de (läuft über Cloudflare)

## Routen
- `GET /theo/:badge` – Öffentliche Seite (badge = `adesso` oder `nemetschek`)
- `GET /api/images/:key` – Bild-Proxy für privaten R2 Bucket
- `GET /` – Redirect zu `/theo/adesso`

## Wichtige Entscheidungen
- KEIN Next.js, KEIN next-on-pages – reines Hono.js direkt auf Workers
- Bilder liegen unter `dogs/theo/` im R2 Bucket, NIE direkt öffentlich erreichbar
- Scan-Tracking mit Deduplizierung (Cookie 12h + IP-Hash+Badge 12h in D1)
- Bildauswahl: zufällige Auswahl aus R2 (Fisher-Yates mit crypto.getRandomValues) – bei jedem Aufruf neu
- IP wird als SHA-256-Hash gespeichert, nie im Klartext

## Hund Theo
- Name: Theo
- Rasse: Labrador
- Geburtsdatum: 2025-04-17
- Besitzer-E-Mail: siehe `THEO_EMAIL` Secret

## Projektstruktur
```
src/
  index.ts              – Hono App Entry Point, Bindings-Definition
  routes/
    theo.tsx            – /theo/:badge Route (Scan + Seitenrendering)
    images.ts           – /api/images/:key Proxy
  components/
    TheoPage.tsx        – JSX Komponente (UI der Found-Seite)
  db/
    scans.ts            – D1 Scan Tracking Logik
  r2/
    images.ts           – R2 Bildlisting und deterministische Auswahl
migrations/
  0001_create_scans.sql – D1 Schema
wrangler.toml           – Cloudflare Konfiguration (D1 + R2 Bindings)
```

## Deployment
```bash
npm install
wrangler d1 migrations apply theo-badge --remote
wrangler deploy
```

## Lokale Entwicklung
```bash
npm run dev
```

## Umgebungsvariablen (wrangler.toml [vars])
- `THEO_BIRTH_DATE` – Geburtsdatum (YYYY-MM-DD)
- `THEO_EMAIL` – Kontakt-E-Mail
- `THEO_NAME` – Name des Hundes
- `THEO_BREED` – Rasse

## Was NICHT geändert werden soll
- Keine neuen Badges ohne Eintrag in `ALLOWED_BADGES` (src/routes/theo.tsx)
- Keine direkten R2-URLs nach außen geben
- Keine IP-Adressen im Klartext in D1 speichern
