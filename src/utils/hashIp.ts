/**
 * Pseudonymisiert eine IP-Adresse per HMAC-SHA256 mit geheimem Schlüssel.
 *
 * Ein reiner SHA-256-Hash ist bei IPv4 (nur ~4 Mrd. mögliche Werte) in kurzer Zeit
 * per Brute-Force umkehrbar. Mit dem geheimen Schlüssel (`IP_HASH_SECRET`) ist das
 * ohne Kenntnis des Secrets nicht mehr möglich.
 *
 * Ohne Secret wird bewusst KEIN Hash erzeugt (null) – dann greift nur die
 * Cookie-Deduplizierung, aber es landet nichts Rückrechenbares in D1.
 */
export async function hashIp(ip: string | null, secret: string | undefined): Promise<string | null> {
  if (!ip) return null;
  if (!secret) {
    console.warn("hashIp: IP_HASH_SECRET nicht gesetzt – IP wird nicht gespeichert");
    return null;
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(ip));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
