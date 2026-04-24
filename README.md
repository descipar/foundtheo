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
- Badge-Themes: adesso, Nemetschek, Standard – per Klick wechselbar
- Scan-Tracking pro Badge-Typ (QR-Code vs. Direktaufruf) inkl. Land und Stadt
- Foto-Galerie mit Lightbox
- Automatischer Foto-Upload mit Personenerkennung (YOLO)
- Admin-Interface unter `/admin` mit Scan-Statistiken (passwortgeschützt)

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

**Integration Tests** (`src/test/integration/`) – laufen in der echten Workers-Runtime via Miniflare:
- `recordScan()` – Deduplication (IP-Hash, Null-IP, Badge-Trennung)
- Route `/theo/:badge` – 200 für gültige Badges, 404 für ungültige
- Route `/api/images/:key` – Sicherheitscheck (kein Zugriff außerhalb `dogs/`)
- Route `/admin` – 401 ohne Auth, 200 mit richtigem Passwort
- Host-Check Middleware – workers.dev-Zugriff gesperrt, foundtheo.de erlaubt

---

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Secrets für lokale Entwicklung in `.dev.vars` eintragen (wird nicht committed):

```
THEO_EMAIL=deine@email.de
THEO_PHONE=+49123456789
ADMIN_PASSWORD=beliebig
```

---

## Deployment

Deploy läuft automatisch via GitHub Actions bei jedem Push auf `main`.

Benötigte GitHub Secrets:

| Secret | Beschreibung |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `THEO_EMAIL` | Kontakt-E-Mail (Worker Secret) |
| `THEO_PHONE` | Kontakt-Telefon (Worker Secret) |
| `ADMIN_PASSWORD` | Passwort für `/admin` (Worker Secret) |

Worker Secrets einmalig in Produktion setzen (bleiben über Deployments erhalten):

```bash
wrangler secret put THEO_EMAIL
wrangler secret put THEO_PHONE
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

Zeigt: Scan-Gesamtzahl, Aufschlüsselung nach Badge und Quelle (QR vs. Direkt), Scans der letzten 30 Tage als Balkendiagramm, Top-Länder und Top-Städte.

Geo-Daten (Land, Stadt) werden automatisch aus Cloudflares Request-Metadaten gespeichert – ohne Personenbezug, nur IP-Hash wird hinterlegt.

Scans können direkt im Admin-Interface gelöscht werden – entweder alle auf einmal oder gefiltert nach Badge-Typ (adesso, nemetschek, direct).

```bash
# Passwort einmalig in Produktion setzen
wrangler secret put ADMIN_PASSWORD

# Scanzähler alternativ per CLI zurücksetzen
npx wrangler d1 execute theo-badge --remote --command "DELETE FROM scans;"
```

---

## Foto-Upload Script

Fotos aus einem lokalen Ordner in den R2 Bucket hochladen. YOLO erkennt automatisch Bilder mit Personen und filtert sie heraus.

### Setup

```bash
pip3 install ultralytics pillow pillow-heif requests tqdm boto3
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
| `--album <name>` | Google Photos Album (API erforderlich) |
| `--dry-run` | Nur simulieren, nichts hochladen |
| `--skip-r2-check` | R2-Prüfung überspringen |
| `--upload-preview` | Bilder aus `preview_upload/` hochladen |

---

Dieses Projekt wurde mit Unterstützung von [Claude](https://claude.ai) (KI-Assistent von Anthropic) entwickelt.
