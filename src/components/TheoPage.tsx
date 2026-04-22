/** @jsxImportSource hono/jsx */
import { type Lang, translations } from "../i18n/translations";
import type { ScanStats } from "../db/scans";
import { themes, type BadgeTheme } from "../themes";

interface Props {
  name: string;
  breed: string;
  title: string;
  badgeNr: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  email: string;
  phone: string;
  imageKeys: string[];
  badge: string;
  theme: BadgeTheme;
  lang: Lang;
  stats: ScanStats;
}

function calcAge(birthDate: string): { years: number; months: number; days: number } {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

export function TheoPage({ name, breed, title, badgeNr, ageYears, ageMonths, ageDays, email, phone, imageKeys, theme, lang, stats }: Props) {
  const t = translations[lang];
  const ageText = t.age(ageYears, ageMonths, ageDays);
  const [heroKey, ...thumbKeys] = imageKeys;

  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t.pageTitle(name)}</title>
        <style>{`
          :root {
            --color-primary:       ${theme.primary};
            --color-primary-dark:  ${theme.primaryDark};
            --color-primary-light: ${theme.primaryLight};
            --color-primary-border:${theme.primaryBorder};
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            background: #f0f4f8;
            color: #111;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem 3rem;
          }

          /* ── Page header ── */
          .page-header {
            max-width: 460px;
            width: 100%;
            margin-bottom: 1rem;
            text-align: center;
          }
          .page-header h1 {
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: -0.02em;
            color: var(--color-primary);
            text-transform: uppercase;
            line-height: 1.1;
          }
          .page-header p {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.3rem;
            font-style: italic;
          }

          /* ── Card ── */
          .card {
            background: #fff;
            border-radius: 1.25rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
            max-width: 460px;
            width: 100%;
            overflow: hidden;
          }

          /* ── ID card header strip ── */
          .id-header {
            background: var(--color-primary);
            padding: 1rem 1.25rem 0.875rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            transition: background 0.3s;
          }
          .id-name { color: #fff; }
          .id-name .name {
            font-size: 1.6rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1;
          }
          .id-name .job-title {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.8);
            margin-top: 0.2rem;
          }
          .id-badge-nr {
            background: rgba(255,255,255,0.18);
            color: #fff;
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            letter-spacing: 0.04em;
            align-self: flex-end;
          }

          /* ── Stats bar ── */
          .stats-bar {
            background: var(--color-primary-light);
            border-bottom: 1px solid var(--color-primary-border);
            padding: 0.5rem 1rem 0.6rem;
            text-align: center;
            transition: background 0.3s;
          }
          .stats-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: var(--color-primary);
            font-weight: 600;
            margin-bottom: 0.35rem;
            transition: color 0.3s;
          }
          .stats-counts {
            display: flex;
            justify-content: center;
            gap: 1.25rem;
          }
          .stats-counts span {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.82rem;
            color: #555;
            border-radius: 999px;
            padding: 0.2rem 0.5rem;
            transition: background 0.15s;
          }
          .stats-counts span[data-theme] {
            cursor: pointer;
          }
          .stats-counts span[data-theme]:hover {
            background: var(--color-primary-border);
          }
          .stats-counts span[data-theme].active-theme {
            background: var(--color-primary);
            color: #fff;
          }
          .stats-counts span[data-theme].active-theme strong {
            color: #fff;
          }
          .stats-counts strong { color: var(--color-primary); font-weight: 700; transition: color 0.3s; }
          .stats-counts img { height: 14px; width: auto; object-fit: contain; }

          /* ── Lang switch ── */
          .lang-switch {
            display: flex;
            justify-content: flex-end;
            gap: 0.4rem;
            padding: 0.5rem 0.9rem 0;
            font-size: 0.75rem;
          }
          .lang-switch a {
            color: #aaa;
            text-decoration: none;
            font-weight: 600;
            padding: 0.2rem 0.5rem;
            border-radius: 999px;
            transition: background 0.15s, color 0.15s;
          }
          .lang-switch a.active {
            background: var(--color-primary);
            color: #fff;
          }

          /* ── Hero image ── */
          .hero {
            width: 100%;
            aspect-ratio: 4/3;
            object-fit: contain;
            background: #f0f4f8;
            display: block;
            cursor: zoom-in;
            margin-top: 0.5rem;
          }

          /* ── Thumbnails ── */
          .thumbs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3px;
            padding: 3px;
            background: #dde8f0;
          }
          .thumbs img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: contain;
            background: #f0f4f8;
            display: block;
            cursor: zoom-in;
            transition: opacity 0.15s;
          }
          .thumbs img:hover { opacity: 0.8; }

          /* ── Nicknames ── */
          .nicknames {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            padding: 0.875rem 1.25rem 0;
          }
          .nick-label {
            width: 100%;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #bbb;
            margin-bottom: 0.1rem;
          }
          .nick-badge {
            background: var(--color-primary-light);
            color: var(--color-primary);
            font-size: 0.78rem;
            padding: 0.22rem 0.65rem;
            border-radius: 999px;
            font-weight: 600;
            border: 1px solid var(--color-primary-border);
            transition: background 0.3s, color 0.3s;
          }

          /* ── Info rows ── */
          .info {
            padding: 0.5rem 1.25rem 0.25rem;
            margin-top: 0.5rem;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 0.45rem 0;
            border-bottom: 1px solid #f0f4f8;
            font-size: 0.9rem;
          }
          .info-row:last-child { border-bottom: none; }
          .info-label {
            color: #999;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .info-value { font-weight: 700; font-size: 0.92rem; color: #222; }

          /* ── Snack ── */
          .snack {
            padding: 0 1.25rem 0.75rem;
            font-size: 0.875rem;
            color: #555;
          }
          .snack-label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #bbb;
            margin-bottom: 0.2rem;
          }

          /* ── Contact ── */
          .contact {
            margin: 0.25rem 1.25rem 1.25rem;
            padding: 1rem;
            background: var(--color-primary-light);
            border-radius: 0.875rem;
            border: 1px solid var(--color-primary-border);
            text-align: center;
            transition: background 0.3s;
          }
          .contact p {
            font-size: 0.75rem;
            color: var(--color-primary);
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-weight: 600;
            transition: color 0.3s;
          }
          .contact-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .contact a {
            display: block;
            text-decoration: none;
            padding: 0.65rem 1.25rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: 0.9rem;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
          }
          .contact a.primary {
            background: var(--color-primary);
            color: #fff;
          }
          .contact a.primary:hover { background: var(--color-primary-dark); }
          .contact a.secondary {
            background: #fff;
            color: var(--color-primary);
            border: 1.5px solid var(--color-primary);
          }
          .contact a.secondary:hover { background: var(--color-primary); color: #fff; }

          /* ── Footer ── */
          .card-footer {
            background: var(--color-primary);
            padding: 0.6rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.3s;
          }
          .card-footer-logo {
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .card-footer img {
            height: 18px;
            filter: brightness(0) invert(1);
            opacity: 0.9;
          }
          .card-footer-paw {
            font-size: 1rem;
            opacity: 0.7;
          }

          /* ── Lightbox ── */
          .lightbox {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.92);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
          }
          .lightbox.open { display: flex; }
          .lightbox img {
            max-width: 92vw;
            max-height: 92vh;
            object-fit: contain;
            border-radius: 0.5rem;
          }
          .lightbox-close {
            position: absolute;
            top: 1rem;
            right: 1.25rem;
            color: white;
            font-size: 1.75rem;
            cursor: pointer;
            user-select: none;
            line-height: 1;
          }
        `}</style>
      </head>
      <body>

        {/* Page header */}
        <div class="page-header">
          <h1>{lang === "de" ? `${name} wurde gefunden!` : `${name} was found!`}</h1>
        </div>

        <div class="card">

          {/* ID card header strip */}
          <div class="id-header">
            <div class="id-name">
              <div class="name">{name}</div>
              <div class="job-title">{title}</div>
            </div>
            <div class="id-badge-nr">#{badgeNr}</div>
          </div>

          {/* Stats bar */}
          <div class="stats-bar">
            <div class="stats-label">
              {lang === "de" ? "So oft wurde ich schon gefunden" : "Times I've been found"}
            </div>
            <div class="stats-counts">
              <span data-theme="adesso" class={theme.badgeLabel === "adesso" ? "active-theme" : ""} onclick="switchTheme('adesso')" title={lang === "de" ? "adesso-Design" : "adesso design"}>
                <img src="/public/logos/adesso.svg" alt="adesso" onerror="this.outerHTML='adesso'" />
                <strong>{stats.adesso}</strong>
              </span>
              <span data-theme="nemetschek" class={theme.badgeLabel === "Nemetschek" ? "active-theme" : ""} onclick="switchTheme('nemetschek')" title={lang === "de" ? "Nemetschek-Design" : "Nemetschek design"}>
                <img src="/public/logos/nemetschek.svg" alt="Nemetschek" onerror="this.outerHTML='Nemetschek'" />
                <strong>{stats.nemetschek}</strong>
              </span>
              <span>🌐 <strong>{stats.direct}</strong></span>
            </div>
          </div>

          {/* Lang switch */}
          <div class="lang-switch">
            <a href="?lang=de" class={lang === "de" ? "active" : ""}>DE</a>
            <a href="?lang=en" class={lang === "en" ? "active" : ""}>EN</a>
          </div>

          {/* Hero image */}
          {heroKey && (
            <img
              class="hero"
              src={`/api/images/${encodeURIComponent(heroKey)}`}
              alt={t.imgAlt(name)}
              onclick="openLightbox(this.src)"
            />
          )}

          {/* Thumbnails */}
          {thumbKeys.length > 0 && (
            <div class="thumbs">
              {thumbKeys.map((key) => (
                <img
                  src={`/api/images/${encodeURIComponent(key)}`}
                  alt={t.imgAlt(name)}
                  loading="lazy"
                  onclick="openLightbox(this.src)"
                />
              ))}
            </div>
          )}

          {/* Nicknames */}
          <div class="nicknames">
            <span class="nick-label">{lang === "de" ? "Spitznamen" : "Nicknames"}</span>
            <span class="nick-badge">🤗 Kuschelbacke</span>
            <span class="nick-badge">💥 Bollerkopf</span>
          </div>

          {/* Info */}
          <div class="info">
            <div class="info-row">
              <span class="info-label">{t.labelBreed}</span>
              <span class="info-value">{breed}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{t.labelAge}</span>
              <span class="info-value">{ageText}</span>
            </div>
          </div>

          {/* Snack */}
          <div class="snack">
            <div class="snack-label">🦴 {lang === "de" ? "Lieblingssnack" : "Favourite snack"}</div>
            {lang === "de" ? "Alles was man lange kauen kann" : "Anything that takes forever to chew"}
          </div>

          {/* Contact */}
          <div class="contact">
            <p>{t.contactPrompt}</p>
            <div class="contact-buttons">
              <a class="primary" href={`tel:${phone.replace(/\s/g, "")}`}>📞 {phone}</a>
              <a class="secondary" href={`mailto:${email}?subject=${t.contactSubject(name)}`}>✉ {email}</a>
            </div>
          </div>

          {/* Footer strip */}
          <div class="card-footer">
            <div class="card-footer-logo">
              <img id="footer-logo" src={theme.logoPath || ""} alt={theme.logoAlt} style={theme.logoPath ? "" : "display:none"} onerror="this.style.display='none'" />
            </div>
            <div class="card-footer-paw">🐾</div>
          </div>
        </div>

        {/* Lightbox */}
        <div class="lightbox" id="lightbox" onclick="closeLightbox()">
          <span class="lightbox-close" onclick="closeLightbox()">✕</span>
          <img id="lightbox-img" src="" alt={t.imgAlt(name)} />
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          var THEMES = {
            adesso: {
              primary:       '${themes.adesso.primary}',
              primaryDark:   '${themes.adesso.primaryDark}',
              primaryLight:  '${themes.adesso.primaryLight}',
              primaryBorder: '${themes.adesso.primaryBorder}',
              logoPath:      '${themes.adesso.logoPath}',
              logoAlt:       '${themes.adesso.logoAlt}',
            },
            nemetschek: {
              primary:       '${themes.nemetschek.primary}',
              primaryDark:   '${themes.nemetschek.primaryDark}',
              primaryLight:  '${themes.nemetschek.primaryLight}',
              primaryBorder: '${themes.nemetschek.primaryBorder}',
              logoPath:      '${themes.nemetschek.logoPath}',
              logoAlt:       '${themes.nemetschek.logoAlt}',
            },
          };

          function switchTheme(themeKey) {
            var t = THEMES[themeKey];
            if (!t) return;
            var root = document.documentElement;
            root.style.setProperty('--color-primary',        t.primary);
            root.style.setProperty('--color-primary-dark',   t.primaryDark);
            root.style.setProperty('--color-primary-light',  t.primaryLight);
            root.style.setProperty('--color-primary-border', t.primaryBorder);

            // Footer-Logo tauschen
            var logo = document.getElementById('footer-logo');
            if (logo) {
              if (t.logoPath) {
                logo.src = t.logoPath;
                logo.alt = t.logoAlt;
                logo.style.display = '';
              } else {
                logo.style.display = 'none';
              }
            }

            // Aktiven Stats-Span markieren
            document.querySelectorAll('.stats-counts span[data-theme]').forEach(function(el) {
              el.classList.toggle('active-theme', el.getAttribute('data-theme') === themeKey);
            });
          }

          function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.add('open');
          }
          function closeLightbox() {
            document.getElementById('lightbox').classList.remove('open');
          }
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeLightbox();
          });
        `}} />
      </body>
    </html>
  );
}

export { calcAge };
