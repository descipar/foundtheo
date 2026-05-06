# 🐾 foundtheo

Eine Webseite für Theos QR-Code-Hundehalsung. Wenn jemand den Badge scannt, landet er auf einer Seite mit Theos Infos, Fotos und Kontaktmöglichkeit zum Besitzer.

Live: **[foundtheo.de](https://foundtheo.de)**

---

## Tech Stack

- **[Hono](https://hono.dev/)** – TypeScript Web Framework
- **[Cloudflare Workers](https://workers.cloudflare.com/)** – Serverless Runtime
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** – SQLite-Datenbank (Scan-Tracking)
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** – Objekt-Storage (Fotos)
- **GitHub Actions** – CI/CD Deploy-Pipeline

## Features

- Mehrsprachig (DE/EN) – automatische Spracherkennung via URL-Parameter
- Badge-Themes: adesso, Nemetschek, Direkt – automatisch nach Badge-URL, per Klick wechselbar
- Badge-Übersicht unter `/theo/badges` mit Karten für alle Badge-Typen und Live-Scan-Zählern
- Scan-Tracking pro Badge-Typ (QR-Code vs. Direktaufruf) inkl. Land und Stadt
- Open Graph + Twitter Card Meta-Tags für Link-Previews (WhatsApp, iMessage, etc.)
- E-Mail-Benachrichtigung bei QR-Scan via Resend (optional, nur wenn `RESEND_API_KEY` gesetzt)
- Foto-Galerie mit Lightbox
- Like-Funktion pro Bild – Heart-Overlay mit Zähler, Toggle (Like/Unlike) via localStorage, optimistisches Update ohne Wartezeit
- Admin-Interface unter `/admin` mit Scan-Statistiken, Weltkarte, Geo-Balkendiagrammen und Like-Verwaltung (passwortgeschützt)

---

## Tests

```bash
npm test                 # alle Tests (Unit + Integration)
npm run test:unit        # nur Unit Tests (Node-Environment)
npm run test:integration # nur Integration Tests (Workers-Runtime mit Miniflare)
npm run test:watch       # Unit Tests im Watch-Modus
```

**Unit Tests** (`src/test/unit/`) – reine Funktionen ohne CF-Bindings:
- `calcAge()` – Altersberechnung inkl. Monats-/Jahresübergänge
- `pickImages()` – Fisher-Yates Shuffle, Keine Duplikate, Mutation-Safety
- `detectLang()` + `translations.age()` – Spracherkennung und Pluralformen
- `sendScanNotification()` – Resend API-Aufruf, Silent-Fail bei Fehler/Netzwerkproblem, UA-Kürzung

**Integration Tests** (`src/test/integration/`) – laufen in der echten Workers-Runtime via Miniflare:
- `recordScan()` – Deduplication (IP-Hash, Null-IP, Badge-Trennung)
- Route `/theo/:badge` – 200 für gültige Badges, 404 für ungültige
- Route `/theo/badges` – 200, HTML-Content
- Route `/api/images/:key` – Sicherheitscheck (kein Zugriff außerhalb `dogs/`)
- Route `/api/like/:key` und `/api/like/unlike/:key` – Key-Validierung (403 bei Path-Traversal), Zähler-Logik
- Route `/admin` – 401 ohne Auth, 200 mit richtigem Passwort
- Route `/admin/delete` und `/admin/reset-likes` – Auth-Check, Redirect, DB-Effekte
- Host-Check Middleware – workers.dev-Zugriff gesperrt, foundtheo.de erlaubt
- `getLikes`, `incrementLike`, `decrementLike` (MAX-Clamp auf 0), `resetLikes` – D1-Funktionen
- Open Graph Meta-Tags (`og:title`, `og:description`, `og:url`, `twitter:card`)

---

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Lokale D1-Datenbank mit Testdaten befüllen (optional):

```bash
npm run seed:dev
```

Secrets für lokale Entwicklung in `.dev.vars` eintragen (wird nicht committed):

```
THEO_EMAIL=deine@email.de
THEO_PHONE=+49123456789
THEO_EMAIL_NEMETSCHEK=andere@email.de
THEO_PHONE_NEMETSCHEK=+49123456789
THEO_EMAIL_DIRECT=andere@email.de
THEO_PHONE_DIRECT=+49123456789
ADMIN_PASSWORD=beliebig
```

Per-Badge-Kontakte sind optional – fehlt ein Wert, wird auf `THEO_EMAIL` / `THEO_PHONE` zurückgefallen.

---

## Deployment

Deploy läuft automatisch via GitHub Actions bei jedem Push auf `main`.

Benötigte GitHub Secrets (werden vom CI/CD-Workflow verwendet):

| Secret                    | Beschreibung                                          |
|---------------------------|-------------------------------------------------------|
| `CLOUDFLARE_API_TOKEN`    | Cloudflare API Token                                  |
| `CLOUDFLARE_ACCOUNT_ID`   | Cloudflare Account ID                                 |
| `THEO_EMAIL`              | Standard-Kontakt-E-Mail                               |
| `THEO_PHONE`              | Standard-Kontakt-Telefon                              |
| `THEO_EMAIL_NEMETSCHEK`   | Kontakt-E-Mail für `/theo/nemetschek` (optional)      |
| `THEO_PHONE_NEMETSCHEK`   | Kontakt-Telefon für `/theo/nemetschek` (optional)     |
| `THEO_EMAIL_DIRECT`       | Kontakt-E-Mail für direkte Seite `/theo` (optional)   |
| `THEO_PHONE_DIRECT`       | Kontakt-Telefon für direkte Seite `/theo` (optional)  |
| `RESEND_API_KEY`          | Resend API-Key für Scan-Benachrichtigungen (optional) |

Einmalig manuell setzen (wird nicht vom Workflow verwaltet):

```bash
wrangler secret put ADMIN_PASSWORD
```

Manuell deployen:

```bash
npx wrangler deploy
```

---

## Datenbank (D1)

```bash
# Migrations lokal anwenden
npx wrangler d1 migrations apply theo-badge

# Migrations in Produktion anwenden
npx wrangler d1 migrations apply theo-badge --remote
```

---

## Admin-Interface

Erreichbar unter `https://foundtheo.de/admin` – geschützt durch HTTP Basic Auth.

Zeigt: Scan-Gesamtzahl, Aufschlüsselung nach Badge und Quelle (QR vs. Direkt), Scans der letzten 30 Tage als Balkendiagramm, Top-Länder und Top-Städte als Tabelle + Balkendiagramm, Weltkarte als SVG-Heatmap.

Geo-Daten (Land, Stadt) werden automatisch aus Cloudflares Request-Metadaten gespeichert – ohne Personenbezug, nur IP-Hash wird hinterlegt.

Scans können direkt im Admin-Interface gelöscht werden – entweder alle auf einmal oder gefiltert nach Badge-Typ (adesso, nemetschek, direct).

Alle Like-Zähler lassen sich ebenfalls per Klick im Admin zurücksetzen. Neu hochgeladene Bilder starten automatisch bei 0 – kein manuelles Eingreifen nötig.

```bash
# Passwort einmalig in Produktion setzen
wrangler secret put ADMIN_PASSWORD

# Scanzähler alternativ per CLI zurücksetzen
npx wrangler d1 execute theo-badge --remote --command "DELETE FROM scans;"
```

---

## Scan-Benachrichtigungen (Resend)

Bei jedem QR-Scan wird optional eine E-Mail an `THEO_EMAIL` gesendet (Badge, Uhrzeit, Standort, Gerät). Voraussetzung ist ein Resend-Account und ein gesetzter `RESEND_API_KEY`.

**Einrichtung:**

1. Account anlegen auf [resend.com](https://resend.com) (kostenlos)
2. Domain verifizieren: Resend → Domains → `foundtheo.de` hinzufügen → die angezeigten DNS-Einträge (DKIM, SPF) in Cloudflare DNS eintragen
3. API Key erstellen: Resend → API Keys → Key kopieren
4. Key als GitHub Secret `RESEND_API_KEY` hinterlegen → wird beim nächsten Deploy automatisch als Worker Secret gesetzt

**Kosten:** Free-Tier (0 €) reicht mit 3.000 Mails/Monat und 100/Tag für normale Nutzung aus.

Ohne gesetzten `RESEND_API_KEY` läuft alles normal – es werden nur keine Benachrichtigungen verschickt.

---

## Foto-Upload Script

Fotos aus einem lokalen Ordner in den R2 Bucket hochladen. YOLO erkennt automatisch Bilder mit Personen und filtert sie heraus.

### Setup

```bash
pip3 install ultralytics pillow pillow-heif tqdm boto3
```

Credentials in `scripts/.env` eintragen (wird nicht committed):

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_ENDPOINT=https://<account-id>.eu.r2.cloudflarestorage.com
```

Credentials erstellen: Cloudflare Dashboard → R2 → **Manage R2 API Tokens** → Object Read & Write  
Hinweis: EU-Bucket benötigt den EU-spezifischen Endpoint (`.eu.r2.cloudflarestorage.com`).

Verbindung testen:

```bash
python3 scripts/test_r2.py
```

### Workflow

```bash
# 1. Dry-run: Bilder prüfen und in Vorschau-Ordner sortieren
python3 scripts/upload_photos.py --folder photos --dry-run --skip-r2-check

# → photos/preview_upload/  – würde hochgeladen werden (kein Mensch erkannt)
# → photos/preview_person/  – übersprungen (Mensch erkannt)

# 2. Vorschau-Ordner manuell prüfen, ggf. Bilder verschieben

# 3. Upload aus preview_upload/
python3 scripts/upload_photos.py --upload-preview
```

HEIC/HEIF-Dateien werden automatisch nach JPEG konvertiert.

### Alle Optionen

| Flag | Beschreibung |
|------|-------------|
| `--folder <pfad>` | Lokaler Ordner mit Fotos |
| `--dry-run` | Nur simulieren, nichts hochladen |
| `--skip-r2-check` | R2-Prüfung überspringen |
| `--upload-preview` | Bilder aus `preview_upload/` hochladen |

---

Dieses Projekt wurde mit Unterstützung von [Claude](https://claude.ai) (KI-Assistent von Anthropic) entwickelt.
