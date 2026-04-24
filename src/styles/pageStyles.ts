/**
 * Globale CSS-Styles für die TheoPage.
 * Alle Farben referenzieren CSS Custom Properties (--color-primary etc.),
 * die in TheoPage.tsx per :root gesetzt werden.
 */
export const pageStyles = `
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
  .stats-counts span[data-theme] { cursor: pointer; }
  .stats-counts span[data-theme]:hover { background: var(--color-primary-border); }
  .stats-counts span[data-theme].active-theme { background: var(--color-primary); color: #fff; }
  .stats-counts span[data-theme].active-theme strong { color: #fff; }
  .stats-counts strong { color: var(--color-primary); font-weight: 700; transition: color 0.3s; }
  .stats-counts img { height: 14px; width: auto; object-fit: contain; }
  .stats-hint {
    font-size: 0.6rem;
    color: var(--color-primary);
    opacity: 0.5;
    margin-top: 0.3rem;
    letter-spacing: 0.02em;
  }

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
  .lang-switch a.active { background: var(--color-primary); color: #fff; }

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
  .contact-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
  .contact a {
    display: block;
    text-decoration: none;
    padding: 0.65rem 1.25rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .contact a.primary { background: var(--color-primary); color: #fff; }
  .contact a.primary:hover { background: var(--color-primary-dark); }
  .contact a.secondary { background: #fff; color: var(--color-primary); border: 1.5px solid var(--color-primary); }
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
  .card-footer-logo { display: flex; align-items: center; gap: 0.4rem; }
  .card-footer img { height: 18px; filter: brightness(0) invert(1); opacity: 0.9; }
  .card-footer-paw { font-size: 1rem; opacity: 0.7; }

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
`;
