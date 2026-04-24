/** @jsxImportSource hono/jsx */
import type { AdminStats } from "../db/scans";
import { adminStyles } from "../styles/adminStyles";

interface Props {
  stats: AdminStats;
  deletedMsg: string | null;
}

/** ISO 3166-1 Alpha-2 → Emoji-Flagge */
const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭", US: "🇺🇸", GB: "🇬🇧",
  FR: "🇫🇷", NL: "🇳🇱", PL: "🇵🇱", IT: "🇮🇹", ES: "🇪🇸",
};

function countryFlag(code: string): string {
  return COUNTRY_FLAGS[code] ?? "🌍";
}

function badgeLabel(id: string): string {
  if (id === "adesso")     return "🔵 adesso";
  if (id === "nemetschek") return "🟦 Nemetschek";
  if (id === "direct")     return "🌐 Direkt";
  return id;
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div class="stat-card">
      <div class="stat-card__value">{value}</div>
      <div class="stat-card__label">{label}</div>
    </div>
  );
}

function BarChart({ days }: { days: { day: string; cnt: number }[] }) {
  if (days.length === 0) {
    return <p class="panel--empty">Keine Daten</p>;
  }
  const maxCnt = Math.max(...days.map((d) => d.cnt), 1);
  return (
    <>
      {days.map((d) => (
        <div class="bar-row">
          <span class="bar-row__label">{d.day.slice(5)}</span>
          <div class="bar-row__outer">
            <div
              class="bar-row__inner"
              style={`width:${Math.round((d.cnt / maxCnt) * 100)}%`}
            />
          </div>
          <span class="bar-row__count">{d.cnt}</span>
        </div>
      ))}
    </>
  );
}

function StatsTable({
  rows,
  columns,
}: {
  rows: Record<string, string | number>[];
  columns: { key: string; label: string; numeric?: boolean }[];
}) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr>
            {columns.map((col) => (
              <td class={col.numeric ? "num" : ""}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Formular zum Löschen von Scans – alle oder nach Badge */
function DeletePanel({ badges }: { badges: string[] }) {
  return (
    <div class="panel panel--danger">
      <h2>Scans löschen</h2>
      <div class="delete-row">
        {/* Alle löschen */}
        <form method="post" action="/admin/delete" class="delete-form"
          onsubmit="return confirm('Wirklich ALLE Scans löschen?')">
          <button type="submit" class="btn btn--danger">Alle löschen</button>
        </form>

        {/* Nach Badge löschen */}
        {badges.map((badge) => (
          <form method="post" action="/admin/delete" class="delete-form"
            onsubmit={`return confirm('Alle Scans für „${badge}" löschen?')`}>
            <input type="hidden" name="badge_id" value={badge} />
            <button type="submit" class="btn btn--warning">
              {badgeLabel(badge)} löschen
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminPage({ stats, deletedMsg }: Props) {
  const topCountry = stats.topCountries[0];

  const badgeRows = stats.byBadge.map((b) => ({
    badge: badgeLabel(b.badge_id),
    cnt: b.cnt,
  }));

  const sourceRows = stats.bySource.map((s) => ({
    source: s.source === "qr" ? "📷 QR-Scan" : "🌐 Direktaufruf",
    cnt: s.cnt,
  }));

  const countryRows = stats.topCountries.map((c) => ({
    country: `${countryFlag(c.country)} ${c.country}`,
    cnt: c.cnt,
  }));

  const cityRows = stats.topCities.map((c) => ({
    city: `${countryFlag(c.country)} ${c.city}`,
    cnt: c.cnt,
  }));

  return (
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>foundtheo – Admin</title>
        <style>{adminStyles}</style>
      </head>
      <body>

        <div class="admin-header">
          <h1>🐾 foundtheo Admin</h1>
          <div class="admin-header-actions">
            <a class="admin-link" href="/">← Zur Hauptseite</a>
            <a class="admin-logout" href="/admin/logout">Abmelden</a>
          </div>
        </div>

        {/* Bestätigungsmeldung nach Löschvorgang */}
        {deletedMsg && (
          <div class="alert alert--success">{deletedMsg}</div>
        )}

        {/* Kennzahlen */}
        <div class="stat-grid">
          <StatCard value={stats.totalScans} label="Scans gesamt" />
          {stats.byBadge.map((b) => (
            <StatCard value={b.cnt} label={badgeLabel(b.badge_id)} />
          ))}
          {topCountry && (
            <StatCard
              value={`${countryFlag(topCountry.country)} ${topCountry.country}`}
              label="Häufigstes Land"
            />
          )}
        </div>

        {/* Verlauf */}
        <div class="panel">
          <h2>Scans – letzte 30 Tage</h2>
          <BarChart days={stats.last30Days} />
        </div>

        {/* Badge & Quelle */}
        <div class="panel-row">
          <div class="panel">
            <h2>Nach Badge</h2>
            <StatsTable
              rows={badgeRows}
              columns={[
                { key: "badge", label: "Badge" },
                { key: "cnt",   label: "Scans", numeric: true },
              ]}
            />
          </div>
          <div class="panel">
            <h2>Nach Quelle</h2>
            <StatsTable
              rows={sourceRows}
              columns={[
                { key: "source", label: "Quelle" },
                { key: "cnt",    label: "Scans", numeric: true },
              ]}
            />
          </div>
        </div>

        {/* Geo */}
        <div class="panel-row">
          <div class="panel">
            <h2>Top Länder</h2>
            <StatsTable
              rows={countryRows}
              columns={[
                { key: "country", label: "Land" },
                { key: "cnt",     label: "Scans", numeric: true },
              ]}
            />
          </div>
          <div class="panel">
            <h2>Top Städte</h2>
            <StatsTable
              rows={cityRows}
              columns={[
                { key: "city", label: "Stadt" },
                { key: "cnt",  label: "Scans", numeric: true },
              ]}
            />
          </div>
        </div>

        {/* Scan-Verwaltung – immer alle Badge-Typen anzeigen */}
        <DeletePanel badges={["adesso", "nemetschek", "direct"]} />

      </body>
    </html>
  );
}
