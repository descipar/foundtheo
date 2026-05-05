export interface ScanEvent {
  badge: string;
  source: "qr" | "direct";
  country: string | null;
  city: string | null;
  ua: string | null;
}

/**
 * Sendet eine Scan-Benachrichtigung per Resend API.
 * Voraussetzung: Domain foundtheo.de in Resend verifiziert,
 *               Secret RESEND_API_KEY via `wrangler secret put RESEND_API_KEY` gesetzt.
 * Schlägt still fehl – kein Seitencrash bei API-Fehler.
 */
export async function sendScanNotification(
  apiKey: string,
  toEmail: string,
  event: ScanEvent
): Promise<void> {
  const location = [event.city, event.country].filter(Boolean).join(", ") || "Unbekannt";
  const time = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
  const badgeDisplay = event.badge === "direct" ? "Direktaufruf" : `Badge: ${event.badge}`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:1.5rem">
      <h2 style="color:#0060AF;margin:0 0 1rem">🐾 Theo wurde gescannt!</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:0.4rem 0;color:#888;font-size:0.85rem;width:6rem">Badge</td>
          <td style="font-weight:700">${badgeDisplay}</td>
        </tr>
        <tr>
          <td style="padding:0.4rem 0;color:#888;font-size:0.85rem">Zeitpunkt</td>
          <td>${time}</td>
        </tr>
        <tr>
          <td style="padding:0.4rem 0;color:#888;font-size:0.85rem">Standort</td>
          <td>${location}</td>
        </tr>
        ${event.ua
          ? `<tr>
               <td style="padding:0.4rem 0;color:#888;font-size:0.85rem;vertical-align:top">Gerät</td>
               <td style="font-size:0.8rem;color:#555;word-break:break-all">${event.ua.slice(0, 200)}</td>
             </tr>`
          : ""}
      </table>
      <p style="margin-top:1.5rem">
        <a href="https://foundtheo.de/admin" style="color:#0060AF">→ Admin-Dashboard</a>
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Foundtheo <noreply@foundtheo.de>",
        to: [toEmail],
        subject: `🐾 Theo gescannt! (${badgeDisplay})`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("sendScanNotification: Resend API error", res.status, await res.text());
    }
  } catch (err) {
    console.error("sendScanNotification: fetch failed", err);
  }
}
