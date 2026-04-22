# foundtheo – Änderungswünsche

## 🟡 Offen
<!-- Hier neue Tickets eintragen -->
- [ ] Cloudflare Production einrichten: D1 + R2 Bucket anlegen, `wrangler secret put THEO_EMAIL/THEO_PHONE`, GitHub Secrets für Deploy-Pipeline (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] Unit Tests einrichten (Vitest + @cloudflare/vitest-pool-workers) für: pickImages(), calcAge(), detectLang(), recordScan() Deduplizierung
- [ ] Integration Tests für Routen: /theo/:badge (200/404), /api/images/:key (Sicherheitscheck)
- [ ] Optional: Zusätzliche Route für Badge-Übersicht (z.B. `/theo/badges`) mit Links zu den einzelnen Badges
- [ ] Optional: Admin-Interface für Scan-Statistiken (z.B. Anzahl Scans pro Tag, beliebteste Badges, etc.)
- [ ] Optional: Bild-Upload Script für Production R2 Bucket (aktuell nur lokales Script vorhanden)
- [ ] Optional: Erweiterung der Datenbank um weitere Informationen (z.B. Scan-Standort, Gerätetyp, etc.) – natürlich unter Berücksichtigung der Privatsphäre

## ✅ Erledigt
- [x] Nemetschek-Theme: Farben auf Corporate Black/Charcoal (#1A1A1A) gesetzt
- [x] CSS auf CSS Custom Properties (--color-primary etc.) umgestellt – Theme wechselbar ohne Reload
- [x] Theme-Switching per Klick auf Scan-Zähler in Stats-Bar (ohne Scan zu erhöhen)
- [x] GitHub Version Control: .gitignore, initialer Commit, SSH-Push
- [x] GitHub Actions Deploy-Pipeline: automatisches Deploy bei Push auf main
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
