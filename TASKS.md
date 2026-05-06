# foundtheo – Änderungswünsche

## 🟡 Offen

- [ ] **Geburtstags-Easter-Egg**: Am 17. April zeigt die Seite eine kleine Animation oder einen Hinweis zu Theos Geburtstag (z.B. Konfetti, Banner „Heute hat Theo Geburtstag 🎂"). Datum-Check serverseitig in `renderPage` per `THEO_BIRTH_DATE`, kein clientseitiges Date-Parsing nötig.

## ✅ Erledigt

- [x] Open Graph + Twitter Card Meta-Tags auf der Theo-Seite für Link-Previews (WhatsApp, iMessage etc.)
- [x] E-Mail-Benachrichtigung bei QR-Scan via Resend API (`src/email/notify.ts`) – silent fail, nur wenn `RESEND_API_KEY` gesetzt
- [x] Admin-Weltkarte: SVG-Heatmap (Robinson-Projektion, 39 Länder) zeigt Scan-Herkunft farblich gewichtet
- [x] Admin: GeoBarChart für Top-Länder und Top-Städte (Balkendiagramm zusätzlich zur Tabelle)
- [x] Seed-Daten für lokale Entwicklung (`scripts/seed_dev.sql`, `npm run seed:dev`) mit realistischen Testscans aus mehreren Ländern
- [x] Per-Badge Kontaktdaten: `/theo/nemetschek` und direkte Seite `/theo` können eigene E-Mail/Telefon über optionale Worker Secrets (`THEO_EMAIL_NEMETSCHEK`, `THEO_PHONE_NEMETSCHEK`, `THEO_EMAIL_DIRECT`, `THEO_PHONE_DIRECT`) bekommen – Fallback auf Standard-Secrets
- [x] Test-Coverage erweitert (93 Tests): `db/likes.ts` komplett (getLikes, incrementLike, decrementLike MAX-Clamp, resetLikes), Like/Unlike-Routen inkl. Key-Validierung, `/theo/badges`, Admin-Mutations (delete, reset-likes); Bugfix: Unlike-Route war durch falsche Hono-Registrierungsreihenfolge unerreichbar
- [x] Badge-Übersicht unter `/theo/badges`: Karten für alle Badge-Typen mit Theme-Farben und Live-Scan-Zählern, Links zu den einzelnen Badge-Seiten
- [x] Image-Like-Feature: Heart-Overlay auf jedem Bild, Like-Zähler per D1 (`image_likes`-Tabelle), Toggle (Like/Unlike) per localStorage, rein optimistisches Update (kein inflight-Lock), Admin-Reset-Button, neue Bilder starten automatisch bei 0
- [x] Admin-Interface: Delete-Buttons immer für alle Badge-Typen sichtbar (adesso, nemetschek, direct) – unabhängig von vorhandenen Scan-Daten
- [x] Admin-Interface: CSS in eigene Datei `adminStyles.ts` ausgelagert, keine Inline-Styles mehr in AdminPage
- [x] Admin-Interface: Sub-Komponenten (StatCard, BarChart, StatsTable, DeletePanel) für bessere Lesbarkeit
- [x] Admin-Interface: Scans löschen per UI – alle oder gefiltert nach Badge-Typ
- [x] Admin-Interface: Link zur Hauptseite im Admin-Header, Admin-Link im Footer der Hauptseite
- [x] Admin-Interface (`/admin`): Scan-Statistiken, Geo-Daten, Scans der letzten 30 Tage, Top-Länder/Städte – passwortgeschützt via HTTP Basic Auth
- [x] Geo-Daten (Land, Stadt) aus Cloudflare Request-Metadaten in D1 gespeichert – kein Personenbezug
- [x] D1 Migration 0003: `country` und `city` Spalten hinzugefügt
- [x] Theme-Daten-Deduplizierung: `clientScript.ts` nutzt `JSON.stringify(clientThemes)` statt doppelter Pflege
- [x] Foto-Hint in Galerie: kleiner Hinweistext unter den Thumbnails
- [x] Unit Tests (Vitest): calcAge(), pickImages(), detectLang(), translations.age() – 27 Tests
- [x] Integration Tests (Cloudflare Workers Pool): recordScan() Deduplizierung, Routen /theo/:badge (200/404), /api/images/:key Sicherheitscheck, Host-Check Middleware – 19 Tests
- [x] Security-Fix: Host-Check-Middleware von `includes("foundtheo.de")` auf Exact-Match umgestellt (verhindert bypass via foundtheo.descipar.workers.dev)
- [x] deploy.yml: Test-Schritt (`npm test`) vor Deploy eingebaut
- [x] Scan-Deduplication: Cookie (12h) verhindert Reload-Zählung, D1-seitige IP+Badge-Sperre für 12 Stunden als serverseitiger Schutz
- [x] Domain-Setup: foundtheo.de als Custom Domain, HTTPS-Redirect via Cloudflare, Fritz!Box DNS-Rebind-Schutz als Exception
- [x] Security: Host-Check Middleware gegen workers.dev-Zugriff, robots.txt für Crawler-Sperrung, localhost für lokale Entwicklung freigeschaltet
- [x] Foto-Upload Script: scripts/upload_photos.py mit YOLO-Personenerkennung, HEIC/HEIF→JPEG, Dry-run mit Preview-Ordnern, R2 via boto3 mit EU-Endpoint
- [x] R2 Verbindungstest: scripts/test_r2.py
- [x] README.md erstellt mit Tech Stack, Deployment, D1-Migrations und Foto-Upload Workflow
- [x] Nemetschek Corporate Navy Theme (#1B3A6B) aus offizieller Präsentation
- [x] StatsBar: 🌐 Direct-Button klickbar, Hinweistext, Tooltips für alle Theme-Buttons
- [x] Infoleiste: Emojis vor Rasse (🐶) und Alter (🎂), Lieblingssnack als info-row
- [x] TheoPage in kleinere Komponenten aufgeteilt (IdHeader, StatsBar, ImageGallery, ContactCard, CardFooter)
- [x] Nemetschek-Theme: Farben auf Corporate Black/Charcoal (#1A1A1A) gesetzt
- [x] CSS auf CSS Custom Properties (--color-primary etc.) umgestellt – Theme wechselbar ohne Reload
- [x] Theme-Switching per Klick auf Scan-Zähler in Stats-Bar (ohne Scan zu erhöhen)
- [x] GitHub Version Control: .gitignore, initialer Commit, SSH-Push
- [x] GitHub Actions Deploy-Pipeline: automatisches Deploy bei Push auf main
- [x] Cloudflare Production eingerichtet: D1 + R2 Bucket, Worker Secrets, GitHub Secrets
- [x] Secrets aus wrangler.toml ausgelagert: THEO_EMAIL + THEO_PHONE als Worker Secrets / .dev.vars
- [x] Lightbox für Bilder: Klick auf Bild zeigt es in Vollansicht (mit Schließen per Klick oder Escape-Taste)
- [x] Lokale Entwicklungsumgebung aufgesetzt (wrangler dev mit lokalen Testbildern via R2-Emulation)
- [x] Redesign TheoPage: ID-Card-Style, adesso-Blau, Spitznamen, Snack, Lightbox, Altersanzeige mit Tagen
- [x] Scan-Zahlen im Stats-Header (Anzahl Scans pro Badge sichtbar auf der Seite)
- [x] Zufällige Bildauswahl mit echter Zufälligkeit (crypto.getRandomValues + Fisher-Yates)
- [x] Grundstruktur mit Hono.js + TypeScript aufgesetzt
- [x] Route /theo/:badge (adesso, nemetschek)
- [x] Scan-Tracking mit D1 und IP-Hash-Deduplizierung
- [x] Bild-Proxy für privaten R2 Bucket
- [x] TheoPage UI Komponente
- [x] D1 Migrations-SQL
- [x] wrangler.toml mit D1 + R2 Bindings
- [x] Mehrsprachigkeit (Deutsch + Englisch) – über URL-Parameter ?lang=en, Sprachumschalter auf der Seite
- [x] Stats-Header: QR-Scans vs. direkte Aufrufe (neue /theo Route, source-Spalte in D1, Banner auf der Seite)
