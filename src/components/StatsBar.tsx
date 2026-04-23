/** @jsxImportSource hono/jsx */
import type { ScanStats } from "../db/scans";
import type { BadgeTheme } from "../themes";
import type { Lang } from "../i18n/translations";

interface Props {
  stats: ScanStats;
  theme: BadgeTheme;
  lang: Lang;
}

export function StatsBar({ stats, theme, lang }: Props) {
  return (
    <div class="stats-bar">
      <div class="stats-label">
        {lang === "de" ? "So oft wurde ich schon gefunden" : "Times I've been found"}
      </div>
      <div class="stats-counts">
        <span
          data-theme="adesso"
          class={theme.badgeLabel === "adesso" ? "active-theme" : ""}
          onclick="switchTheme('adesso')"
          title={lang === "de" ? "adesso-Design" : "adesso design"}
        >
          <img src="/public/logos/adesso.svg" alt="adesso" onerror="this.outerHTML='adesso'" />
          <strong>{stats.adesso}</strong>
        </span>
        <span
          data-theme="nemetschek"
          class={theme.badgeLabel === "Nemetschek" ? "active-theme" : ""}
          onclick="switchTheme('nemetschek')"
          title={lang === "de" ? "Nemetschek-Design" : "Nemetschek design"}
        >
          <img src="/public/logos/nemetschek.svg" alt="Nemetschek" onerror="this.outerHTML='Nemetschek'" />
          <strong>{stats.nemetschek}</strong>
        </span>
        <span>🌐 <strong>{stats.direct}</strong></span>
      </div>
    </div>
  );
}
