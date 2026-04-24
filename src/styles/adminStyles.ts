/**
 * CSS-Styles für das Admin-Dashboard.
 * Alle Farben sind hart kodiert (kein Theme-Switching nötig).
 */
export const adminStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f4f8;
    color: #111;
    padding: 2rem 1rem;
  }

  /* ── Header ── */
  .admin-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .admin-header h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1A3C6B;
  }
  .admin-logout {
    font-size: 0.75rem;
    color: #aaa;
    text-decoration: none;
  }
  .admin-logout:hover { color: #555; }

  /* ── Section headings ── */
  h2 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #888;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  /* ── Summary cards ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 1rem 1.25rem;
  }
  .stat-card__value {
    font-size: 2rem;
    font-weight: 800;
    color: #1A3C6B;
    line-height: 1;
  }
  .stat-card__label {
    font-size: 0.72rem;
    color: #999;
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Generic section panel ── */
  .panel {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
  .panel--empty {
    font-size: 0.85rem;
    color: #bbb;
  }

  /* ── Two-column layout ── */
  .panel-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  th {
    text-align: left;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #aaa;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  td {
    padding: 0.5rem 0;
    border-bottom: 1px solid #f8f8f8;
    color: #333;
  }
  tr:last-child td { border-bottom: none; }
  td.num {
    text-align: right;
    font-weight: 700;
    color: #1A3C6B;
  }

  /* ── Bar chart ── */
  .bar-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
  }
  .bar-row__label {
    font-size: 0.65rem;
    color: #aaa;
    width: 3.5rem;
    flex-shrink: 0;
    text-align: right;
  }
  .bar-row__outer {
    flex: 1;
    background: #f0f4f8;
    border-radius: 999px;
    height: 10px;
    overflow: hidden;
  }
  .bar-row__inner {
    background: #1A3C6B;
    height: 100%;
    border-radius: 999px;
  }
  .bar-row__count {
    font-size: 0.7rem;
    font-weight: 700;
    color: #1A3C6B;
    width: 1.5rem;
  }
`;
