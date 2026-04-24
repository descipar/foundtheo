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
- Scan-Tracking pro Badge-Typ (QR-Code vs. Direktaufruf)
- Foto-Galerie mit Lightbox
- Automatischer Foto-Upload mit Personenerkennung (YOLO)

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

## Foto-Upload Script

Fotos aus einem lokalen Ordner in den R2 Bucket hochladen. YOLO erkennt automatisch Bilder mit Personen und filtert sie heraus.

### Setup

```bash
pip3 install ultralytics pillow pillow-heif requests tqdm boto3
```

R2 API Credentials in `scripts/upload_photos.py` eintragen:

```python
R2_ACCOUNT_ID = "..."
R2_ACCESS_KEY = "..."
R2_SECRET_KEY = "..."
```

Credentials erstellen: Cloudflare Dashboard → R2 → **Manage R2 API Tokens**

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
