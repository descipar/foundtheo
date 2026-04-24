import { themes } from "../themes";

/**
 * Client-seitiges JavaScript als String – wird inline in die Seite eingebettet.
 * Enthält: Theme-Switching (ohne Server-Request), Lightbox-Steuerung.
 *
 * Die Theme-Daten werden einmalig aus themes.ts serialisiert – keine Duplikation.
 */

// Nur die für den Client relevanten Felder aus themes.ts extrahieren
const clientThemes = Object.fromEntries(
  Object.entries(themes).map(([key, t]) => [
    key,
    {
      primary:       t.primary,
      primaryDark:   t.primaryDark,
      primaryLight:  t.primaryLight,
      primaryBorder: t.primaryBorder,
      logoPath:      t.logoPath,
      logoAlt:       t.logoAlt,
    },
  ])
);

export const clientScript = `
  var THEMES = ${JSON.stringify(clientThemes)};

  /**
   * Wechselt das aktive Theme per CSS Custom Properties.
   * Wird durch Klick auf einen Badge-Button in der StatsBar ausgelöst.
   */
  function switchTheme(themeKey) {
    var t = THEMES[themeKey];
    if (!t) return;
    var root = document.documentElement;
    root.style.setProperty('--color-primary',        t.primary);
    root.style.setProperty('--color-primary-dark',   t.primaryDark);
    root.style.setProperty('--color-primary-light',  t.primaryLight);
    root.style.setProperty('--color-primary-border', t.primaryBorder);

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
`;
