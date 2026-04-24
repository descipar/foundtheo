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

  // ── Like-System ──────────────────────────────────────────────────────────────

  /** Liest die gelikten Bild-Keys aus localStorage. */
  function getLikedSet() {
    try {
      var raw = localStorage.getItem('theo_liked_images');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch(e) { return new Set(); }
  }

  /** Speichert den aktualisierten Set in localStorage. */
  function saveLikedSet(set) {
    try {
      localStorage.setItem('theo_liked_images', JSON.stringify(Array.from(set)));
    } catch(e) {}
  }

  /**
   * Erstellt den Like/Unlike-Toggle-Button für einen Wrapper und hängt ihn ein.
   * Einfaches Toggle: Like → Unlike → Like … – jederzeit, auch nach Reload.
   */
  function attachLikeButton(wrapper, imgKey, count, likedSet) {
    var isLiked = likedSet.has(imgKey);

    var btn = document.createElement('button');
    btn.className = 'like-btn' + (isLiked ? ' liked' : '');
    btn.title = isLiked ? 'Like zurücknehmen' : 'Bild liken';
    btn.innerHTML =
      '<span class="like-heart">' + (isLiked ? '❤️' : '🤍') + '</span>' +
      '<span class="like-count">' + (count > 0 ? count : '') + '</span>';

    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Lightbox nicht öffnen

      var heart   = btn.querySelector('.like-heart');
      var counter = btn.querySelector('.like-count');
      var current = parseInt(counter.textContent || '0', 10) || 0;
      var set     = getLikedSet();

      if (!btn.classList.contains('liked')) {
        // ── LIKE ──
        set.add(imgKey);
        saveLikedSet(set);

        btn.classList.add('liked', 'pop');
        heart.textContent = '❤️';
        counter.textContent = current + 1 > 0 ? String(current + 1) : '';
        btn.title = 'Like zurücknehmen';
        setTimeout(function() { btn.classList.remove('pop'); }, 400);

        fetch('/api/like/' + encodeURIComponent(imgKey), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data && typeof data.cnt === 'number') {
              counter.textContent = data.cnt > 0 ? String(data.cnt) : '';
            }
          })
          .catch(function() {});

      } else {
        // ── UNLIKE ──
        set.delete(imgKey);
        saveLikedSet(set);

        btn.classList.remove('liked');
        heart.textContent = '🤍';
        counter.textContent = current - 1 > 0 ? String(current - 1) : '';
        btn.title = 'Bild liken';

        fetch('/api/unlike/' + encodeURIComponent(imgKey), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data && typeof data.cnt === 'number') {
              counter.textContent = data.cnt > 0 ? String(data.cnt) : '';
            }
          })
          .catch(function() {});
      }
    });

    wrapper.appendChild(btn);
  }

  /**
   * Initialisiert alle Like-Buttons auf der Seite.
   * Läuft nach dem DOM-Ready – IMAGE_LIKES kommt vom Server.
   */
  function initLikes() {
    var likedSet = getLikedSet();
    var likes = (typeof IMAGE_LIKES !== 'undefined') ? IMAGE_LIKES : {};

    document.querySelectorAll('.img-like-wrapper[data-img-key]').forEach(function(wrapper) {
      var imgKey = wrapper.getAttribute('data-img-key');
      if (!imgKey) return;
      var count = likes[imgKey] || 0;
      attachLikeButton(wrapper, imgKey, count, likedSet);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLikes);
  } else {
    initLikes();
  }
`;
