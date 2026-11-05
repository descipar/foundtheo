-- Alte IP-Hashes waren ungesalzenes SHA-256 und damit per Brute-Force umkehrbar.
-- Seit Umstellung auf HMAC (IP_HASH_SECRET) sind sie ohnehin nicht mehr vergleichbar
-- und werden nur für die 12h-Deduplizierung gebraucht → entfernen.
UPDATE scans SET ip_hash = NULL WHERE ip_hash IS NOT NULL;
