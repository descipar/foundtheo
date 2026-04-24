/** @jsxImportSource hono/jsx */
import { type Lang, translations } from "../i18n/translations";
import type { ScanStats } from "../db/scans";
import type { BadgeTheme } from "../themes";
import { pageStyles } from "../styles/pageStyles";
import { clientScript } from "../scripts/clientScript";
import { IdHeader } from "./IdHeader";
import { StatsBar } from "./StatsBar";
import { ImageGallery } from "./ImageGallery";
import { ContactCard } from "./ContactCard";
import { CardFooter } from "./CardFooter";

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
            --color-primary:        ${theme.primary};
            --color-primary-dark:   ${theme.primaryDark};
            --color-primary-light:  ${theme.primaryLight};
            --color-primary-border: ${theme.primaryBorder};
          }
          ${pageStyles}
        `}</style>
      </head>
      <body>

        <div class="page-header">
          <h1>{lang === "de" ? `${name} wurde gefunden!` : `${name} was found!`}</h1>
        </div>

        <div class="card">
          <IdHeader name={name} title={title} badgeNr={badgeNr} />

          <StatsBar stats={stats} theme={theme} lang={lang} />

          <div class="lang-switch">
            <a href="?lang=de" class={lang === "de" ? "active" : ""}>DE</a>
            <a href="?lang=en" class={lang === "en" ? "active" : ""}>EN</a>
          </div>

          <ImageGallery heroKey={heroKey} thumbKeys={thumbKeys} imgAlt={t.imgAlt(name)} photoHint={t.photoHint} />

          <div class="nicknames">
            <span class="nick-label">{lang === "de" ? "Spitznamen" : "Nicknames"}</span>
            <span class="nick-badge">🤗 Kuschelbacke</span>
            <span class="nick-badge">💥 Bollerkopf</span>
            <span class="nick-badge">🐭 Meusel</span>
            <span class="nick-badge">🐭 Maus</span>
            <span class="nick-badge">🎩 Mister</span>
            <span class="nick-badge">🎻 Theolinski</span>
          </div>

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

          <div class="info">
            <div class="info-row">
              <span class="info-label">🦴 {lang === "de" ? "Lieblingssnack" : "Favourite snack"}</span>
              <span class="info-value">{lang === "de" ? "Rinderkopfhaut" : "Beef scalp"}</span>
            </div>
          </div>

          <ContactCard
            phone={phone}
            email={email}
            contactPrompt={t.contactPrompt}
            contactSubject={t.contactSubject(name)}
          />

          <CardFooter theme={theme} />
        </div>

        <script dangerouslySetInnerHTML={{ __html: clientScript }} />
      </body>
    </html>
  );
}

export { calcAge } from "../utils/calcAge";
