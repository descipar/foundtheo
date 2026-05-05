/** @jsxImportSource hono/jsx */
import type { ScanStats } from "../db/scans";
import { themes } from "../themes";
import { badgesStyles } from "../styles/badgesStyles";

interface Props {
  stats: ScanStats;
}

const BADGES = ["adesso", "nemetschek"] as const;

export function BadgesPage({ stats }: Props) {
  return (
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>foundtheo – Badge-Übersicht</title>
        <style>{badgesStyles}</style>
      </head>
      <body>

        <div class="page-header">
          <h1>🐾 Badge-Übersicht</h1>
          <p>Wähle einen Badge-Typ um Theos Seite zu öffnen</p>
        </div>

        <div class="badges-grid">
          {BADGES.map((badgeId) => {
            const theme = themes[badgeId];
            const count = stats[badgeId as keyof typeof stats] ?? 0;
            return (
              <a class="badge-card" href={`/theo/${badgeId}`}>
                <div
                  class="badge-card__header"
                  style={`background: ${theme.primary}`}
                >
                  <span class="badge-card__name">{theme.badgeLabel}</span>
                  <span class="badge-card__arrow">→</span>
                </div>
                <div class="badge-card__body">
                  <span class="badge-card__label">Badge-Typ</span>
                  <div style="text-align: right">
                    <div
                      class="badge-card__count"
                      style={`color: ${theme.primary}`}
                    >
                      {count}
                    </div>
                    <div class="badge-card__unit">Scans</div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <a class="back-link" href="/">← Zur Hauptseite</a>

      </body>
    </html>
  );
}
