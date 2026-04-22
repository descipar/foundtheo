# foundtheo – Änderungswünsche

## 🟡 Offen
<!-- Hier neue Tickets eintragen -->
- [x] Lightbox für Bilder: Klick auf Bild zeigt es in Vollansicht (mit Schließen per Klick oder Escape-Taste)
- [x] Lokale Entwicklungsumgebung aufsetzen (npm install + wrangler dev mit lokalen Testbildern)
- [ ] Unit Tests einrichten (Vitest + @cloudflare/vitest-pool-workers) für: pickImages(), calcAge(), detectLang(), recordScan() Deduplizierung
- [ ] Integration Tests für Routen: /theo/:badge (200/404), /api/images/:key (Sicherheitscheck)
- [ ] Optional: Zusätzliche Route für Badge-Übersicht (z.B. `/theo/badges`) mit Links zu den einzelnen Badges
- [ ] Optional: Admin-Interface für Scan-Statistiken (z.B. Anzahl Scans pro Tag, beliebteste Badges, etc.)
- [ ] Optional: Automatischer Bild-Upload Script (z.B. `upload-images.ts`) für neue Bilder in den R2 Bucket
- [ ] Optional: Erweiterung der Datenbank um weitere Informationen (z.B. Scan-Standort, Gerätetyp, etc.) – natürlich unter Berücksichtigung der Privatsphäre 



## ✅ Erledigt
- [x] Nemetschek-Theme: Farben auf Corporate Black/Charcoal (#1A1A1A) gesetzt
- [x] CSS auf CSS Custom Properties (--color-primary etc.) umgestellt – Theme wechselbar ohne Reload
- [x] Theme-Switching per Klick auf Scan-Zähler in Stats-Bar (ohne Scan zu erhöhen)
- [x] Grundstruktur mit Hono.js + TypeScript aufgesetzt
- [x] Route /theo/:badge (adesso, nemetschek)
- [x] Scan-Tracking mit D1 und IP-Hash-Deduplizierung
- [x] Bild-Proxy für privaten R2 Bucket
- [x] Deterministische Bildauswahl (Seed aus dog_id + badge_id + Datum)
- [x] TheoPage UI Komponente
- [x] D1 Migrations-SQL
- [x] wrangler.toml mit D1 + R2 Bindings
- [x] Mehrsprachigkeit (Deutsch + Englisch) – über URL-Parameter ?lang=en, Sprachumschalter auf der Seite
- [x] Stats-Header: QR-Scans vs. direkte Aufrufe (neue /theo Route, source-Spalte in D1, Banner auf der Seite)
