import { themes } from "../themes";

/**
 * Client-seitiges JavaScript als String – wird inline in die Seite eingebettet.
 * Enthält: Theme-Switching (ohne Server-Request), Lightbox-Steuerung.
 */
export const clientScript = `
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
    direct: {
      primary:       '${themes.direct.primary}',
      primaryDark:   '${themes.direct.primaryDark}',
      primaryLight:  '${themes.direct.primaryLight}',
      primaryBorder: '${themes.direct.primaryBorder}',
      logoPath:      '${themes.direct.logoPath}',
      logoAlt:       '${themes.direct.logoAlt}',
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
